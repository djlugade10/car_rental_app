import jwt from "jsonwebtoken";
import { env } from "@src/utils/env";
import { UserRole, UserType } from "@src/constants/enums";

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d"; // 1 week

export interface JWTPayload {
  id: string;
  email?: string;
  phone?: string;
  role: UserRole;
  type: UserType;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const extractTokenFromHeader = (
  authHeader: string | undefined
): string | null => {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  return parts[1] || null;
};
