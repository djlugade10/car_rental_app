import { Router } from "express";
import { AdminAuthController } from "@src/controllers/admin/authController";
import { CommonAuthController } from "@src/controllers/common/authController";
import { validateBody } from "@src/middlewares/yupValidation";
import { changePasswordSchema } from "@src/schemas/authSchema";

const router = Router();

// Admin profile routes
router.get("/me", AdminAuthController.getProfile);
router.post(
  "/change-password",
  validateBody(changePasswordSchema),
  CommonAuthController.changePassword
);

export default router;
