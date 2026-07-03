import { and, asc, eq, inArray } from "drizzle-orm";

import { expense, expenseSplit, trip, tripMembership } from "@/db/schema";
import { newId, type AppDb } from "@/db/client";
import { HttpError } from "@/lib/http-error";
import { normalizeCurrencyCode, resolveSettlementAmount } from "@/lib/currency";
import {
  ensureMembershipBelongsToTrip,
  ensureTripAccess,
} from "@/services/access";

type SplitType = "equal_all" | "equal_selected" | "custom";

type ExpenseSplitInput = {
  membershipId: string;
  amount: number;
};

type ExpenseSplitCreateInput = {
  membershipId: string;
  amount: number;
};

const ensureUniqueMembershipIds = (splits: ExpenseSplitInput[]) => {
  const membershipIds = new Set<string>();

  for (const split of splits) {
    if (membershipIds.has(split.membershipId)) {
      throw new HttpError(400, "分攤成員不得重複");
    }

    membershipIds.add(split.membershipId);
  }
};

const ensureMembershipsBelongToTrip = async (
  db: AppDb,
  membershipIds: string[],
  tripId: string,
) => {
  const memberships = await db
    .select({ id: tripMembership.id })
    .from(tripMembership)
    .where(
      and(
        eq(tripMembership.tripId, tripId),
        inArray(tripMembership.id, membershipIds),
      ),
    );

  if (memberships.length !== membershipIds.length) {
    throw new HttpError(400, "分攤成員不屬於此旅程");
  }
};

const splitAmountEvenly = (
  amount: number,
  membershipIds: string[],
): ExpenseSplitCreateInput[] => {
  const baseAmount = Math.floor(amount / membershipIds.length);

  return membershipIds.map((membershipId) => ({
    membershipId,
    amount: baseAmount,
  }));
};

const buildExpenseSplits = async (data: {
  db: AppDb;
  tripId: string;
  amount: number;
  splitType: SplitType;
  splits?: ExpenseSplitInput[];
}): Promise<ExpenseSplitCreateInput[]> => {
  const { db, tripId, amount, splitType, splits } = data;

  if (splitType === "equal_all") {
    const memberships = await db
      .select({ id: tripMembership.id })
      .from(tripMembership)
      .where(eq(tripMembership.tripId, tripId))
      .orderBy(asc(tripMembership.createdAt));

    if (memberships.length === 0) {
      throw new HttpError(400, "旅程沒有可分攤成員");
    }

    return splitAmountEvenly(
      amount,
      memberships.map((membership) => membership.id),
    );
  }

  if (!splits?.length) {
    throw new HttpError(400, "請提供分攤資料");
  }

  ensureUniqueMembershipIds(splits);
  await ensureMembershipsBelongToTrip(
    db,
    splits.map((split) => split.membershipId),
    tripId,
  );

  if (splitType === "equal_selected") {
    return splitAmountEvenly(
      amount,
      splits.map((split) => split.membershipId),
    );
  }

  const splitTotal = splits.reduce((sum, split) => sum + split.amount, 0);

  if (splitTotal !== amount) {
    throw new HttpError(400, "自訂分攤金額總和必須等於支出金額");
  }

  return splits;
};

export const createExpense = async (data: {
  db: AppDb;
  tripId: string;
  title: string;
  amount: number;
  currency?: string;
  exchangeRateToBase?: number;
  date: Date;
  splitType: SplitType;
  payerMembershipId?: string;
  note?: string;
  splits?: ExpenseSplitInput[];
  userId: string;
}) => {
  const { db, userId, splits, currency, exchangeRateToBase, ...expenseData } = data;

  await ensureTripAccess(db, expenseData.tripId, userId);
  const currentTrip = await db.query.trip.findFirst({
    columns: { currency: true },
    where: eq(trip.id, expenseData.tripId),
  });

  if (!currentTrip) {
    throw new HttpError(404, "旅程不存在");
  }

  if (expenseData.payerMembershipId) {
    await ensureMembershipBelongsToTrip(
      db,
      expenseData.payerMembershipId,
      expenseData.tripId,
    );
  }

  const normalizedCurrency = normalizeCurrencyCode(currency ?? currentTrip.currency);
  const settlementRate = exchangeRateToBase ?? 1;

  if (normalizedCurrency !== currentTrip.currency && exchangeRateToBase === undefined) {
    throw new HttpError(400, "外幣記錄請提供匯率");
  }

  const settlementAmount = resolveSettlementAmount(
    expenseData.amount,
    settlementRate,
  );

  const expenseSplits = await buildExpenseSplits({
    db,
    tripId: expenseData.tripId,
    amount: settlementAmount,
    splitType: expenseData.splitType,
    splits,
  });

  const newExpense = {
    id: newId(),
    ...expenseData,
    currency: normalizedCurrency,
    exchangeRateToBase: settlementRate,
    settlementAmount,
  };
  await db.insert(expense).values(newExpense);

  const createdSplits = expenseSplits.map((split) => ({
    id: newId(),
    expenseId: newExpense.id,
    ...split,
  }));
  if (createdSplits.length > 0) {
    await db.insert(expenseSplit).values(createdSplits);
  }

  return { ...newExpense, splits: createdSplits };
};

