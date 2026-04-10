import express from "express";
import { toNodeHandler } from "better-auth/node";
import swaggerUi from "swagger-ui-express";

import { auth } from "@/lib/auth";
import { swaggerSpec } from "@/lib/swagger";
import routes from "@/routes";
import { createCors } from "@/middleware/cors";

const app = express();

app.use(createCors());
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/openapi.json", (_req, res) => res.json(swaggerSpec));

app.use(routes);

export default app;
