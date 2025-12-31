import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { UserRole } from "@src/constants/enums";

// Enums
export const adminRoleEnum = pgEnum("AdminRole", [UserRole.admin]);

// Admin table
export const admins = pgTable("admins", {
  id: varchar("id", { length: 10 }).primaryKey().$defaultFn(() => nanoid(10)),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  role: adminRoleEnum("role").default(UserRole.admin).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Customer table
export const customers = pgTable("customers", {
  id: varchar("id", { length: 10 }).primaryKey().$defaultFn(() => nanoid(10)),
  email: varchar("email", { length: 255 }),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  address: text("address"),
  licenseNumber: varchar("license_number", { length: 50 }).notNull().unique(),
  dateOfBirth: timestamp("date_of_birth"),
  emergencyContact: varchar("emergency_contact", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


// OTP table for password reset
export const otps = pgTable("otps", {
  id: serial("id").primaryKey(),
  adminId: varchar("admin_id", { length: 10 }).references(() => admins.id, { onDelete: "cascade" }),
  customerId: varchar("customer_id", { length: 10 }).references(() => customers.id, { onDelete: "cascade" }),
  otp: varchar("otp", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Otp = typeof otps.$inferSelect;
export type NewOtp = typeof otps.$inferInsert;
