import type { NextFunction, Request, Response } from "express";
import type { CustomError, ApiResponse } from "@src/types";

const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log error for debugging
  console.error(`[ERROR] ${status}: ${message}`, err.stack);

  const response: ApiResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { error: err.stack }),
  };

  return res.status(status).json(response);
};

export default errorHandler;
