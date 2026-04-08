import { fromNodeHeaders } from "better-auth/node";
import { NextFunction, Request, Response } from "express";

import { auth } from "@/lib/auth";
import { HttpError } from "@/lib/http-error";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ message: "請先登入" });
    }

    req.auth = session;
    next();
  } catch (error) {
    console.error("Failed to resolve auth session", error);
    return res.status(500).json({ message: "驗證登入狀態失敗" });
  }
};

export const getRequiredAuth = (req: Request) => {
  if (!req.auth) {
    throw new HttpError(401, "請先登入");
  }

  return req.auth;
};
