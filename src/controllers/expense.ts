import { Request, Response } from "express";
import { createExpense, getExpenses, deleteExpense } from "@/services/expense";

export const create = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;

    if (Array.isArray(tripId)) {
      return res.status(400).json({ message: "無效的旅程" });
    }
    const { title, amount, date, splitType, payerMembershipId, note } = req.body;

    const expense = await createExpense({
      tripId,
      title,
      amount,
      date: new Date(date),
      splitType,
      payerMembershipId,
      note,
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: "新增費用失敗" });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;

    if (Array.isArray(tripId)) {
      return res.status(400).json({ message: "無效的旅程" });
    }
    const expenses = await getExpenses(tripId);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "取得費用列表失敗" });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { expenseId } = req.params;

    if (Array.isArray(expenseId)) {
      return res.status(400).json({ message: "無效的費用" });
    }
    await deleteExpense(expenseId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: "刪除費用失敗" });
  }
};
