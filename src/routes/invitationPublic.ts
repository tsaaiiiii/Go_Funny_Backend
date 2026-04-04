import { Router } from "express";
import { getByToken, accept } from "@/controllers/invitation";

const router = Router();

router.get("/:token", getByToken);
router.post("/:token/accept", accept);

export default router;
