import { db } from "@src/db/connection";
import { admins, customers, otps } from "@src/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, comparePassword } from "@src/utils/password";
import { generateToken, type JWTPayload } from "@src/utils/jwt";
import type {
  AdminLoginInput,
  CreateAdminInput,
} from "@src/schemas/authSchema";
import { ResponseCodes } from "@src/constants/responseCodes";
import { AppError } from "@src/utils/AppError";
import { UserRole } from "@src/constants/enums";

export class AuthService {
  // Helper to verify credentials
  private static async verifyUserCredentials<T extends { password: string; isActive: boolean }>(
    query: Promise<T | undefined>,
    passwordAttempt: string
  ): Promise<T> {
    const user = await query;

    if (!user) {
      throw new AppError("Invalid credentials", ResponseCodes.AUTH_INVALID_CREDENTIALS, 401);
    }

    if (!user.isActive) {
      throw new AppError("Account is deactivated", ResponseCodes.AUTH_ACCOUNT_DEACTIVATED, 403);
    }

    const isPasswordValid = await comparePassword(passwordAttempt, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", ResponseCodes.AUTH_INVALID_CREDENTIALS, 401);
    }

    return user;
  }

  // Helper to find user by email or phone identifier
  private static async findUserByIdentifier(identifier: string): Promise<{ user: any; userType: UserRole }> {
    const isEmail = identifier.includes("@");
    let user;
    let userType: UserRole;

    if (isEmail) {
      user = await db
        .select()
        .from(admins)
        .where(eq(admins.email, identifier))
        .limit(1)
        .then((result) => result[0]);
      userType = UserRole.admin;
    } else {
      user = await db
        .select()
        .from(customers)
        .where(eq(customers.phone, identifier))
        .limit(1)
        .then((result) => result[0]);
      userType = UserRole.customer;
    }

    if (!user) {
      throw new AppError("User not found", ResponseCodes.AUTH_USER_NOT_FOUND, 404);
    }

    return { user, userType };
  }


