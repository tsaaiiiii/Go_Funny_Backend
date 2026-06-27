import { Hono } from "hono";
import { create, getAll, edit, remove } from "@/controllers/expense";
import type { AppEnv } from "@/types/app";

const router = new Hono<AppEnv>();

router.post("/", create);
router.get("/", getAll);
router.patch("/:expenseId", edit);
router.delete("/:expenseId", remove);

export default router;
