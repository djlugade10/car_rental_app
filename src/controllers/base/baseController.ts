import type { Request, Response } from "express";
import { info, error as logError } from "@src/utils/logger/logger";
import {
  ResponseCodes,
  type ResponseCode,
} from "@src/constants/responseCodes";
import { UserRole, UserType } from "@src/constants/enums";

export interface SuccessResponseData {
  success: true;
  status: number;
  message: string;
  data: unknown;
  code: string;
}

export interface ErrorResponseData {
  success: false;
  status: number;
  message: string;
  code: string;
}

export interface PaginatedResponseData {
  success: true;
  message: string;
  code: string;
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  data: unknown[];
}

export class BaseController {
  // Default controller name, should be overridden by subclasses
  protected static controllerName = "Base Controller";

  public static successResponse(
    res: Response,
    message = "Success",
    data: unknown = {},
    status = 200,
    code: string = ResponseCodes.SUCCESS,
    section?: string
  ): Response<SuccessResponseData> {
    const finalSection = section || this.controllerName;
    const logMessage = finalSection ? `${finalSection}: ${message}` : message;
    info(logMessage); // Removed to reduce noise

    return res.status(status).json({
      success: true,
      status,
      message,
      data,
      code,
    });
  }

  public static errorResponse(
    res: Response,
    message = "Something went wrong",
    status = 500,
    errors: Error | string | null = null,
    code: string = ResponseCodes.SERVER_ERROR,
    section?: string
  ): Response<ErrorResponseData> {
    const finalSection = section || this.controllerName;
    const errorMessage =
      process.env.NODE_ENV !== "production" &&
        errors instanceof Error &&
        errors.stack
        ? errors.stack
        : errors?.toString() || message;

    const logMessage = finalSection
      ? `${finalSection}: ${errorMessage}`
      : errorMessage;
    logError(logMessage);

    return res.status(status).json({
      success: false,
      status,
      message,
      code,
      ...(process.env.NODE_ENV !== "production" &&
        errors instanceof Error && { error: errors.stack }),
    });
  }

  public static validationErrorResponse(
    res: Response,
    message = "Validation failed",
    status = 400,
    validationErrors: Array<{ field: string; message: string }> = [],
    section?: string
  ): Response {
    const finalSection = section || this.controllerName;
    const logMessage = finalSection ? `${finalSection}: ${message}` : message;
    logError(`${logMessage} - ${JSON.stringify(validationErrors)}`);

    return res.status(status).json({
      success: false,
      status,
      message,
      code: ResponseCodes.VALIDATION_ERROR,
      errors: validationErrors,
    });
  }

  public static paginatedResponse(
    res: Response,
    message = "Success",
    data: unknown[] = [],
    page = 1,
    pageSize = 10,
    total = 0,
    status = 200,
    code: string = ResponseCodes.SUCCESS,
    section?: string
  ): Response<PaginatedResponseData> {
    // const finalSection = section || this.controllerName;
    // info(
    //   `Paginated response: ${message} - Page ${page}/${Math.ceil(
    //     total / pageSize
    //   )}`
    // ); // Removed to reduce noise

    return res.status(status).json({
      success: true,
      message,
      code,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      data,
    });
  }

  // ---- Authorization Helpers ----

  // Check if user has Admin role
  protected static requireAdmin(req: Request, res: Response): boolean {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      this.errorResponse(
        res,
        "Admin access required",
        403,
        null,
        ResponseCodes.AUTH_ACCESS_DENIED,
        "Authorization"
      );
      return false;
    }
    return true;
  }

  // Check if user has Customer role
  protected static requireCustomer(req: Request, res: Response): boolean {
    if (!req.user || req.user.type !== "customer") {
      this.errorResponse(
        res,
        "Customer access required",
        403,
        null,
        ResponseCodes.AUTH_ACCESS_DENIED,
        "Authorization"
      );
      return false;
    }
    return true;
  }

  // Check if user owns the resource (for customer-specific resources)
  protected static requireOwnership(
    req: Request,
    res: Response,
    resourceOwnerId: string,
    resourceType: string = "resource"
  ): boolean {
    if (!req.user) {
      this.errorResponse(
        res,
        "Authentication required",
        401,
        null,
        ResponseCodes.AUTH_REQUIRED,
        "Authorization"
      );
      return false;
    }

    // Admin can access any resource
    if (req.user.role === UserRole.ADMIN) {
      return true;
    }

    // Customer can only access their own resources
    if (req.user.type === "customer" && req.user.id === resourceOwnerId) {
      return true;
    }

    this.errorResponse(
      res,
      `Access denied to this ${resourceType}`,
      403,
      null,
      ResponseCodes.AUTH_ACCESS_DENIED,
      "Authorization"
    );
    return false;
  }

  // Get user role for conditional logic
  protected static getUserRole(req: Request): string | null {
    return req.user?.role || req.user?.type || null;
  }

  // Check if user is SuperAdmin


  // Check if user is Admin
  protected static isAdmin(req: Request): boolean {
    return req.user?.role === UserRole.ADMIN;
  }

  // Check if user is Customer
  protected static isCustomer(req: Request): boolean {
    return req.user?.type === UserType.CUSTOMER;
  }
}
