import { Router } from "express";
import tripRoutes from "@/routes/trip";
import memberRoutes from "@/routes/member";

const router = Router();
const base = Router();

base.use("/trips", tripRoutes);
base.use("/members/:tripId", memberRoutes);

router.use("/go-funny-api", base);

export default router;
