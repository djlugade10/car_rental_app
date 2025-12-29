import { db } from "@src/db/connection";
import { cars, categories, fleets } from "@src/db/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { AppError } from "@src/utils/AppError";
import { ResponseCodes } from "@src/constants/responseCodes";
import { FuelType, TransmissionType, CarStatus } from "@src/constants/enums";

interface CarBase {
  model: string;
  brand: string;
  year: number;
  color?: string;
  licensePlate: string;
  pricePerDay: string;
  categoryId: string;
  fleetId?: string;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  seats?: number;
  mileage?: number;
  description?: string;
  imageUrl?: string;
  vin?: string;
}

interface AddCarInput extends CarBase { }

interface UpdateCarInput extends Partial<CarBase> {
  available?: boolean;
  status?: CarStatus;
}

interface GetCarsFilters {
  available?: boolean;
  categoryId?: string;
  fleetId?: string;
  fuelType?: string;
  transmission?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class CarService {
  // Add a new car
  static async addCar(input: AddCarInput, adminId: string) {
    // Verify category exists
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, input.categoryId))
      .limit(1)
      .then((result) => result[0]);

    if (!category) {
      throw new AppError("Category not found", ResponseCodes.VALIDATION_ERROR, 404);
    }

    // Check fleet (optional)
    if (input.fleetId) {
      const fleet = await db
        .select()
        .from(fleets)
        .where(eq(fleets.id, input.fleetId))
        .limit(1)
        .then((result) => result[0]);

      if (!fleet) {
        throw new AppError("Fleet not found", ResponseCodes.VALIDATION_ERROR, 404);
      }
    }

    // Check if license plate already exists
    const existingCar = await db
      .select()
      .from(cars)
      .where(eq(cars.licensePlate, input.licensePlate))
      .limit(1)
      .then((result) => result[0]);

    if (existingCar) {
      throw new AppError(
        "License plate already exists",
        ResponseCodes.VAL_LICENSE_PLATE_EXISTS,
        400
      );
    }

    // Create the car
    const newCar = await db
      .insert(cars)
      .values({
        ...input,
        adminId,
        updatedAt: new Date(),
      })
      .returning();

    return newCar[0];
  }

  // Update a car
  static async updateCar(id: string, input: UpdateCarInput, adminId: string) {
    // Check if car exists and belongs to admin
    const car = await db
      .select()
      .from(cars)
      .where(eq(cars.id, id))
      .limit(1)
      .then((result) => result[0]);

    if (!car) {
      throw new AppError("Car not found", ResponseCodes.VAL_CAR_NOT_FOUND, 404);
    }

    if (car.adminId !== adminId) {
      throw new AppError(
        "You don't have permission to update this car",
        ResponseCodes.AUTH_FORBIDDEN,
        403
      );
    }

    // Verify category if being updated
    if (input.categoryId) {
      const category = await db
        .select()
        .from(categories)
        .where(eq(categories.id, input.categoryId))
        .limit(1)
        .then((result) => result[0]);

      if (!category) {
        throw new AppError("Category not found", ResponseCodes.VALIDATION_ERROR, 404);
      }
    }

    // Verify fleet if being updated
    if (input.fleetId) {
      const fleet = await db
        .select()
        .from(fleets)
        .where(eq(fleets.id, input.fleetId))
        .limit(1)
        .then((result) => result[0]);

      if (!fleet) {
        throw new AppError("Fleet not found", ResponseCodes.VALIDATION_ERROR, 404);
      }
    }

    // Check license plate uniqueness if being updated
    if (input.licensePlate && input.licensePlate !== car.licensePlate) {
      const existingCar = await db
        .select()
        .from(cars)
        .where(eq(cars.licensePlate, input.licensePlate))
        .limit(1)
        .then((result) => result[0]);

      if (existingCar) {
        throw new AppError(
          "License plate already exists",
          ResponseCodes.VAL_LICENSE_PLATE_EXISTS,
          400
        );
      }
    }

    // Update the car
    const updatedCar = await db
      .update(cars)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(cars.id, id))
      .returning();

    return updatedCar[0];
  }

  // Delete a car
  static async deleteCar(id: string, adminId: string) {
    // Check if car exists and belongs to admin
    const car = await db
      .select()
      .from(cars)
      .where(eq(cars.id, id))
      .limit(1)
      .then((result) => result[0]);

    if (!car) {
      throw new AppError("Car not found", ResponseCodes.VAL_CAR_NOT_FOUND, 404);
    }

    if (car.adminId !== adminId) {
      throw new AppError(
        "You don't have permission to delete this car",
        ResponseCodes.AUTH_FORBIDDEN,
        403
      );
    }

    await db.delete(cars).where(eq(cars.id, id));

    return { message: "Car deleted successfully" };
  }

  // Get cars with filters and pagination
  static async getCars(filters: GetCarsFilters = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (filters.available !== undefined) {
      conditions.push(eq(cars.available, filters.available));
    }

    if (filters.categoryId) {
      conditions.push(eq(cars.categoryId, filters.categoryId));
    }

    if (filters.fleetId) {
      conditions.push(eq(cars.fleetId, filters.fleetId));
    }

    if (filters.fuelType) {
      conditions.push(eq(cars.fuelType, filters.fuelType as FuelType));
    }

    if (filters.transmission) {
      conditions.push(eq(cars.transmission, filters.transmission as TransmissionType));
    }

    if (filters.status) {
      conditions.push(eq(cars.status, filters.status as CarStatus));
    }

    // Execute queries in parallel
    const [totalResult, carsList] = await Promise.all([
      db
        .select({ count: count() })
        .from(cars)
        .where(conditions.length > 0 ? and(...conditions) : undefined),
      db
        .select()
        .from(cars)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(cars.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const total = totalResult[0]?.count || 0;

    return {
      data: carsList,
      pagination: {
        page,
        limit,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / limit),
      },
    };
  }

  // Get car by ID
  static async getCarById(id: string) {
    const car = await db
      .select()
      .from(cars)
      .where(eq(cars.id, id))
      .limit(1)
      .then((result) => result[0]);

    if (!car) {
      throw new AppError("Car not found", ResponseCodes.VAL_CAR_NOT_FOUND, 404);
    }

    return car;
  }

  // Toggle car availability
  static async toggleAvailability(id: string, available: boolean, adminId: string) {
    // Check if car exists and belongs to admin
    const car = await db
      .select()
      .from(cars)
      .where(eq(cars.id, id))
      .limit(1)
      .then((result) => result[0]);

    if (!car) {
      throw new AppError("Car not found", ResponseCodes.VAL_CAR_NOT_FOUND, 404);
    }

    if (car.adminId !== adminId) {
      throw new AppError(
        "You don't have permission to update this car",
        ResponseCodes.AUTH_FORBIDDEN,
        403
      );
    }

    // Update availability
    const updatedCar = await db
      .update(cars)
      .set({
        available,
        updatedAt: new Date(),
      })
      .where(eq(cars.id, id))
      .returning();

    return updatedCar[0];
  }

  // Get dashboard statistics
  static async getDashboardStats() {
    const result = await db
      .select({
        totalCars: count(),
        availableCars: sql<number>`count(case when ${cars.available} = true then 1 end)`,
      })
      .from(cars)
      .then((res) => res[0]);

    const totalCars = Number(result?.totalCars || 0);
    const availableCars = Number(result?.availableCars || 0);
    const rentedCars = totalCars - availableCars;

    return {
      totalCars,
      availableCars,
      rentedCars,
    };
  }
}
