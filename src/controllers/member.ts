import { parseWithSchema } from "@/lib/validate";
import { getRequiredAuth } from "@/middleware/auth";
import {
  tripIdMemberIdParamsSchema,
  tripIdParamsSchema,
} from "@/openapi/schemas";
import { getMembers, deleteMember } from "@/services/member";
import { errorResponse, type AppContext } from "@/controllers/utils";

export const getMemberList = async (c: AppContext) => {
  const { user } = getRequiredAuth(c);

  try {
    const { tripId } = parseWithSchema(tripIdParamsSchema, c.req.param());

    const members = await getMembers(c.var.db, tripId, user.id);
    return c.json(members);
  } catch (error) {
    return errorResponse(c, error, 500, "取得成員列表失敗");
  }
};

export const remove = async (c: AppContext) => {
  const { user } = getRequiredAuth(c);

  try {
    const { tripId, memberId } = parseWithSchema(
      tripIdMemberIdParamsSchema,
      c.req.param(),
    );

    await deleteMember(c.var.db, memberId, tripId, user.id);
    return c.body(null, 204);
  } catch (error) {
    return errorResponse(c, error, 400, "刪除成員失敗");
  }
};
