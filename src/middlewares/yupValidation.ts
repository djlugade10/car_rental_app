import type { Request, Response, NextFunction } from "express";
import { Schema, ValidationError } from "yup";
import { BaseController } from "@src/controllers/base/baseController";
import { ResponseCodes } from "@src/constants/responseCodes";

// Generic validation middleware factory
export const validateSchema = (
  schema: Schema,
  source: "body" | "params" | "query" = "body"
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data =
        source === "body"
          ? req.body
          : source === "params"
            ? req.params
            : req.query;

      const result = await schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
      });

      // Replace the original data with validated and transformed data
      if (source === "body") {
        req.body = result;
      } else if (source === "params") {
        req.params = result as any;
      } else {
        req.query = result as any;
      }

      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        const errorMessages = error.inner.map((err: ValidationError) => ({
          field: err.path || "unknown",
          message: err.message,
        }));

        BaseController.validationErrorResponse(
          res,
          "Validation failed",
          400,
          errorMessages,
          "Validation Middleware"
        );
        return;
      }

      BaseController.errorResponse(
        res,
        "Validation error",
        500,
        error as Error,
        ResponseCodes.VALIDATION_ERROR,
        "Validation Middleware"
      );
    }
  };
};

// Specific validation middlewares for different sources
export const validateBody = (schema: Schema) => validateSchema(schema, "body");
export const validateParams = (schema: Schema) =>
  validateSchema(schema, "params");
export const validateQuery = (schema: Schema) =>
  validateSchema(schema, "query");
