import type { Request, Response } from "express";
import { BaseController } from "@src/controllers/base/baseController";
import { AuthService } from "@src/services/authService";
import { ResponseCodes } from "@src/constants/responseCodes";
import { UserType } from "@src/constants/enums";

export class CustomerAuthController extends BaseController {
  protected static override controllerName = "Customer Auth Controller";

  // Get customer profile (Customer only)
  static async getProfile(req: Request, res: Response): Promise<Response> {
    try {
      if (!this.requireCustomer(req, res)) return res;

      const profile = await AuthService.getUserProfile(
        req.user!.id,
        UserType.CUSTOMER // Customer type is always "customer"
      );

      return this.successResponse(
        res,
        "Customer profile retrieved successfully",
        profile,
        200,
        ResponseCodes.AUTH_PROFILE_RETRIEVED
      );
    } catch (error) {
      return this.errorResponse(
        res,
        ResponseCodes.SERVER_ERROR,
        500,
        error as Error
      );
    }
  }
}
