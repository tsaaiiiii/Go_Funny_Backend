import { createMiddleware } from "hono/factory";

import { createErrorResponseBody, HttpError } from "@/lib/http-error";
import type { AppEnv } from "@/types/app";

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  try {
    const session = await c.var.auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return c.json(createErrorResponseBody(401, "請先登入"), 401);
    }

    c.set("authSession", session);
    await next();
  } catch (error) {
    console.error("Failed to resolve auth session", error);
    return c.json(createErrorResponseBody(500, "驗證登入狀態失敗"), 500);
  }
});

export const getRequiredAuth = (c: { var: Partial<AppEnv["Variables"]> }) => {
  if (!c.var.authSession) {
    throw new HttpError(401, "請先登入");
  }

  return c.var.authSession;
};
