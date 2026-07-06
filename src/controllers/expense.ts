import { parseWithSchema } from "@/lib/validate";
import { getRequiredAuth } from "@/middleware/auth";
import {
  createExpenseBodySchema,
  tripIdExpenseIdParamsSchema,
  tripIdParamsSchema,
  updateExpenseBodySchema,
} from "@/openapi/schemas";
import {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} from "@/services/expense";
import { errorResponse, getJsonBody, type AppContext } from "@/controllers/utils";

export const create = async (c: AppContext) => {
  const { user } = getRequiredAuth(c);

  try {
    const { tripId } = parseWithSchema(tripIdParamsSchema, c.req.param());
    const {
      title,
      amount,
      recordType,
      currency,
      exchangeRateToBase,
      date,
      splitType,
      payerMembershipId,
      note,
      splits,
    } = parseWithSchema(createExpenseBodySchema, await getJsonBody(c));

    const expense = await createExpense({
      db: c.var.db,
      tripId,
      title,
      amount,
      recordType,
      currency,
      exchangeRateToBase,
      date: new Date(date),
      splitType,
      payerMembershipId,
      note,
      splits,
      userId: user.id,
    });
    return c.json(expense, 201);
  } catch (error) {
    return errorResponse(c, error, 400, "新增費用失敗");
  }
};

export const getAll = async (c: AppContext) => {
  const { user } = getRequiredAuth(c);

  try {
    const { tripId } = parseWithSchema(tripIdParamsSchema, c.req.param());
    const expenses = await getExpenses(c.var.db, tripId, user.id);
    return c.json(expenses);
  } catch (error) {
    return errorResponse(c, error, 500, "取得費用列表失敗");
  }
};

export const edit = async (c: AppContext) => {
  const { user } = getRequiredAuth(c);

  try {
    const { tripId, expenseId } = parseWithSchema(
      tripIdExpenseIdParamsSchema,
      c.req.param(),
    );
    const {
      title,
      amount,
      recordType,
      currency,
      exchangeRateToBase,
      date,
      splitType,
      payerMembershipId,
      note,
      splits,
    } = parseWithSchema(updateExpenseBodySchema, await getJsonBody(c));

    const expense = await updateExpense(c.var.db, expenseId, tripId, user.id, {
      title,
      amount,
      recordType,
      currency,
      exchangeRateToBase,
      date: date ? new Date(date) : undefined,
      splitType,
      payerMembershipId,
      note,
      splits,
    });
    return c.json(expense);
  } catch (error) {
    return errorResponse(c, error, 400, "編輯費用失敗");
  }
};

export const remove = async (c: AppContext) => {
  const { user } = getRequiredAuth(c);

  try {
    const { tripId, expenseId } = parseWithSchema(
      tripIdExpenseIdParamsSchema,
      c.req.param(),
    );
    await deleteExpense(c.var.db, expenseId, tripId, user.id);
    return c.body(null, 204);
  } catch (error) {
    return errorResponse(c, error, 400, "刪除費用失敗");
  }
};
