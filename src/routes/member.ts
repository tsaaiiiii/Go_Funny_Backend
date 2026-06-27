import { Hono } from "hono";
import { getMemberList, remove } from "@/controllers/member";
import type { AppEnv } from "@/types/app";

const router = new Hono<AppEnv>();

router.get("/", getMemberList);
router.delete("/:memberId", remove);

export default router;
