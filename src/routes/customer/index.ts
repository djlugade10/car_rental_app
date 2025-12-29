import { Router } from "express";
import { authenticate, requireCustomer } from "@src/middlewares/auth";
import authRoutes from "./auth";
import carRoutes from "./cars";

const router = Router();

// Apply authentication and customer authorization to all customer routes
router.use(authenticate, requireCustomer);

// Customer route modules
router.use("/auth", authRoutes);
router.use("/", carRoutes);

export default router;
