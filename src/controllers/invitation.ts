import { Request, Response } from "express";
import { isHttpError } from "@/lib/http-error";
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
      return res.status(error.status).json({ message: error.message });
    }
    res.status(400).json({ message: "建立邀請失敗" });
  }
};

export const getByToken = async (req: Request, res: Response) => {
  try {
    const { token } = parseWithSchema(tokenParamsSchema, req.params);

    const invitation = await getInvitationByToken(token);

    if (!invitation) {
      return res.status(404).json({ message: "邀請不存在" });
    }

    res.json(invitation);
  } catch (error) {
    res.status(500).json({ message: "取得邀請資訊失敗" });
  }
};

export const accept = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { token } = parseWithSchema(tokenParamsSchema, req.params);

    const result = await acceptInvitation(token, user.id);

    if (!result) {
      return res.status(404).json({ message: "邀請不存在" });
    }

    if ("error" in result) {
      return res.status(400).json({ message: result.error });
    }

    res.status(201).json(result);
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(400).json({ message: "接受邀請失敗" });
  }
};
