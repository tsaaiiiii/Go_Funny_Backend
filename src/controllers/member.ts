import { Request, Response } from "express";
import { createMember, deleteMember, getMembers } from "@/services/member";

export const create = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const { userId } = req.body;

    if (Array.isArray(tripId)) {
      return res.status(400).json({ message: "無效的旅程" });
    }
    const member = await createMember(tripId, userId);
    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ message: "新增成員失敗" });
  }
};

export const getMemberList = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    if (Array.isArray(tripId)) {
      return res.status(400).json({ message: "無效的旅程" });
    }

    const members = await getMembers(tripId);
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "取得成員列表失敗" });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;

    if (Array.isArray(memberId)) {
      return res.status(400).json({ message: "無效的旅程" });
    }
    await deleteMember(memberId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: "刪除成員失敗" });
  }
};
