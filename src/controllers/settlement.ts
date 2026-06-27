import {
  createErrorResponseBody,
} from "@/lib/http-error";
import { parseWithSchema } from "@/lib/validate";
import { getRequiredAuth } from "@/middleware/auth";
import { tripIdParamsSchema } from "@/openapi/schemas";
import { getSettlement } from "@/services/settlement";
import { errorResponse, type AppContext } from "@/controllers/utils";

export const get = async (c: AppContext) => {
  const { user } = getRequiredAuth(c);

  try {
    const { tripId } = parseWithSchema(tripIdParamsSchema, c.req.param());

    const settlement = await getSettlement(c.var.db, tripId, user.id);

    if (!settlement) {
      return c.json(createErrorResponseBody(404, "旅程不存在"), 404);
    }

    return c.json(settlement);
  } catch (error) {
    return errorResponse(c, error, 500, "取得結算結果失敗");
  }
};
