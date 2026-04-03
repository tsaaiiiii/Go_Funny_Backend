import { Router } from "express";
import tripRoutes from "@/routes/trip";

const router = Router();

router.use("/trips", tripRoutes);

export default router;
