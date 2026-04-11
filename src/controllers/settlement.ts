import { Request, Response } from "express";
import {
  createErrorResponseBody,
  getHttpErrorResponseBody,
  isHttpError,
} from "@/lib/http-error";
import { parseWithSchema } from "@/lib/validate";
import { getRequiredAuth } from "@/middleware/auth";
import { tripIdParamsSchema } from "@/openapi/schemas";
import { getSettlement } from "@/services/settlement";

export const get = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { tripId } = parseWithSchema(tripIdParamsSchema, req.params);

    const settlement = await getSettlement(tripId, user.id);

    if (!settlement) {
      return res.status(404).json(createErrorResponseBody(404, "旅程不存在"));
    }

    res.json(settlement);
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json(getHttpErrorResponseBody(error));
    }
    res.status(500).json(createErrorResponseBody(500, "取得結算結果失敗"));
  }
};
