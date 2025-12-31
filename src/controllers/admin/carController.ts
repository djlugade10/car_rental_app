import { Request, Response } from "express";
import { CarService } from "@src/services/carService";
import { ResponseCodes } from "@src/constants/responseCodes";
import { BaseController } from "../base/baseController";
import { AppError } from "@src/utils/AppError";

export class CarController extends BaseController {
  protected static override controllerName = "Car Controller";

  // Add a new car
  static async addCar(req: Request, res: Response): Promise<Response> {
    try {
      const adminId = req.user!.id;
      const car = await CarService.addCar(req.body, adminId);

      return this.successResponse(
        res,
        "Car created successfully",
        car,
        201,
        ResponseCodes.CAR_CREATED_SUCCESS
      );
    } catch (error) {
      return this.handleControllerError(res, error, "Failed to create car");
    }
  }

  // Update a car
  static async updateCar(req: Request, res: Response): Promise<Response> {
    try {
      const adminId = req.user!.id; // Guaranteed by middleware
      const carId = req.params.id as string;

      const car = await CarService.updateCar(carId, req.body, adminId);

      return this.successResponse(
        res,
        "Car updated successfully",
        car,
        200,
        ResponseCodes.CAR_UPDATED_SUCCESS
      );
    } catch (error) {
      return this.handleControllerError(res, error, "Failed to update car");
    }
  }

  // Delete a car
  static async deleteCar(req: Request, res: Response): Promise<Response> {
    try {
      const adminId = req.user!.id; // Guaranteed by middleware
      const carId = req.params.id as string;

      const result = await CarService.deleteCar(carId, adminId);

      return this.successResponse(
        res,
        "Car deleted successfully",
        result,
        200,
        ResponseCodes.CAR_DELETED_SUCCESS
      );
    } catch (error) {
      return this.handleControllerError(res, error, "Failed to delete car");
    }
  }

  // Toggle car availability
  static async toggleAvailability(req: Request, res: Response): Promise<Response> {
    try {
      const adminId = req.user!.id; // Guaranteed by middleware
      const carId = req.params.id as string;
      const { available } = req.body;

      if (typeof available !== "boolean") {
        return this.errorResponse(
          res,
          "Available field must be a boolean",
          400,
          null,
          ResponseCodes.VALIDATION_ERROR
        );
      }

      const car = await CarService.toggleAvailability(carId, available, adminId);

      return this.successResponse(
        res,
        "Car availability updated successfully",
        car,
        200,
        ResponseCodes.CAR_AVAILABILITY_UPDATED_SUCCESS
      );
    } catch (error) {
      return this.handleControllerError(res, error, "Failed to update car availability");
    }
  }

  // Get dashboard statistics
  static async getDashboardStats(req: Request, res: Response): Promise<Response> {
    try {
      const stats = await CarService.getDashboardStats();

      return this.successResponse(
        res,
        "Dashboard statistics retrieved successfully",
        stats,
        200,
        ResponseCodes.DASHBOARD_STATS_RETRIEVED_SUCCESS
      );
    } catch (error) {
      return this.handleControllerError(res, error, "Failed to retrieve statistics");
    }
  }
}
