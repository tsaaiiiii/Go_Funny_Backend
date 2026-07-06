import { eq, inArray } from "drizzle-orm";

import {
  contribution,
  expense,
  expenseSplit,
  trip,
} from "@/db/schema";
import type { AppDb } from "@/db/client";
import { normalizeCurrencyCode } from "@/lib/currency";
import { ensureTripAccess } from "@/services/access";

type SettlementTransfer = {
  from: string;
  to: string;
  amount: number;
};

type SettlementGeneral = {
  transfers: SettlementTransfer[];
  unallocated: number;
  totalExpense: number;
};

type SettlementPool = {
  deposited: number;
  spent: number;
  balance: number;
};

type CurrencySettlementGroup = {
  currency: string;
  general: SettlementGeneral;
  pool: SettlementPool;
};

type CurrencyBalances = Record<string, number>;

type CurrencyState = {
  generalBalances: CurrencyBalances;
  generalUnallocated: number;
  generalTotalExpense: number;
  poolDeposited: number;
  poolSpent: number;
};

const getCurrencyState = (
  groups: Map<string, CurrencyState>,
  currency: string,
) => {
  const normalizedCurrency = normalizeCurrencyCode(currency);
  const existing = groups.get(normalizedCurrency);

  if (existing) {
    return existing;
  }

  const created: CurrencyState = {
    generalBalances: {},
    generalUnallocated: 0,
    generalTotalExpense: 0,
    poolDeposited: 0,
    poolSpent: 0,
  };
  groups.set(normalizedCurrency, created);
  return created;
};

const settleBalances = (balances: CurrencyBalances) => {
  const debtors: { membershipId: string; amount: number }[] = [];
  const creditors: { membershipId: string; amount: number }[] = [];

  for (const [membershipId, amount] of Object.entries(balances)) {
    if (amount < 0) debtors.push({ membershipId, amount: -amount });
    if (amount > 0) creditors.push({ membershipId, amount });
  }

  const transfers: SettlementTransfer[] = [];

  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const transferAmount = Math.min(
      debtors[debtorIndex].amount,
      creditors[creditorIndex].amount,
    );

    transfers.push({
      from: debtors[debtorIndex].membershipId,
      to: creditors[creditorIndex].membershipId,
      amount: transferAmount,
    });

    debtors[debtorIndex].amount -= transferAmount;
    creditors[creditorIndex].amount -= transferAmount;

    if (debtors[debtorIndex].amount === 0) debtorIndex++;
    if (creditors[creditorIndex].amount === 0) creditorIndex++;
  }

  return transfers;
};

const buildCurrencyGroups = (groups: Map<string, CurrencyState>) =>
  [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([currency, state]): CurrencySettlementGroup => ({
      currency,
      general: {
        transfers: settleBalances(state.generalBalances),
        unallocated: state.generalUnallocated,
        totalExpense: state.generalTotalExpense,
      },
      pool: {
        deposited: state.poolDeposited,
        spent: state.poolSpent,
        balance: state.poolDeposited - state.poolSpent,
      },
    }));

export const getSettlement = async (db: AppDb, tripId: string, userId: string) => {
  await ensureTripAccess(db, tripId, userId);

  const currentTrip = await db.query.trip.findFirst({
    where: eq(trip.id, tripId),
  });

  if (!currentTrip) {
    return null;
  }

  const groups = new Map<string, CurrencyState>();

  const expenses = await db
    .select()
    .from(expense)
    .where(eq(expense.tripId, tripId));
  const expenseIds = expenses.map((item) => item.id);
  const allSplits =
    expenseIds.length > 0
      ? await db
          .select()
          .from(expenseSplit)
          .where(inArray(expenseSplit.expenseId, expenseIds))
      : [];
  const splitsByExpenseId = new Map<string, typeof allSplits>();

  for (const split of allSplits) {
    const bucket = splitsByExpenseId.get(split.expenseId) ?? [];
    bucket.push(split);
    splitsByExpenseId.set(split.expenseId, bucket);
  }

  const contributions = await db
    .select()
    .from(contribution)
    .where(eq(contribution.tripId, tripId));

  for (const currentExpense of expenses) {
    const currency = normalizeCurrencyCode(currentExpense.currency);
    const state = getCurrencyState(groups, currency);
    const recordType =
      currentExpense.recordType ?? (currentTrip.mode === "pool" ? "pool" : "general");

    if (recordType === "pool") {
      state.poolSpent += currentExpense.amount;
      continue;
    }

    const splits = splitsByExpenseId.get(currentExpense.id) ?? [];
    const splitsTotal = splits.reduce((sum, split) => sum + split.amount, 0);

    state.generalTotalExpense += currentExpense.amount;

    if (currentExpense.payerMembershipId) {
      state.generalBalances[currentExpense.payerMembershipId] =
        (state.generalBalances[currentExpense.payerMembershipId] ?? 0) + splitsTotal;
    }

    for (const split of splits) {
      state.generalBalances[split.membershipId] =
        (state.generalBalances[split.membershipId] ?? 0) - split.amount;
    }

    state.generalUnallocated += Math.max(currentExpense.amount - splitsTotal, 0);
  }

  for (const currentContribution of contributions) {
    const currency = normalizeCurrencyCode(currentContribution.currency);
    const state = getCurrencyState(groups, currency);
    state.poolDeposited += currentContribution.amount;
  }

  return {
    tripId,
    mode: currentTrip.mode,
    settlements: buildCurrencyGroups(groups),
  };
};
