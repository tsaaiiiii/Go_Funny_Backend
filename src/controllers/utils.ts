import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import {
  createErrorResponseBody,
  getHttpErrorResponseBody,
  isHttpError,
} from "@/lib/http-error";
import type { AppEnv } from "@/types/app";

export type AppContext = Context<AppEnv>;

export const getJsonBody = async (c: AppContext) => {
  try {
    return await c.req.json();
  } catch {
    return {};
  }
};

export const errorResponse = (
  c: AppContext,
  error: unknown,
  fallbackStatus: 400 | 500,
  fallbackMessage: string,
) => {
  if (isHttpError(error)) {
    return c.json(
      getHttpErrorResponseBody(error),
      error.status as ContentfulStatusCode,
    );
  }

  return c.json(createErrorResponseBody(fallbackStatus, fallbackMessage), fallbackStatus);
};
