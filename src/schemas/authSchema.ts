import * as yup from "yup";
import { ResponseCodes } from "@src/constants/responseCodes";
import { UserRole } from "@src/constants/enums";

// Admin login schema
export const adminLoginSchema = yup.object({
  email: yup
    .string()
    .required(ResponseCodes.VAL_EMAIL_REQUIRED)
    .email(ResponseCodes.VAL_EMAIL_INVALID),
  password: yup.string().required(ResponseCodes.VAL_PASSWORD_REQUIRED),
});
// Customer login schema
export const customerLoginSchema = yup.object({
  email: yup
    .string()
    .required(ResponseCodes.VAL_EMAIL_REQUIRED)
    .email(ResponseCodes.VAL_EMAIL_INVALID),
  password: yup.string().required(ResponseCodes.VAL_PASSWORD_REQUIRED),
});

// Customer registration schema
export const customerRegisterSchema = yup.object({
  email: yup.string().email(ResponseCodes.VAL_EMAIL_INVALID).optional(),

  password: yup
    .string()
    .min(8, ResponseCodes.VAL_PASSWORD_MIN_LENGTH)
    .max(100, ResponseCodes.VAL_PASSWORD_MAX_LENGTH)
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      ResponseCodes.VAL_PASSWORD_COMPLEXITY
    )
    .required(ResponseCodes.VAL_PASSWORD_REQUIRED),

  firstName: yup
    .string()
    .required(ResponseCodes.VAL_FIRST_NAME_REQUIRED)
    .min(2, ResponseCodes.VAL_FIRST_NAME_MIN_LENGTH)
    .max(50, ResponseCodes.VAL_FIRST_NAME_MAX_LENGTH),

  lastName: yup
    .string()
    .required(ResponseCodes.VAL_LAST_NAME_REQUIRED)
    .min(2, ResponseCodes.VAL_LAST_NAME_MIN_LENGTH)
    .max(50, ResponseCodes.VAL_LAST_NAME_MAX_LENGTH),

  phone: yup
    .string()
    .required(ResponseCodes.VAL_PHONE_REQUIRED)
    .matches(/^\+?[\d\s\-\(\)]+$/, ResponseCodes.VAL_PHONE_INVALID)
    .min(10, ResponseCodes.VAL_PHONE_MIN_LENGTH)
    .max(20, ResponseCodes.VAL_PHONE_MAX_LENGTH),

  address: yup
    .string()
    .min(10, ResponseCodes.VAL_ADDRESS_MIN_LENGTH)
    .max(200, ResponseCodes.VAL_ADDRESS_MAX_LENGTH)
    .optional(),

  licenseNumber: yup
    .string()
    .required(ResponseCodes.VAL_LICENSE_REQUIRED)
    .min(5, ResponseCodes.VAL_LICENSE_MIN_LENGTH)
    .max(20, ResponseCodes.VAL_LICENSE_MAX_LENGTH),
});

// Change password schema
export const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required(ResponseCodes.VAL_CURRENT_PASSWORD_REQUIRED),

  newPassword: yup
    .string()
    .min(8, ResponseCodes.VAL_NEW_PASSWORD_MIN_LENGTH)
    .max(100, ResponseCodes.VAL_NEW_PASSWORD_MAX_LENGTH)
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      ResponseCodes.VAL_NEW_PASSWORD_COMPLEXITY
    )
    .required(ResponseCodes.VAL_NEW_PASSWORD_REQUIRED),
});

// Type exports
export type AdminLoginInput = yup.InferType<typeof adminLoginSchema>;
export type CustomerRegisterInput = yup.InferType<
  typeof customerRegisterSchema
>;
export type ChangePasswordInput = yup.InferType<typeof changePasswordSchema>;


export const forgotPasswordSchema = yup.object({
  email: yup.string().required(ResponseCodes.VAL_EMAIL_REQUIRED),
});


export const resetPasswordSchema = yup.object({
  email: yup.string().required(ResponseCodes.VAL_EMAIL_REQUIRED),
  otp: yup
    .string()
    .required(ResponseCodes.VAL_OTP_REQUIRED)
    .matches(/^\d{6}$/, ResponseCodes.VAL_OTP_INVALID_FORMAT),
  newPassword: yup
    .string()
    .min(8, ResponseCodes.VAL_NEW_PASSWORD_MIN_LENGTH)
    .max(100, ResponseCodes.VAL_NEW_PASSWORD_MAX_LENGTH)
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      ResponseCodes.VAL_NEW_PASSWORD_COMPLEXITY
    )
    .required(ResponseCodes.VAL_NEW_PASSWORD_REQUIRED),
});

export type ForgotPasswordInput = yup.InferType<typeof forgotPasswordSchema>;
export type ResetPasswordInput = yup.InferType<typeof resetPasswordSchema>;

export type UnifiedLoginInput = yup.InferType<typeof adminLoginSchema>;

// Create Admin schema
export const createAdminSchema = yup.object({
  email: yup
    .string()
    .required(ResponseCodes.VAL_EMAIL_REQUIRED)
    .email(ResponseCodes.VAL_EMAIL_INVALID),

  password: yup
    .string()
    .min(8, ResponseCodes.VAL_PASSWORD_MIN_LENGTH)
    .max(100, ResponseCodes.VAL_PASSWORD_MAX_LENGTH)
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      ResponseCodes.VAL_PASSWORD_COMPLEXITY
    )
    .required(ResponseCodes.VAL_PASSWORD_REQUIRED),

  firstName: yup
    .string()
    .required(ResponseCodes.VAL_FIRST_NAME_REQUIRED)
    .min(2, ResponseCodes.VAL_FIRST_NAME_MIN_LENGTH)
    .max(50, ResponseCodes.VAL_FIRST_NAME_MAX_LENGTH),

  lastName: yup
    .string()
    .required(ResponseCodes.VAL_LAST_NAME_REQUIRED)
    .min(2, ResponseCodes.VAL_LAST_NAME_MIN_LENGTH)
    .max(50, ResponseCodes.VAL_LAST_NAME_MAX_LENGTH),

  role: yup
    .string()
    .oneOf([UserRole.admin, UserRole.customer], "Invalid role")
    .default(UserRole.admin),
});

export type CreateAdminInput = yup.InferType<typeof createAdminSchema>;
