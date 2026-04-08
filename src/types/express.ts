import type { AuthSession } from "@/lib/auth-types";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthSession;
    }
  }
}

export {};