  // Admin login
  static async loginAdmin(loginData: AdminLoginInput) {
    const { email, password } = loginData;

    const admin = await this.verifyUserCredentials(
      db
        .select()
        .from(admins)
        .where(eq(admins.email, email))
        .limit(1)
        .then((result) => result[0]),
      password
    );

    // Generate JWT token
    const tokenPayload: JWTPayload = {
      id: admin.id,
      email: admin.email,
      role: UserRole.admin,
      type: UserRole.admin,
    };

    const token = generateToken(tokenPayload);

    return {
      token,
      user: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: UserRole.admin,
        type: UserRole.admin,
      },
    };
  }

  // Customer login
  static async loginCustomer(loginData: AdminLoginInput) {
    const { email, password } = loginData;

    const customer = await this.verifyUserCredentials(
      db
        .select()
        .from(customers)
        .where(eq(customers.phone, email))
        .limit(1)
        .then((result) => result[0]),
      password
    );

    // Generate JWT token
    const tokenPayload: JWTPayload = {
      id: customer.id,
      phone: customer.phone,
      role: UserRole.customer,
      type: UserRole.customer,
    };

    const token = generateToken(tokenPayload);

    return {
      token,
      user: {
        id: customer.id,
        email: customer.email,
        phone: customer.phone,
        firstName: customer.firstName,
        lastName: customer.lastName,
        role: UserRole.customer,
        type: UserRole.customer,
      },
    };
  }

  // Get user profile
  static async getUserProfile(userId: string, userType: UserRole) {
    if (userType === UserRole.admin) {
      const admin = await db
        .select({
          id: admins.id,
          email: admins.email,
          firstName: admins.firstName,
          lastName: admins.lastName,
          role: admins.role,
          isActive: admins.isActive,
          createdAt: admins.createdAt,
          updatedAt: admins.updatedAt,
        })
        .from(admins)
        .where(eq(admins.id, userId))
        .limit(1)
        .then((result) => result[0]);

      if (!admin) {
        throw new Error(ResponseCodes.AUTH_USER_NOT_FOUND);
      }

      return { ...admin, type: UserRole.admin };
    } else {
      const customer = await db
        .select({
          id: customers.id,
          email: customers.email,
          phone: customers.phone,
          firstName: customers.firstName,
          lastName: customers.lastName,
          address: customers.address,
          licenseNumber: customers.licenseNumber,
          isActive: customers.isActive,
          createdAt: customers.createdAt,
          updatedAt: customers.updatedAt,
        })
        .from(customers)
        .where(eq(customers.id, userId))
        .limit(1)
        .then((result) => result[0]);

      if (!customer) {
        throw new Error(ResponseCodes.AUTH_USER_NOT_FOUND);
      }

      return {
        ...customer,
        type: UserRole.customer,
        role: UserRole.customer,
      };
    }
  }

  // Change password
  static async changePassword(
    userId: string,
    userType: UserRole,
    currentPassword: string,
    newPassword: string
  ) {
    let user;

    if (userType === UserRole.admin) {
      user = await db
        .select()
        .from(admins)
        .where(eq(admins.id, userId))
        .limit(1)
        .then((result) => result[0]);
    } else {
      user = await db
        .select()
        .from(customers)
        .where(eq(customers.id, userId))
        .limit(1)
        .then((result) => result[0]);
    }

    if (!user) {
      throw new AppError("User not found", ResponseCodes.AUTH_USER_NOT_FOUND, 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new AppError("Current password is incorrect", ResponseCodes.AUTH_INVALID_CREDENTIALS, 400);
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    if (userType === UserRole.admin) {
      await db
        .update(admins)
        .set({ password: hashedNewPassword })
        .where(eq(admins.id, userId));
    } else {
      await db
        .update(customers)
        .set({ password: hashedNewPassword })
        .where(eq(customers.id, userId));
    }

    return { message: "Password changed successfully" };
  }

  static async forgotPassword(identifier: string) {
    const { user, userType } = await this.findUserByIdentifier(identifier);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Delete any existing OTPs for this user
    if (userType === UserRole.admin) {
      await db.delete(otps).where(eq(otps.adminId, user.id));
    } else {
      await db.delete(otps).where(eq(otps.customerId, user.id));
    }

    // Insert new OTP
    await db.insert(otps).values(
      userType === UserRole.admin
        ? { adminId: user.id, otp, expiresAt }
        : { customerId: user.id, otp, expiresAt }
    );

    // Mock send OTP
    console.log(`[MOCK OTP] Sending OTP ${otp} to ${identifier}`);

    return { message: ResponseCodes.AUTH_OTP_SENT };
  }

  static async resetPasswordWithOtp(
    identifier: string,
    otp: string,
    newPassword: string
  ) {
    const { user, userType } = await this.findUserByIdentifier(identifier);

    // Find OTP record for this user
    const otpRecord = await db
      .select()
      .from(otps)
      .where(
        userType === UserRole.admin
          ? eq(otps.adminId, user.id)
          : eq(otps.customerId, user.id)
      )
      .limit(1)
      .then((result) => result[0]);

    if (!otpRecord) {
      throw new AppError("Invalid OTP", ResponseCodes.AUTH_OTP_INVALID, 400);
    }

    // Verify OTP matches
    if (otpRecord.otp !== otp) {
      throw new AppError("Invalid OTP", ResponseCodes.AUTH_OTP_INVALID, 400);
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      // Delete expired OTP
      await db.delete(otps).where(eq(otps.id, otpRecord.id));
      throw new AppError("OTP expired", ResponseCodes.AUTH_OTP_EXPIRED, 400);
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Executing update and delete in a transaction for atomicity
    await db.transaction(async (tx) => {
      // Update password
      if (userType === UserRole.admin) {
        await tx
          .update(admins)
          .set({ password: hashedNewPassword })
          .where(eq(admins.id, user.id));
      } else {
        await tx
          .update(customers)
          .set({ password: hashedNewPassword })
          .where(eq(customers.id, user.id));
      }

      // Delete used OTP
      await tx.delete(otps).where(eq(otps.id, otpRecord.id));
    });

    return { message: ResponseCodes.AUTH_PASSWORD_RESET_SUCCESS };
  }

  // Create Admin User
  static async createAdmin(input: CreateAdminInput) {
    // Check if email already exists
    const existingAdmin = await db
      .select()
      .from(admins)
      .where(eq(admins.email, input.email))
      .limit(1)
      .then((result) => result[0]);

    if (existingAdmin) {
      throw new AppError(
        "Email already registered",
        ResponseCodes.AUTH_EMAIL_ALREADY_EXISTS,
        400
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(input.password);

    // Create admin
    const newAdmin = await db
      .insert(admins)
      .values({
        email: input.email,
        password: hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName,
        role: (input.role || UserRole.admin) as typeof UserRole.admin,
        isActive: true,
        updatedAt: new Date(),
      })
      .returning();

    return {
      id: newAdmin[0]!.id,
      email: newAdmin[0]!.email,
      firstName: newAdmin[0]!.firstName,
      lastName: newAdmin[0]!.lastName,
      role: newAdmin[0]!.role,
    };
  }
}
