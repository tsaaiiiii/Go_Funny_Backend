import { Router } from "express";
import { create, getAll } from "@/controllers/contribution";

const router = Router({ mergeParams: true });

router.post("/", create);
router.get("/", getAll);

export default router;
