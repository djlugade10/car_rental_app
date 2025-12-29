import type { Request, Response, NextFunction } from "express";
import {
  verifyToken,
  extractTokenFromHeader,
  type JWTPayload,
} from "@src/utils/jwt";
import { BaseController } from "@src/controllers/base/baseController";
import { ResponseCodes } from "@src/constants/responseCodes";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// Base authentication middleware
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      BaseController.errorResponse(
        res,
        "Access token is required",
        401,
        null,
        ResponseCodes.AUTH_TOKEN_REQUIRED,
        "Auth Middleware"
      );
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      BaseController.errorResponse(
        res,
        "Invalid or expired token",
        401,
        null,
        ResponseCodes.AUTH_INVALID_TOKEN,
        "Auth Middleware"
      );
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    BaseController.errorResponse(
      res,
      "Authentication failed",
      401,
      error as Error,
      ResponseCodes.AUTH_AUTHENTICATION_FAILED,
      "Auth Middleware"
    );
  }
};

// Role-based authorization middleware factory
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        BaseController.errorResponse(
          res,
          "Authentication required",
          401,
          null,
          ResponseCodes.AUTH_REQUIRED,
          "Auth Middleware"
        );
        return;
      }

      // Check both role and type fields for flexibility
      const userRole = req.user.role || req.user.type;

      // Convert to lowercase for case-insensitive comparison
      const normalizedUserRole = userRole?.toLowerCase();
      const normalizedAllowedRoles = allowedRoles.map((role) =>
        role.toLowerCase()
      );

      if (
        !normalizedUserRole ||
        !normalizedAllowedRoles.includes(normalizedUserRole)
      ) {
        BaseController.errorResponse(
          res,
          `Access denied. Required roles: ${allowedRoles.join(
            ", "
          )}. Current role: ${userRole}`,
          403,
          null,
          ResponseCodes.AUTH_ACCESS_DENIED,
          "Auth Middleware"
        );
        return;
      }

      next();
    } catch (error) {
      BaseController.errorResponse(
        res,
        "Authorization failed",
        403,
        error as Error,
        ResponseCodes.AUTH_AUTHORIZATION_FAILED,
        "Auth Middleware"
      );
    }
  };
};

// Role hierarchy: SuperAdmin > Admin > Customer
// SuperAdmin has all Admin rights plus additional privileges

// Role-specific middleware - using consistent role names
// Role-specific middleware - using consistent role names
export const requireAdmin = authorize(["ADMIN"]);
export const requireCustomer = authorize(["CUSTOMER"]);

// Utility middleware (keeping for backward compatibility)
export const requireAnyRole = authorize(["CUSTOMER", "ADMIN"]);

// Optional authentication (for routes that work with or without auth)
export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth, just continue without user
    next();
  }
};
