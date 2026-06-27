import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { schema } from "@/db/schema";
import type { AppDb } from "@/db/client";
import type { Bindings } from "@/types/app";

const normalizeOrigin = (origin: string) => {
  return origin.trim().replace(/\/+$/, "");
};

const getTrustedOrigins = (env: Bindings) => {
  const origins = env.TRUSTED_ORIGINS?.split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

  return origins && origins.length > 0 ? origins : ["http://localhost:5173"];
};

const getSocialProviders = (env: Bindings) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return undefined;

  return {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  };
};

export const createAuth = (db: AppDb, env: Bindings) => {
  const socialProviders = getSocialProviders(env);

  return betterAuth({
    basePath: "/api/auth",
    secret: env.BETTER_AUTH_SECRET || "dev-only-secret-change-me-before-production",
    trustedOrigins: getTrustedOrigins(env),
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    ...(socialProviders ? { socialProviders } : {}),
    user: {
      modelName: "user",
    },
    session: {
      modelName: "session",
    },
    account: {
      modelName: "account",
    },
    verification: {
      modelName: "verification",
    },
  });
};
