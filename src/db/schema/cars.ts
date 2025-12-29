import {
  pgTable,
  serial,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { admins } from "./users";
import { nanoid } from "nanoid";

import { FuelType, TransmissionType, CarStatus } from "@src/constants/enums";

// Enums
export const fuelTypeEnum = pgEnum("FuelType", [
  FuelType.GASOLINE,
  FuelType.DIESEL,
  FuelType.ELECTRIC,
  FuelType.HYBRID,
]);

export const transmissionTypeEnum = pgEnum("TransmissionType", [
  TransmissionType.MANUAL,
  TransmissionType.AUTOMATIC,
  TransmissionType.CVT,
]);

export const carStatusEnum = pgEnum("CarStatus", [
  CarStatus.ACTIVE,
  CarStatus.MAINTENANCE,
  CarStatus.OUT_OF_SERVICE,
  CarStatus.RETIRED,
]);

// Categories table
export const categories = pgTable("categories", {
  id: varchar("id", { length: 10 }).primaryKey().$defaultFn(() => nanoid(10)),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Fleets table
export const fleets = pgTable("fleets", {
  id: varchar("id", { length: 10 }).primaryKey().$defaultFn(() => nanoid(10)),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  managerId: integer("manager_id"), // Assuming this might be an admin ID? If so, it should be changed too, but checking context first.
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Cars table
// Cars table
export const cars = pgTable("cars", {
  id: varchar("id", { length: 10 }).primaryKey().$defaultFn(() => nanoid(10)),
  model: varchar("model", { length: 100 }).notNull(),
  brand: varchar("brand", { length: 50 }).notNull(),
  year: integer("year").notNull(),
  color: varchar("color", { length: 30 }),
  licensePlate: varchar("license_plate", { length: 20 }).notNull().unique(),
  pricePerDay: decimal("price_per_day", { precision: 10, scale: 2 }).notNull(),
  available: boolean("available").default(true).notNull(),
  mileage: integer("mileage"),
  fuelType: fuelTypeEnum("fuel_type").default(FuelType.GASOLINE).notNull(),
  transmission: transmissionTypeEnum("transmission").default(TransmissionType.MANUAL).notNull(),
  seats: integer("seats").default(5).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 500 }),
  vin: varchar("vin", { length: 17 }),
  insuranceExpiry: timestamp("insurance_expiry"),
  registrationExpiry: timestamp("registration_expiry"),
  lastServiceDate: timestamp("last_service_date"),
  nextServiceDue: timestamp("next_service_due"),
  status: carStatusEnum("status").default(CarStatus.ACTIVE).notNull(),
  adminId: varchar("admin_id", { length: 10 }).notNull(),
  categoryId: varchar("category_id", { length: 10 }).notNull(),
  fleetId: varchar("fleet_id", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const carsRelations = relations(cars, ({ one }) => ({
  admin: one(admins, {
    fields: [cars.adminId],
    references: [admins.id],
  }),
  category: one(categories, {
    fields: [cars.categoryId],
    references: [categories.id],
  }),
  fleet: one(fleets, {
    fields: [cars.fleetId],
    references: [fleets.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  cars: many(cars),
}));

export const fleetsRelations = relations(fleets, ({ many }) => ({
  cars: many(cars),
}));

// Type inference
export type Car = typeof cars.$inferSelect;
export type NewCar = typeof cars.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Fleet = typeof fleets.$inferSelect;
export type NewFleet = typeof fleets.$inferInsert;
