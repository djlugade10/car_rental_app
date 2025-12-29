import { Router } from "express";
import { CommonCarController } from "@src/controllers/common/carController";
import { authenticate } from "@src/middlewares/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Car Read Operations
router.get("/cars", CommonCarController.getCars);
router.get("/cars/:id", CommonCarController.getCarById);

export default router;
