import { Request, Response } from "express";
import { createTrip, getTrips } from "@/services/trip";

export const create = async (req: Request, res: Response) => {
  const { title, mode, startDate, endDate, location } = req.body;
  try {
    const trip = await createTrip({
      title,
      mode,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location,
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
