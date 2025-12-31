import { Request, Response } from "express";
import { CarService } from "@src/services/carService";
import { ResponseCodes } from "@src/constants/responseCodes";
import { BaseController } from "../base/baseController";
import { AppError } from "@src/utils/AppError";
import { CarStatus, FuelType, TransmissionType, UserRole } from "@src/constants/enums";

export class CommonCarController extends BaseController {
  protected static override controllerName = "Common Car Controller";

  // Get all cars with filters (Role-aware)
  static async getCars(req: Request, res: Response): Promise<Response> {
    try {
      const userRole = req.user?.role || req.user?.type;
      const isCustomer = userRole === UserRole.customer;

      const filters = {
        available: isCustomer
          ? true
          : req.query.available === "true"
            ? true
            : req.query.available === "false"
              ? false
              : undefined,
        categoryId: req.query.categoryId
          ? (req.query.categoryId as string)
          : undefined,
        fleetId: req.query.fleetId ? (req.query.fleetId as string) : undefined,
        fuelType: req.query.fuelType as FuelType | undefined,
        transmission: req.query.transmission as TransmissionType | undefined,
        status: isCustomer ? CarStatus.active : (req.query.status as string | undefined),
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      // Remove undefined keys to satisfy exactOptionalPropertyTypes
      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined)
      );

      const result = await CarService.getCars(cleanedFilters);

      return CommonCarController.paginatedResponse(
        res,
        "Cars retrieved successfully",
        result.data,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        200,
        ResponseCodes.CARS_RETRIEVED_SUCCESS
      );
    } catch (error) {
      return CommonCarController.handleControllerError(res, error, "Failed to retrieve cars");
    }
  }

  // Get car by ID (Role-aware)
  static async getCarById(req: Request, res: Response): Promise<Response> {
    try {
      const userRole = req.user?.role || req.user?.type;
      const isCustomer = userRole === UserRole.customer;
      const carId = req.params.id as string;

      const car = await CarService.getCarById(carId);

      // Customer safety check
      if (isCustomer && car.status !== CarStatus.active) {
        return CommonCarController.errorResponse(
          res,
          "Car is not available",
          404,
          null,
          ResponseCodes.VAL_CAR_NOT_FOUND
        );
      }

      return CommonCarController.successResponse(
        res,
        "Car retrieved successfully",
        car,
        200,
        ResponseCodes.CARS_RETRIEVED_SUCCESS
      );
    } catch (error) {
      return CommonCarController.handleControllerError(res, error, "Failed to retrieve car");
    }
  }
}
