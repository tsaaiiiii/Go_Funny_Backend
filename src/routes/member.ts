import { Router } from "express";
import { getMemberList, remove } from "@/controllers/member";

const router = Router({ mergeParams: true });

router.get("/", getMemberList);
router.delete("/:memberId", remove);

export default router;
