import { Router } from "express";
import { CustomerAuthController } from "@src/controllers/customer/authController";
import { validateBody } from "@src/middlewares/yupValidation";
import {
  customerLoginSchema,

} from "@src/schemas/authSchema";

const router = Router();



export default router;
