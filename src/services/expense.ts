import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/http-error";
import {
  ensureMembershipBelongsToTrip,
  ensureTripAccess,
} from "@/services/access";

export const createExpense = async (data: {
  tripId: string;
  title: string;
  amount: number;
  date: Date;
  splitType: "equal_all" | "equal_selected" | "custom";
  payerMembershipId?: string;
  note?: string;
  userId: string;
}) => {
  const { userId, ...expenseData } = data;

  await ensureTripAccess(expenseData.tripId, userId);

  if (expenseData.payerMembershipId) {
    await ensureMembershipBelongsToTrip(
      expenseData.payerMembershipId,
      expenseData.tripId,
    );
  }

  return await prisma.expense.create({ data: expenseData });
};

export const getExpenses = async (tripId: string, userId: string) => {
  await ensureTripAccess(tripId, userId);

  return await prisma.expense.findMany({
    where: { tripId },
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
