import type { AppDb } from "@/db/client";
import type { createAuth } from "@/lib/auth";

export type Bindings = {
  DB: D1Database;
  BETTER_AUTH_SECRET?: string;
  TRUSTED_ORIGINS?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
};

export type AppAuth = ReturnType<typeof createAuth>;
export type AuthSession = NonNullable<
  Awaited<ReturnType<AppAuth["api"]["getSession"]>>
>;

export type AppEnv = {
  Bindings: Bindings;
  Variables: {
    db: AppDb;
    auth: AppAuth;
    authSession: AuthSession;
  };
};
