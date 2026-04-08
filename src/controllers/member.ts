import { Request, Response } from "express";
import { isHttpError } from "@/lib/http-error";
import { getRequiredAuth } from "@/middleware/auth";
import { getMembers, deleteMember } from "@/services/member";

export const getMemberList = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { tripId } = req.params;

    if (Array.isArray(tripId)) {
      return res.status(400).json({ message: "無效的旅程" });
    }

    const members = await getMembers(tripId, user.id);
    res.json(members);
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ message: "取得成員列表失敗" });
  }
};

export const remove = async (req: Request, res: Response) => {
  const { user } = getRequiredAuth(req);

  try {
    const { tripId } = req.params;
    const { memberId } = req.params;

    if (Array.isArray(tripId)) {
      return res.status(400).json({ message: "無效的旅程" });
    }

    if (Array.isArray(memberId)) {
      return res.status(400).json({ message: "無效的成員" });
    }

    await deleteMember(memberId, tripId, user.id);
    res.status(204).send();
  } catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(400).json({ message: "刪除成員失敗" });
  }
};
