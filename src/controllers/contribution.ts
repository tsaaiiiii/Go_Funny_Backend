import { parseWithSchema } from "@/lib/validate";
import { getRequiredAuth } from "@/middleware/auth";
import {
  createContributionBodySchema,
  tripIdParamsSchema,
} from "@/openapi/schemas";
import {
  createContribution,
  getContributions,
} from "@/services/contribution";
import { errorResponse, getJsonBody, type AppContext } from "@/controllers/utils";

export const create = async (c: AppContext) => {
  const { user } = getRequiredAuth(c);

  try {
    const { tripId } = parseWithSchema(tripIdParamsSchema, c.req.param());
    const { membershipId, amount, currency, exchangeRateToBase, date } = parseWithSchema(
      createContributionBodySchema,
      await getJsonBody(c),
    );

    const contribution = await createContribution({
      db: c.var.db,
      tripId,
      membershipId,
      amount,
      currency,
      exchangeRateToBase,
      date: new Date(date),
      userId: user.id,
    });
    return c.json(contribution, 201);
  } catch (error) {
    return errorResponse(c, error, 400, "新增公費失敗");
  }
};

export const getAll = async (c: AppContext) => {
  const { user } = getRequiredAuth(c);

  try {
    const { tripId } = parseWithSchema(tripIdParamsSchema, c.req.param());
    const contributions = await getContributions(c.var.db, tripId, user.id);
    return c.json(contributions);
  } catch (error) {
    return errorResponse(c, error, 500, "取得公費列表失敗");
  }
};
