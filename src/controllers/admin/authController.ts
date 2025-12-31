import { BaseController } from "@src/controllers/base/baseController";
import { AuthService } from "@src/services/authService";
import type { Request, Response } from "express";
import { ResponseCodes } from "@src/constants/responseCodes";
import { UserRole } from "@src/constants/enums";

export class AdminAuthController extends BaseController {
  protected static override controllerName = "Admin Auth Controller";

  // Get admin profile (Admin/SuperAdmin)
  static async getProfile(req: Request, res: Response): Promise<Response> {
    try {

      const userType = req.user!.role === UserRole.admin ? UserRole.admin : UserRole.customer;

      const profile = await AuthService.getUserProfile(req.user!.id, userType);

      return AdminAuthController.successResponse(
        res,
        "Admin profile retrieved successfully",
        profile,
        200,
        ResponseCodes.AUTH_PROFILE_RETRIEVED
      );
    } catch (error) {
      return AdminAuthController.handleControllerError(res, error);
    }
  }
}
