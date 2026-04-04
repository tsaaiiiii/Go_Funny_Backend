import { Router } from "express";
import { create, getAll, remove } from "@/controllers/expense";

const router = Router({ mergeParams: true });

router.post("/", create);
router.get("/", getAll);
router.delete("/:expenseId", remove);

export default router;
