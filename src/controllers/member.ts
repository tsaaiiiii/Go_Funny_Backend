import { Request, Response } from "express";
import {
  createErrorResponseBody,
  getHttpErrorResponseBody,
  isHttpError,
} from "@/lib/http-error";
import { parseWithSchema } from "@/lib/validate";
import { getRequiredAuth } from "@/middleware/auth";
import {
  tripIdMemberIdParamsSchema,
  tripIdParamsSchema,
} from "@/openapi/schemas";
import { getMembers, deleteMember } from "@/services/member";

export const getMemberList = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { tripId } = parseWithSchema(tripIdParamsSchema, req.params);

    const members = await getMembers(tripId, user.id);
    res.json(members);
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json(getHttpErrorResponseBody(error));
    }
    res.status(500).json(createErrorResponseBody(500, "取得成員列表失敗"));
  }
};

export const remove = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { tripId, memberId } = parseWithSchema(
      tripIdMemberIdParamsSchema,
      req.params,
    );

    await deleteMember(memberId, tripId, user.id);
    res.status(204).send();
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json(getHttpErrorResponseBody(error));
    }
    res.status(400).json(createErrorResponseBody(400, "刪除成員失敗"));
  }
};
