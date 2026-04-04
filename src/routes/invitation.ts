import { Router } from "express";
import { create } from "@/controllers/invitation";

const router = Router({ mergeParams: true });

router.post("/", create);

export default router;
