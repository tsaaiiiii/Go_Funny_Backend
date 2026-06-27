import { Hono } from "hono";
import { create, getAll } from "@/controllers/contribution";
import type { AppEnv } from "@/types/app";

const router = new Hono<AppEnv>();

router.post("/", create);
router.get("/", getAll);

export default router;
