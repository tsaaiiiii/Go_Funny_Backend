import { Router } from "express";
import { create } from "@/controllers/trip";

const router = Router();

router.post("/", create);

export default router;
