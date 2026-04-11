import { Request, Response } from "express";
import {
  createErrorResponseBody,
  getHttpErrorResponseBody,
  isHttpError,
} from "@/lib/http-error";
import { parseWithSchema } from "@/lib/validate";
import { getRequiredAuth } from "@/middleware/auth";
import { tokenParamsSchema, tripIdParamsSchema } from "@/openapi/schemas";
import {
  createInvitation,
  getInvitationByToken,
  acceptInvitation,
} from "@/services/invitation";

export const create = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { tripId } = parseWithSchema(tripIdParamsSchema, req.params);

    const invitation = await createInvitation(tripId, user.id);
    res.status(201).json(invitation);
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json(getHttpErrorResponseBody(error));
    }
    res.status(400).json(createErrorResponseBody(400, "建立邀請失敗"));
  }
};

export const getByToken = async (req: Request, res: Response) => {
  try {
    const { token } = parseWithSchema(tokenParamsSchema, req.params);

    const invitation = await getInvitationByToken(token);

    if (!invitation) {
      return res.status(404).json(createErrorResponseBody(404, "邀請不存在"));
    }

    res.json(invitation);
  } catch (error) {
    res.status(500).json(createErrorResponseBody(500, "取得邀請資訊失敗"));
  }
};

export const accept = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { token } = parseWithSchema(tokenParamsSchema, req.params);

    const result = await acceptInvitation(token, user.id);

    if (!result) {
      return res.status(404).json(createErrorResponseBody(404, "邀請不存在"));
    }

    if ("error" in result) {
      return res
        .status(400)
        .json(createErrorResponseBody(400, result.error));
    }

    res.status(201).json(result);
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json(getHttpErrorResponseBody(error));
    }
    res.status(400).json(createErrorResponseBody(400, "接受邀請失敗"));
  }
};
