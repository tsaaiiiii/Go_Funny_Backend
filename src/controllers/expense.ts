import { Request, Response } from "express";
import { isHttpError } from "@/lib/http-error";
import { getRequiredAuth } from "@/middleware/auth";
import { createExpense, getExpenses, deleteExpense } from "@/services/expense";

export const create = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

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
      userId: user.id,
    });
    res.status(201).json(expense);
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(400).json({ message: "新增費用失敗" });
  }
};

export const getAll = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { tripId } = req.params;

    if (Array.isArray(tripId)) {
      return res.status(400).json({ message: "無效的旅程" });
    }
    const expenses = await getExpenses(tripId, user.id);
    res.json(expenses);
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ message: "取得費用列表失敗" });
  }
};

export const remove = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { tripId } = req.params;
    const { expenseId } = req.params;

    if (Array.isArray(tripId)) {
      return res.status(400).json({ message: "無效的旅程" });
    }

    if (Array.isArray(expenseId)) {
      return res.status(400).json({ message: "無效的費用" });
    }
    await deleteExpense(expenseId, tripId, user.id);
    res.status(204).send();
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(400).json({ message: "刪除費用失敗" });
  }
};
