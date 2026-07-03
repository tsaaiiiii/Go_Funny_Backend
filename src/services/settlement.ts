import { eq, inArray } from "drizzle-orm";

import { contribution, expense, expenseSplit, trip, tripMembership } from "@/db/schema";
import type { AppDb } from "@/db/client";
import { ensureTripAccess } from "@/services/access";

export const getSettlement = async (db: AppDb, tripId: string, userId: string) => {
  await ensureTripAccess(db, tripId, userId);

  const currentTrip = await db.query.trip.findFirst({
    where: eq(trip.id, tripId),
  });

  if (!currentTrip) {
    return null;
  }

  const balances: Record<string, number> = {};
  let unallocated = 0;

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

    for (const currentExpense of expenses) {
      const splits = allSplits.filter((split) => split.expenseId === currentExpense.id);
      const splitsTotal = splits.reduce(
        (sum, split) => sum + split.amount,
        0,
      );

      if (currentExpense.payerMembershipId) {
        balances[currentExpense.payerMembershipId] =
          (balances[currentExpense.payerMembershipId] ?? 0) + splitsTotal;
      }

      for (const split of splits) {
        balances[split.membershipId] =
          (balances[split.membershipId] ?? 0) - split.amount;
      }

      unallocated += currentExpense.settlementAmount - splitsTotal;
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

    const totalExpense = expenses.reduce(
      (sum, expense) => sum + expense.settlementAmount,
      0,
    );

    if (members.length > 0) {
      const perPerson = Math.floor(totalExpense / members.length);
      unallocated = totalExpense - perPerson * members.length;

      for (const member of members) {
        balances[member.id] = (balances[member.id] ?? 0) - perPerson;
      }
    }

    for (const contribution of contributions) {
      balances[contribution.membershipId] =
        (balances[contribution.membershipId] ?? 0) + contribution.settlementAmount;
    }
  }

  const debtors: { membershipId: string; amount: number }[] = [];
  const creditors: { membershipId: string; amount: number }[] = [];

  for (const [membershipId, amount] of Object.entries(balances)) {
    if (amount < 0) debtors.push({ membershipId, amount: -amount });
    if (amount > 0) creditors.push({ membershipId, amount });
  }

  const transfers: {
    from: string;
    to: string;
    amount: number;
  }[] = [];

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

  return { tripId, mode: currentTrip.mode, currency: currentTrip.currency, transfers, unallocated };
};
