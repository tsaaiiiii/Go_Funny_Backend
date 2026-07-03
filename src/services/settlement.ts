import { eq, inArray } from "drizzle-orm";

import {
  contribution,
  expense,
  expenseSplit,
  trip,
  tripMembership,
} from "@/db/schema";
import type { AppDb } from "@/db/client";
import { normalizeCurrencyCode } from "@/lib/currency";
import { ensureTripAccess } from "@/services/access";

type SettlementTransfer = {
  from: string;
  to: string;
  amount: number;
};

type CurrencySettlementGroup = {
  currency: string;
  transfers: SettlementTransfer[];
  unallocated: number;
};

type CurrencyBalances = Record<string, number>;

type CurrencyState = {
  balances: CurrencyBalances;
  unallocated: number;
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

  const created: CurrencyState = { balances: {}, unallocated: 0 };
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
      transfers: settleBalances(state.balances),
      unallocated: state.unallocated,
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

  if (currentTrip.mode === "expense") {
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

    for (const currentExpense of expenses) {
      const currency = normalizeCurrencyCode(currentExpense.currency);
      const state = getCurrencyState(groups, currency);
      const splits = splitsByExpenseId.get(currentExpense.id) ?? [];
      const splitsTotal = splits.reduce((sum, split) => sum + split.amount, 0);

      if (currentExpense.payerMembershipId) {
        state.balances[currentExpense.payerMembershipId] =
          (state.balances[currentExpense.payerMembershipId] ?? 0) + splitsTotal;
      }

      for (const split of splits) {
        state.balances[split.membershipId] =
          (state.balances[split.membershipId] ?? 0) - split.amount;
      }

      state.unallocated += Math.max(currentExpense.amount - splitsTotal, 0);
    }
  } else {
    const contributions = await db
      .select()
      .from(contribution)
      .where(eq(contribution.tripId, tripId));
    const expenses = await db
      .select()
      .from(expense)
      .where(eq(expense.tripId, tripId));
    const members = await db
      .select()
      .from(tripMembership)
      .where(eq(tripMembership.tripId, tripId));

    const expenseByCurrency = new Map<string, number>();

    for (const currentExpense of expenses) {
      const currency = normalizeCurrencyCode(currentExpense.currency);
      const nextTotal = (expenseByCurrency.get(currency) ?? 0) + currentExpense.amount;
      expenseByCurrency.set(currency, nextTotal);
    }

    for (const [currency, totalExpense] of expenseByCurrency.entries()) {
      const state = getCurrencyState(groups, currency);

      if (members.length > 0) {
        const perPerson = Math.floor(totalExpense / members.length);
        state.unallocated = totalExpense - perPerson * members.length;

        for (const member of members) {
          state.balances[member.id] = (state.balances[member.id] ?? 0) - perPerson;
        }
      }
    }

    const contributionsByCurrency = new Map<string, typeof contributions>();
    for (const currentContribution of contributions) {
      const currency = normalizeCurrencyCode(currentContribution.currency);
      const bucket = contributionsByCurrency.get(currency) ?? [];
      bucket.push(currentContribution);
      contributionsByCurrency.set(currency, bucket);
    }

    for (const [currency, currencyContributions] of contributionsByCurrency.entries()) {
      const state = getCurrencyState(groups, currency);

      for (const currentContribution of currencyContributions) {
        state.balances[currentContribution.membershipId] =
          (state.balances[currentContribution.membershipId] ?? 0) +
          currentContribution.amount;
      }
    }
  }

  return {
    tripId,
    mode: currentTrip.mode,
    settlements: buildCurrencyGroups(groups),
  };
};
