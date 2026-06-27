import { Hono } from "hono";
import { create, getAll, getById, editTripById, remove } from "@/controllers/trip";
import type { AppEnv } from "@/types/app";

const router = new Hono<AppEnv>();

router.post("/", create);
router.get("/", getAll);
router.get("/:tripId", getById);
router.patch("/:tripId", editTripById);
router.delete("/:tripId", remove);
export default router;
