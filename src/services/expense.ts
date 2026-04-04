import { prisma } from "@/lib/prisma";

export const createExpense = async (data: {
  tripId: string;
  title: string;
  amount: number;
  date: Date;
  splitType: "equal_all" | "equal_selected" | "custom";
  payerMembershipId?: string;
  note?: string;
}) => {
  return await prisma.expense.create({ data });
};

export const getExpenses = async (tripId: string) => {
  return await prisma.expense.findMany({
    where: { tripId },
  });
};

export const deleteExpense = async (expenseId: string) => {
  return await prisma.expense.delete({
    where: { id: expenseId },
  });
};
