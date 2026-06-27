import { Hono } from "hono";
import tripRoutes from "@/routes/trip";
import memberRoutes from "@/routes/member";
import expenseRoutes from "@/routes/expense";
import contributionRoutes from "@/routes/contribution";
import settlementRoutes from "@/routes/settlement";
import invitationRoutes from "@/routes/invitation";
import invitationPublicRoutes from "@/routes/invitationPublic";
import { requireAuth } from "@/middleware/auth";
import type { AppEnv } from "@/types/app";

const router = new Hono<AppEnv>();
const base = new Hono<AppEnv>();

base.route("/trips", tripRoutes);
base.route("/members/:tripId", memberRoutes);
base.route("/expenses/:tripId", expenseRoutes);
base.route("/contributions/:tripId", contributionRoutes);
base.route("/settlement/:tripId", settlementRoutes);
base.route("/invitations/:tripId", invitationRoutes);

router.route("/invitations", invitationPublicRoutes);
router.use("/*", requireAuth);
router.route("/", base);

export default router;
