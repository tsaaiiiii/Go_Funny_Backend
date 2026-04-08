import { Router } from "express";
import tripRoutes from "@/routes/trip";
import memberRoutes from "@/routes/member";
import expenseRoutes from "@/routes/expense";
import contributionRoutes from "@/routes/contribution";
import settlementRoutes from "@/routes/settlement";
import invitationRoutes from "@/routes/invitation";
import invitationPublicRoutes from "@/routes/invitationPublic";
import { requireAuth } from "@/middleware/auth";

const router = Router();
const base = Router();

base.use("/trips", tripRoutes);
base.use("/members/:tripId", memberRoutes);
base.use("/expenses/:tripId", expenseRoutes);
base.use("/contributions/:tripId", contributionRoutes);
base.use("/settlement/:tripId", settlementRoutes);
base.use("/invitations/:tripId", invitationRoutes);

router.use("/invitations", invitationPublicRoutes);
router.use("/", requireAuth, base);

export default router;
