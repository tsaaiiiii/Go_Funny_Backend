import { Request, Response } from "express";
import {
  createContribution,
  getContributions,
} from "@/services/contribution";

export const create = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;

    if (Array.isArray(tripId)) {
      return res.status(400).json({ message: "無效的旅程" });
    }
    const { membershipId, amount, date } = req.body;

    const contribution = await createContribution({
      tripId,
      membershipId,
      amount,
      date: new Date(date),
    });
    res.status(201).json(contribution);
  } catch (error) {
    res.status(400).json({ message: "新增公費失敗" });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;

    if (Array.isArray(tripId)) {
      return res.status(400).json({ message: "無效的旅程" });
    }
    const contributions = await getContributions(tripId);
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ message: "取得公費列表失敗" });
  }
};
