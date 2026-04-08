import { Request, Response } from "express";
import { isHttpError } from "@/lib/http-error";
import { getRequiredAuth } from "@/middleware/auth";
import {
  createTrip,
  getTrips,
  getTripById,
  editTrip,
  deleteTrip,
} from "@/services/trip";

export const create = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.body;
  const { user } = getRequiredAuth(req);

  try {
    const trip = await createTrip({
      ...req.body,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      userId: user.id,
    });
    res.status(201).json(trip);
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(400).json({ message: "建立失敗" });
  }
};

export const getAll = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const trips = await getTrips(user.id);
    res.json(trips);
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ message: "取得列表失敗" });
  }
};

export const getById = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { tripId } = req.params;

    if (Array.isArray(tripId)) {
      return res.status(400).json({ message: "無效的旅程" });
    }

    const trip = await getTripById(tripId, user.id);

    if (!trip) {
      return res.status(404).json({ message: "旅程不存在" });
    }
    res.json(trip);
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ message: "取得旅程失敗" });
  }
};

export const editTripById = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { tripId } = req.params;
    const { startDate, endDate } = req.body;

    if (Array.isArray(tripId)) {
      return res.status(400).json({ message: "無效的旅程" });
    }

    const updatedTrip = await editTrip(tripId, user.id, {
      ...req.body,
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    });

    res.status(200).json(updatedTrip);
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(400).json({ message: "更新旅程失敗" });
  }
};

export const remove = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { tripId } = req.params;

    if (Array.isArray(tripId)) {
      return res.status(400).json({ message: "無效的旅程" });
    }

    await deleteTrip(tripId, user.id);
    res.status(204).send();
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(400).json({ message: "刪除旅程失敗" });
  }
};
