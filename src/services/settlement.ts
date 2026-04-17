import { prisma } from "@/lib/prisma";
import { ensureTripAccess } from "@/services/access";

export const getSettlement = async (tripId: string, userId: string) => {
  await ensureTripAccess(tripId, userId);

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });

  if (!trip) {
    return null;
  }

  const balances: Record<string, number> = {};
  let unallocated = 0;

  if (trip.mode === "expense") {
    const expenses = await prisma.expense.findMany({
      where: { tripId },
      include: { splits: true },
    });

    for (const expense of expenses) {
      const splitsTotal = expense.splits.reduce(
        (sum, split) => sum + split.amount,
        0,
      );

      if (expense.payerMembershipId) {
        balances[expense.payerMembershipId] =
          (balances[expense.payerMembershipId] ?? 0) + splitsTotal;
      }

      for (const split of expense.splits) {
        balances[split.membershipId] =
          (balances[split.membershipId] ?? 0) - split.amount;
      }

      unallocated += expense.amount - splitsTotal;
    }
  } else {
    const contributions = await prisma.contribution.findMany({
      where: { tripId },
    });
    const expenses = await prisma.expense.findMany({
      where: { tripId },
    });
    const members = await prisma.tripMembership.findMany({
      where: { tripId },
    });

    const totalExpense = expenses.reduce(
      (sum, expense) => sum + expense.amount,
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
        (balances[contribution.membershipId] ?? 0) + contribution.amount;
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

  return { tripId, mode: trip.mode, transfers, unallocated };
};
