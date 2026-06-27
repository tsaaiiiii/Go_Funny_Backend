import { Hono } from "hono";
import { getByToken, accept } from "@/controllers/invitation";
import { requireAuth } from "@/middleware/auth";
import type { AppEnv } from "@/types/app";

const router = new Hono<AppEnv>();

router.get("/:token", getByToken);
router.post("/:token/accept", requireAuth, accept);

export default router;
