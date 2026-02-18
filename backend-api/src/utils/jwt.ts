import jwt from "jsonwebtoken";
import { JwtPayload, AuthUser } from "../types.js";

const secret = process.env.JWT_SECRET ?? "";
if (!secret) throw new Error("JWT_SECRET is required");

export function signToken(user: AuthUser): string {
  return jwt.sign(user, secret, { expiresIn: "12h" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, secret) as unknown as JwtPayload;
}
