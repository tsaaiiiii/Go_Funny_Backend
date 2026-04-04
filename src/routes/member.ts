import { Router } from "express";
import { create, getMemberList, remove } from "@/controllers/member";

const router = Router({ mergeParams: true });

router.post("/", create);
router.get("/", getMemberList);
router.delete("/:memberId", remove);

export default router;
