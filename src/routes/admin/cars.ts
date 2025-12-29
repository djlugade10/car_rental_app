import { Router } from "express";
import { CarController } from "@src/controllers/admin/carController";
import { CommonCarController } from "@src/controllers/common/carController";
import { authenticate } from "@src/middlewares/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Dashboard stats
router.get("/dashboard/stats", CarController.getDashboardStats);

// Car CRUD operations
router.post("/cars", CarController.addCar);
router.put("/cars/:id", CarController.updateCar);
router.delete("/cars/:id", CarController.deleteCar);

// Toggle availability
router.patch("/cars/:id/availability", CarController.toggleAvailability);

export default router;
