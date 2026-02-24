import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface JwtPayload {
  userId: string;
}

export const signToken = (userId: string): string =>
  jwt.sign({ userId } satisfies JwtPayload, env.JWT_SECRET, {
    expiresIn: "7d",
  });

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, env.JWT_SECRET) as JwtPayload;
