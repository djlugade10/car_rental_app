import { Router } from "express";
import { authenticate, requireAdmin } from "@src/middlewares/auth";
import authRouter from "./auth";
import carRouter from "./cars";

const router = Router();

// Apply authentication and admin authorization to all admin routes
// SuperAdmin inherits all Admin rights automatically
router.use(authenticate, requireAdmin);

// Admin route modules
router.use("/auth", authRouter);
router.use("/cars", carRouter);

export default router;
