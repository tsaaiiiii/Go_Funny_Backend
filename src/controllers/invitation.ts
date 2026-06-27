import {
  createErrorResponseBody,
} from "@/lib/http-error";
import { parseWithSchema } from "@/lib/validate";
import { getRequiredAuth } from "@/middleware/auth";
import { tokenParamsSchema, tripIdParamsSchema } from "@/openapi/schemas";
import {
  createInvitation,
  getInvitationByToken,
  acceptInvitation,
} from "@/services/invitation";
import { errorResponse, type AppContext } from "@/controllers/utils";

export const create = async (c: AppContext) => {
  const { user } = getRequiredAuth(c);

  try {
    const { tripId } = parseWithSchema(tripIdParamsSchema, c.req.param());

    const invitation = await createInvitation(c.var.db, tripId, user.id);
    return c.json(invitation, 201);
  } catch (error) {
    return errorResponse(c, error, 400, "建立邀請失敗");
  }
};

export const getByToken = async (c: AppContext) => {
  try {
    const { token } = parseWithSchema(tokenParamsSchema, c.req.param());

    const invitation = await getInvitationByToken(c.var.db, token);

    if (!invitation) {
      return c.json(createErrorResponseBody(404, "邀請不存在"), 404);
    }

    return c.json(invitation);
  } catch (error) {
    return errorResponse(c, error, 500, "取得邀請資訊失敗");
  }
};

export const accept = async (c: AppContext) => {
  const { user } = getRequiredAuth(c);

  try {
    const { token } = parseWithSchema(tokenParamsSchema, c.req.param());

    const result = await acceptInvitation(c.var.db, token, user.id);

    if (!result) {
      return c.json(createErrorResponseBody(404, "邀請不存在"), 404);
    }

    if ("error" in result) {
      return c.json(createErrorResponseBody(400, result.error), 400);
    }

    return c.json(result, 201);
  } catch (error) {
    return errorResponse(c, error, 400, "接受邀請失敗");
  }
};
