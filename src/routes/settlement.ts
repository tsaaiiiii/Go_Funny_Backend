import { Hono } from "hono";
import { get } from "@/controllers/settlement";
import type { AppEnv } from "@/types/app";

const router = new Hono<AppEnv>();

router.get("/", get);

export default router;
