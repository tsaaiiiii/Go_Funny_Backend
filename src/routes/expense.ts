import { Router } from "express";
import { create, getAll, edit, remove } from "@/controllers/expense";

const router = Router({ mergeParams: true });

router.post("/", create);
router.get("/", getAll);
router.patch("/:expenseId", edit);
router.delete("/:expenseId", remove);

export default router;
