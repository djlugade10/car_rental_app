import { Router } from "express";
import { CommonAuthController } from "@src/controllers/common/authController";
import { validateBody } from "@src/middlewares/yupValidation";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  createAdminSchema,
  adminLoginSchema,
} from "@src/schemas/authSchema";

const router = Router();

// Unified login for Admin (Email) and Customer (Phone)
router.post(
  "/login",
  validateBody(adminLoginSchema),
  CommonAuthController.login
);

// Forgot Password
router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  CommonAuthController.forgotPassword
);

// Reset Password
router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  CommonAuthController.resetPassword
);

// Create Admin User
router.post(
  "/create-admin",
  validateBody(createAdminSchema),
  CommonAuthController.createAdmin
);

export default router;
