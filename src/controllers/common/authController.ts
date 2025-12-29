import type { Request, Response } from "express";
import { BaseController } from "@src/controllers/base/baseController";
import { AuthService } from "@src/services/authService";
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@src/schemas/authSchema";
import { ResponseCodes } from "@src/constants/responseCodes";
import { AppError } from "@src/utils/AppError";
import { UserRole, UserType } from "@src/constants/enums";

export class CommonAuthController extends BaseController {
  protected static override controllerName = "Common Auth Controller";

  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;
      const result = await AuthService.loginAdmin({ email, password });
      return CommonAuthController.successResponse(
        res,
        "Login successful",
        result,
        200,
        ResponseCodes.AUTH_LOGIN_SUCCESS
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      const code = error instanceof AppError ? error.code : ResponseCodes.AUTH_AUTHENTICATION_FAILED;
      const status = error instanceof AppError ? error.status : 401;

      return CommonAuthController.errorResponse(
        res,
        message,
        status,
        error as Error,
        code
      );
    }
  }

  // Get current user profile (works for both admin and customer)
  static async getProfile(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return CommonAuthController.errorResponse(res, "User not authenticated", 401);
      }

      // Map role to the expected format for AuthService
      const userType = req.user.role === UserRole.ADMIN ? UserType.ADMIN : UserType.CUSTOMER;

      const profile = await AuthService.getUserProfile(req.user.id, userType);

      return CommonAuthController.successResponse(
        res,
        ResponseCodes.AUTH_PROFILE_RETRIEVED,
        profile,
        200
      );
    } catch (error) {
      return CommonAuthController.errorResponse(
        res,
        ResponseCodes.SERVER_ERROR,
        500,
        error as Error
      );
    }
  }

  // Change password (works for both admin and customer)
  static async changePassword(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return CommonAuthController.errorResponse(res, "User not authenticated", 401);
      }

      const { currentPassword, newPassword }: ChangePasswordInput = req.body;

      // Map role to the expected format for AuthService
      const userType = req.user.role === UserRole.ADMIN ? UserType.ADMIN : UserType.CUSTOMER;

      await AuthService.changePassword(
        req.user.id,
        userType,
        currentPassword,
        newPassword
      );

      return CommonAuthController.successResponse(
        res,
        "Password changed successfully",
        {},
        200,
        ResponseCodes.AUTH_PASSWORD_CHANGED
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to change password";
      const code = error instanceof AppError ? error.code : ResponseCodes.SERVER_ERROR;
      const status = error instanceof AppError ? error.status : 500;

      return CommonAuthController.errorResponse(
        res,
        message,
        status,
        error as Error,
        code
      );
    }
  }

  // Logout (works for both admin and customer)
  static async logout(req: Request, res: Response): Promise<Response> {
    try {
      const userType = req.user?.type || "user";

      return CommonAuthController.successResponse(
        res,
        "Logout successful",
        {},
        200,
        ResponseCodes.AUTH_LOGOUT_SUCCESS
      );
    } catch (error) {
      return CommonAuthController.errorResponse(
        res,
        ResponseCodes.SERVER_ERROR,
        500,
        error as Error
      );
    }
  }

  // Forgot Password
  static async forgotPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email }: ForgotPasswordInput = req.body;
      const result = await AuthService.forgotPassword(email);

      return CommonAuthController.successResponse(
        res,
        "OTP sent successfully",
        result,
        200,
        ResponseCodes.AUTH_OTP_SENT
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send OTP";
      const code = error instanceof AppError ? error.code : ResponseCodes.SERVER_ERROR;
      const status = error instanceof AppError ? error.status : 500;

      return CommonAuthController.errorResponse(
        res,
        message,
        status,
        error as Error,
        code
      );
    }
  }

  // Reset Password
  static async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email, otp, newPassword }: ResetPasswordInput = req.body;
      const result = await AuthService.resetPasswordWithOtp(
        email,
        otp,
        newPassword
      );

      return CommonAuthController.successResponse(
        res,
        "Password reset successfully",
        result,
        200,
        ResponseCodes.AUTH_PASSWORD_RESET_SUCCESS
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to reset password";
      const code = error instanceof AppError ? error.code : ResponseCodes.SERVER_ERROR;
      const status = error instanceof AppError ? error.status : 500;

      return CommonAuthController.errorResponse(
        res,
        message,
        status,
        error as Error,
        code
      );
    }
  }

  // Create Admin User
  static async createAdmin(req: Request, res: Response): Promise<Response> {
    try {
      const adminData = req.body;
      const result = await AuthService.createAdmin(adminData);

      return CommonAuthController.successResponse(
        res,
        "Admin user created successfully",
        result,
        201,
        ResponseCodes.AUTH_ADMIN_CREATED_SUCCESS
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create admin";
      const code = error instanceof AppError ? error.code : ResponseCodes.SERVER_ERROR;
      const status = error instanceof AppError ? error.status : 500;

      return CommonAuthController.errorResponse(
        res,
        message,
        status,
        error as Error,
        code
      );
    }
  }
}
