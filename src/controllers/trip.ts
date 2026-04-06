import { Request, Response } from "express";
import {
  createTrip,
  getTrips,
  getTripById,
  editTrip,
  deleteTrip,
} from "@/services/trip";

export const create = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.body;
  try {
    const trip = await createTrip({
      ...req.body,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
    res.status(201).json(trip);
  } catch (error) {
    res.status(400).json({ message: "建立失敗" });
  }
};

export const getAll = async (_req: Request, res: Response) => {
  try {
    const trips = await getTrips();
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: "取得列表失敗" });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;

    if (Array.isArray(tripId)) {
      return res.status(400).json({ message: "無效的旅程" });
    }

    const trip = await getTripById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "旅程不存在" });
    }
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: "取得旅程失敗" });
  }
};

export const editTripById = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const { startDate, endDate } = req.body;

    if (Array.isArray(tripId)) {
      return res.status(400).json({ message: "無效的旅程" });
    }

    const updatedTrip = await editTrip(tripId, {
      ...req.body,
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    });

    res.status(200).json(updatedTrip);
  } catch (error) {
    res.status(400).json({ message: "更新旅程失敗" });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;

    if (Array.isArray(tripId)) {
      return res.status(400).json({ message: "無效的旅程" });
    }

    await deleteTrip(tripId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: "刪除旅程失敗" });
  }
};
