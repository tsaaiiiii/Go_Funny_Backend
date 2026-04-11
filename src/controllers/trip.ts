import { Request, Response } from "express";
import {
  createErrorResponseBody,
  getHttpErrorResponseBody,
  isHttpError,
} from "@/lib/http-error";
import { parseWithSchema } from "@/lib/validate";
import { getRequiredAuth } from "@/middleware/auth";
import {
  createTripBodySchema,
  tripIdParamsSchema,
  updateTripBodySchema,
} from "@/openapi/schemas";
import {
  createTrip,
  getTrips,
  getTripById,
  editTrip,
  deleteTrip,
} from "@/services/trip";

export const create = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { startDate, endDate, ...body } = parseWithSchema(
      createTripBodySchema,
      req.body,
    );

    const trip = await createTrip({
      ...body,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      userId: user.id,
    });
    res.status(201).json(trip);
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json(getHttpErrorResponseBody(error));
    }
    res.status(400).json(createErrorResponseBody(400, "建立失敗"));
  }
};

export const getAll = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const trips = await getTrips(user.id);
    res.json(trips);
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json(getHttpErrorResponseBody(error));
    }
    res.status(500).json(createErrorResponseBody(500, "取得列表失敗"));
  }
};

export const getById = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { tripId } = parseWithSchema(tripIdParamsSchema, req.params);

    const trip = await getTripById(tripId, user.id);

    if (!trip) {
      return res.status(404).json(createErrorResponseBody(404, "旅程不存在"));
    }
    res.json(trip);
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json(getHttpErrorResponseBody(error));
    }
    res.status(500).json(createErrorResponseBody(500, "取得旅程失敗"));
  }
};

export const editTripById = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { tripId } = parseWithSchema(tripIdParamsSchema, req.params);
    const { startDate, endDate, ...body } = parseWithSchema(
      updateTripBodySchema,
      req.body,
    );

    const updatedTrip = await editTrip(tripId, user.id, {
      ...body,
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    });

    res.status(200).json(updatedTrip);
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json(getHttpErrorResponseBody(error));
    }
    res.status(400).json(createErrorResponseBody(400, "更新旅程失敗"));
  }
};

export const remove = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { tripId } = parseWithSchema(tripIdParamsSchema, req.params);

    await deleteTrip(tripId, user.id);
    res.status(204).send();
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json(getHttpErrorResponseBody(error));
    }
    res.status(400).json(createErrorResponseBody(400, "刪除旅程失敗"));
  }
};
