import { Router } from "express";
import { get } from "@/controllers/settlement";

const router = Router({ mergeParams: true });

router.get("/", get);

export default router;
