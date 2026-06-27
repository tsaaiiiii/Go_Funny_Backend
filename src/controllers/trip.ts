import { createErrorResponseBody } from "@/lib/http-error";
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
import { errorResponse, getJsonBody, type AppContext } from "@/controllers/utils";

export const create = async (c: AppContext) => {
  const { user } = getRequiredAuth(c);

  try {
    const { startDate, endDate, ...body } = parseWithSchema(
      createTripBodySchema,
      await getJsonBody(c),
    );

    const trip = await createTrip({
      db: c.var.db,
      ...body,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      userId: user.id,
    });
    return c.json(trip, 201);
  } catch (error) {
    return errorResponse(c, error, 400, "建立失敗");
  }
};

export const getAll = async (c: AppContext) => {
  const { user } = getRequiredAuth(c);

  try {
    const trips = await getTrips(c.var.db, user.id);
    return c.json(trips);
  } catch (error) {
    return errorResponse(c, error, 500, "取得列表失敗");
  }
};

export const getById = async (c: AppContext) => {
  const { user } = getRequiredAuth(c);

  try {
    const { tripId } = parseWithSchema(tripIdParamsSchema, c.req.param());

    const trip = await getTripById(c.var.db, tripId, user.id);

    if (!trip) {
      return c.json(createErrorResponseBody(404, "旅程不存在"), 404);
    }
    return c.json(trip);
  } catch (error) {
    return errorResponse(c, error, 500, "取得旅程失敗");
  }
};

export const editTripById = async (c: AppContext) => {
  const { user } = getRequiredAuth(c);

  try {
    const { tripId } = parseWithSchema(tripIdParamsSchema, c.req.param());
    const { startDate, endDate, ...body } = parseWithSchema(
      updateTripBodySchema,
      await getJsonBody(c),
    );

    const updatedTrip = await editTrip(c.var.db, tripId, user.id, {
      ...body,
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    });

    return c.json(updatedTrip);
  } catch (error) {
    return errorResponse(c, error, 400, "更新旅程失敗");
  }
};

export const remove = async (c: AppContext) => {
  const { user } = getRequiredAuth(c);

  try {
    const { tripId } = parseWithSchema(tripIdParamsSchema, c.req.param());

    await deleteTrip(c.var.db, tripId, user.id);
    return c.body(null, 204);
  } catch (error) {
    return errorResponse(c, error, 400, "刪除旅程失敗");
  }
};