export const getExpenses = async (db: AppDb, tripId: string, userId: string) => {
  await ensureTripAccess(db, tripId, userId);

  const expenses = await db
    .select()
    .from(expense)
    .where(eq(expense.tripId, tripId));
  const expenseIds = expenses.map((item) => item.id);
  const splits =
    expenseIds.length > 0
      ? await db
          .select()
          .from(expenseSplit)
          .where(inArray(expenseSplit.expenseId, expenseIds))
      : [];

  return expenses.map((item) => ({
    ...item,
    splits: splits.filter((split) => split.expenseId === item.id),
  }));
};

export const updateExpense = async (
  db: AppDb,
  expenseId: string,
  tripId: string,
  userId: string,
  data: {
    title?: string;
    amount?: number;
    currency?: string;
    exchangeRateToBase?: number;
    date?: Date;
    splitType?: SplitType;
    payerMembershipId?: string | null;
    note?: string | null;
    splits?: ExpenseSplitInput[];
  },
) => {
  await ensureTripAccess(db, tripId, userId);

  const currentTrip = await db.query.trip.findFirst({
    columns: { currency: true },
    where: eq(trip.id, tripId),
  });

  const currentExpense = await db.query.expense.findFirst({
    where: and(eq(expense.id, expenseId), eq(expense.tripId, tripId)),
  });

  if (!currentTrip || !currentExpense) {
    throw new HttpError(404, "費用不存在");
  }

  if (data.payerMembershipId) {
    await ensureMembershipBelongsToTrip(db, data.payerMembershipId, tripId);
  }

  const { splits, currency, exchangeRateToBase, ...expenseData } = data;
  const nextAmount = expenseData.amount ?? currentExpense.amount;
  const nextCurrency = normalizeCurrencyCode(
    currency ?? currentExpense.currency ?? currentTrip.currency,
  );
  const nextExchangeRateToBase =
    exchangeRateToBase ?? currentExpense.exchangeRateToBase ?? 1;
  const nextSplitType = expenseData.splitType ?? currentExpense.splitType;
  const shouldRebuildSplits =
    splits !== undefined ||
    expenseData.amount !== undefined ||
    expenseData.splitType !== undefined ||
    currency !== undefined ||
    exchangeRateToBase !== undefined;

  if (
    nextCurrency !== currentTrip.currency &&
    currency !== undefined &&
    exchangeRateToBase === undefined &&
    currentExpense.currency === currentTrip.currency
  ) {
    throw new HttpError(400, "外幣記錄請提供匯率");
  }

  const nextSettlementAmount = resolveSettlementAmount(
    nextAmount,
    nextExchangeRateToBase,
  );

  const expenseSplits = shouldRebuildSplits
    ? await buildExpenseSplits({
        db,
        tripId,
        amount: nextSettlementAmount,
        splitType: nextSplitType,
        splits,
      })
    : undefined;

  if (expenseSplits) {
    await db.delete(expenseSplit).where(eq(expenseSplit.expenseId, expenseId));
  }

  const [updatedExpense] = await db
    .update(expense)
    .set({
      ...expenseData,
      ...(currency !== undefined ? { currency: nextCurrency } : {}),
      ...(exchangeRateToBase !== undefined
        ? { exchangeRateToBase: nextExchangeRateToBase }
        : {}),
      ...(expenseData.amount !== undefined ||
      currency !== undefined ||
      exchangeRateToBase !== undefined
        ? { settlementAmount: nextSettlementAmount }
        : {}),
    })
    .where(eq(expense.id, expenseId))
    .returning();

  if (expenseSplits) {
    const createdSplits = expenseSplits.map((split) => ({
      id: newId(),
      expenseId,
      ...split,
    }));
    if (createdSplits.length > 0) {
      await db.insert(expenseSplit).values(createdSplits);
    }
    return { ...updatedExpense, splits: createdSplits };
  }

  const existingSplits = await db
    .select()
    .from(expenseSplit)
    .where(eq(expenseSplit.expenseId, expenseId));
  return { ...updatedExpense, splits: existingSplits };
};

export const deleteExpense = async (
  db: AppDb,
  expenseId: string,
  tripId: string,
  userId: string,
) => {
  await ensureTripAccess(db, tripId, userId);

  const currentExpense = await db.query.expense.findFirst({
    where: and(eq(expense.id, expenseId), eq(expense.tripId, tripId)),
  });

  if (!currentExpense) {
    throw new HttpError(404, "費用不存在");
  }

  const [deletedExpense] = await db
    .delete(expense)
    .where(eq(expense.id, expenseId))
    .returning();
  return deletedExpense;
};
