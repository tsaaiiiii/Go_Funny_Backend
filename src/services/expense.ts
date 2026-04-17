import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/http-error";
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
  membershipIds: string[],
  tripId: string,
) => {
  const memberships = await prisma.tripMembership.findMany({
    where: {
      tripId,
      id: { in: membershipIds },
    },
    select: { id: true },
  });

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
  tripId: string;
  amount: number;
  splitType: SplitType;
  splits?: ExpenseSplitInput[];
}): Promise<ExpenseSplitCreateInput[]> => {
  const { tripId, amount, splitType, splits } = data;

  if (splitType === "equal_all") {
    const memberships = await prisma.tripMembership.findMany({
      where: { tripId },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

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
  tripId: string;
  title: string;
  amount: number;
  date: Date;
  splitType: SplitType;
  payerMembershipId?: string;
  note?: string;
  splits?: ExpenseSplitInput[];
  userId: string;
}) => {
  const { userId, splits, ...expenseData } = data;

  await ensureTripAccess(expenseData.tripId, userId);

  if (expenseData.payerMembershipId) {
    await ensureMembershipBelongsToTrip(
      expenseData.payerMembershipId,
      expenseData.tripId,
    );
  }

  const expenseSplits = await buildExpenseSplits({
    tripId: expenseData.tripId,
    amount: expenseData.amount,
    splitType: expenseData.splitType,
    splits,
  });

  return await prisma.expense.create({
    data: {
      ...expenseData,
      splits: {
        create: expenseSplits,
      },
    },
    include: { splits: true },
  });
};

export const getExpenses = async (tripId: string, userId: string) => {
  await ensureTripAccess(tripId, userId);

  return await prisma.expense.findMany({
    where: { tripId },
    include: { splits: true },
  });
};

export const updateExpense = async (
  expenseId: string,
  tripId: string,
  userId: string,
  data: {
    title?: string;
    amount?: number;
    date?: Date;
    splitType?: SplitType;
    payerMembershipId?: string | null;
    note?: string | null;
    splits?: ExpenseSplitInput[];
  },
) => {
  await ensureTripAccess(tripId, userId);

  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      tripId,
    },
  });

  if (!expense) {
    throw new HttpError(404, "費用不存在");
  }

  if (data.payerMembershipId) {
    await ensureMembershipBelongsToTrip(data.payerMembershipId, tripId);
  }

  const { splits, ...expenseData } = data;
  const nextAmount = expenseData.amount ?? expense.amount;
  const nextSplitType = expenseData.splitType ?? expense.splitType;
  const shouldRebuildSplits =
    splits !== undefined ||
    expenseData.amount !== undefined ||
    expenseData.splitType !== undefined;

  const expenseSplits = shouldRebuildSplits
    ? await buildExpenseSplits({
        tripId,
        amount: nextAmount,
        splitType: nextSplitType,
        splits,
      })
    : undefined;

  return await prisma.$transaction(async (tx) => {
    if (expenseSplits) {
      await tx.expenseSplit.deleteMany({
        where: { expenseId },
      });
    }

    return tx.expense.update({
      where: { id: expenseId },
      data: {
        ...expenseData,
        ...(expenseSplits
          ? {
              splits: {
                create: expenseSplits,
              },
            }
          : {}),
      },
      include: { splits: true },
    });
  });
};

export const deleteExpense = async (
  expenseId: string,
  tripId: string,
  userId: string,
) => {
  await ensureTripAccess(tripId, userId);

  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      tripId,
    },
  });

  if (!expense) {
    throw new HttpError(404, "費用不存在");
  }

  return await prisma.expense.delete({
    where: { id: expenseId },
  });
};
