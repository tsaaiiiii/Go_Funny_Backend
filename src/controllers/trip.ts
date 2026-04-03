import { Request, Response } from "express";
import { createTrip } from "@/services/trip";

export const create = async (req: Request, res: Response) => {
  const { title, mode, startDate, endDate, location } = req.body;
  const trip = await createTrip({
    title,
    mode,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    location,
  });
  res.status(201).json(trip);
};
