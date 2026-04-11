import { Request, Response } from "express";
import {
  createErrorResponseBody,
  getHttpErrorResponseBody,
  isHttpError,
} from "@/lib/http-error";
import { parseWithSchema } from "@/lib/validate";
import { getRequiredAuth } from "@/middleware/auth";
import {
  createExpenseBodySchema,
  tripIdExpenseIdParamsSchema,
  tripIdParamsSchema,
} from "@/openapi/schemas";
import { createExpense, getExpenses, deleteExpense } from "@/services/expense";

export const create = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { tripId } = parseWithSchema(tripIdParamsSchema, req.params);
    const { title, amount, date, splitType, payerMembershipId, note } =
      parseWithSchema(createExpenseBodySchema, req.body);

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
      return res.status(error.status).json(getHttpErrorResponseBody(error));
    }
    res.status(400).json(createErrorResponseBody(400, "新增費用失敗"));
  }
};

export const getAll = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { tripId } = parseWithSchema(tripIdParamsSchema, req.params);
    const expenses = await getExpenses(tripId, user.id);
    res.json(expenses);
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json(getHttpErrorResponseBody(error));
    }
    res.status(500).json(createErrorResponseBody(500, "取得費用列表失敗"));
  }
};

export const remove = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { tripId, expenseId } = parseWithSchema(
      tripIdExpenseIdParamsSchema,
      req.params,
    );
    await deleteExpense(expenseId, tripId, user.id);
    res.status(204).send();
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json(getHttpErrorResponseBody(error));
    }
    res.status(400).json(createErrorResponseBody(400, "刪除費用失敗"));
  }
};
