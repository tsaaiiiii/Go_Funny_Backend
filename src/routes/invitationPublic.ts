import { Router } from "express";
import { getByToken, accept } from "@/controllers/invitation";
import { requireAuth } from "@/middleware/auth";

const router = Router();

router.get("/:token", getByToken);
router.post("/:token/accept", requireAuth, accept);

export default router;
