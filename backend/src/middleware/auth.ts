import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { unauthorized } from "../utils/errors.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.token as string | undefined;
  if (!token) {
    next(unauthorized("Authentication required"));
    return;
  }
  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    next(unauthorized("Invalid or expired token"));
  }
};

export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.token as string | undefined;
  if (token) {
    try {
      const payload = verifyToken(token);
      req.userId = payload.userId;
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
};
