import { Hono } from "hono";
import { create } from "@/controllers/invitation";
import type { AppEnv } from "@/types/app";

const router = new Hono<AppEnv>();

router.post("/", create);

export default router;
