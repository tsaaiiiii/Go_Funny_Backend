import { Router } from "express";
import { create, getAll, getById, editTripById, remove } from "@/controllers/trip";

const router = Router();

router.post("/", create);
router.get("/", getAll);
router.get("/:tripId", getById);
router.patch("/:tripId", editTripById);
router.delete("/:tripId", remove);
export default router;
