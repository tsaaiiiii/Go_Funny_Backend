import { Request, Response } from "express";
import { isHttpError } from "@/lib/http-error";
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

export const create = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { tripId } = parseWithSchema(tripIdParamsSchema, req.params);
    const { membershipId, amount, date } = parseWithSchema(
      createContributionBodySchema,
      req.body,
    );

    const contribution = await createContribution({
      tripId,
      membershipId,
      amount,
      date: new Date(date),
      userId: user.id,
    });
    res.status(201).json(contribution);
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(400).json({ message: "新增公費失敗" });
  }
};

export const getAll = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { tripId } = parseWithSchema(tripIdParamsSchema, req.params);
    const contributions = await getContributions(tripId, user.id);
    res.json(contributions);
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ message: "取得公費列表失敗" });
  }
};
