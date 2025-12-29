import { BaseController } from "@src/controllers/base/baseController";
import type { AdminLoginInput } from "@src/schemas/authSchema";
import { AuthService } from "@src/services/authService";
import type { Request, Response } from "express";
import { ResponseCodes } from "@src/constants/responseCodes";
import { UserRole, UserType } from "@src/constants/enums";

export class AdminAuthController extends BaseController {
  protected static override controllerName = "Admin Auth Controller";

  // Get admin profile (Admin/SuperAdmin)
  static async getProfile(req: Request, res: Response): Promise<Response> {
    try {

      const userType = req.user!.role === UserRole.ADMIN ? UserType.ADMIN : UserType.CUSTOMER;

      const profile = await AuthService.getUserProfile(req.user!.id, userType);

      return AdminAuthController.successResponse(
        res,
        "Admin profile retrieved successfully",
        profile,
        200,
        ResponseCodes.AUTH_PROFILE_RETRIEVED
      );
    } catch (error) {
      return AdminAuthController.errorResponse(
        res,
        ResponseCodes.SERVER_ERROR,
        500,
        error as Error
      );
    }
  }
}
