import { Router } from "express";
import { create, getAll, getById, editTripById } from "@/controllers/trip";

const router = Router();

router.post("/", create);
router.get("/", getAll);
router.get("/:tripId", getById);
router.patch("/:tripId", editTripById);
export default router;
