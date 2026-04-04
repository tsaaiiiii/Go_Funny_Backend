import { Request, Response } from "express";
import { getSettlement } from "@/services/settlement";

export const get = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;

    if (Array.isArray(tripId)) {
      return res.status(400).json({ message: "無效的旅程" });
    }

    const settlement = await getSettlement(tripId);

    if (!settlement) {
      return res.status(404).json({ message: "旅程不存在" });
    }

    res.json(settlement);
  } catch (error) {
    res.status(500).json({ message: "取得結算結果失敗" });
  }
};
