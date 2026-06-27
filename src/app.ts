import { Hono } from "hono";
import { cors } from "hono/cors";

import { createDb } from "@/db/client";
import { createAuth } from "@/lib/auth";
import { swaggerSpec } from "@/lib/swagger";
import routes from "@/routes";
import type { AppEnv } from "@/types/app";

const app = new Hono<AppEnv>();

app.use("*", async (c, next) => {
  const db = createDb(c.env.DB);
  const auth = createAuth(db, c.env);

  c.set("db", db);
  c.set("auth", auth);
  await next();
});

app.use(
  "*",
  cors({
    origin: (origin, c) => {
      const trustedOrigins = c.env.TRUSTED_ORIGINS?.split(",")
        .map((item: string) => item.trim().replace(/\/+$/, ""))
        .filter(Boolean) ?? ["http://localhost:5173"];

      if (!origin) return trustedOrigins[0];
      return trustedOrigins.includes(origin.replace(/\/+$/, ""))
        ? origin
        : trustedOrigins[0];
    },
    credentials: true,
  }),
);

app.on(["GET", "POST"], "/api/auth/*", (c) => c.var.auth.handler(c.req.raw));
app.get("/openapi.json", (c) => c.json(swaggerSpec));
app.get("/", (c) => c.json({ ok: true }));

app.route("/", routes);

export default app;
