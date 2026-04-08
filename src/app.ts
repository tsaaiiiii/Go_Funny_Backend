import cors from "cors";
import express from "express";
import { toNodeHandler } from "better-auth/node";

import { auth } from "@/lib/auth";
import routes from "@/routes";

const app = express();

const allowedOrigins = process.env.TRUSTED_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || !allowedOrigins || allowedOrigins.length === 0) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json()); // middleware：讓 app 能解析 JSON request body
app.use(routes);

export default app;
