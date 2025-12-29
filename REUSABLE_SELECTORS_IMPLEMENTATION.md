# Reusable Database Selectors Implementation

## Problem Solved

Previously, every Drizzle query required writing long, repetitive select objects like:

```typescript
.select({
  id: cars.id,
  model: cars.model,
  brand: cars.brand,
  year: cars.year,
  color: cars.color,
  licensePlate: cars.licensePlate,
  pricePerDay: cars.pricePerDay,
  available: cars.available,
  mileage: cars.mileage,
  fuelType: cars.fuelType,
  transmission: cars.transmission,
  seats: cars.seats,
  description: cars.description,
  imageUrl: cars.imageUrl,
  vin: cars.vin,
  insuranceExpiry: cars.insuranceExpiry,
  registrationExpiry: cars.registrationExpiry,
  lastServiceDate: cars.lastServiceDate,
  nextServiceDue: cars.nextServiceDue,
  status: cars.status,
  adminId: cars.adminId,
  categoryId: cars.categoryId,
  fleetId: cars.fleetId,
  createdAt: cars.createdAt,
  updatedAt: cars.updatedAt,
  admin: {
    id: admins.id,
    firstName: admins.firstName,
    lastName: admins.lastName,
    email: admins.email,
  },
  category: {
    id: categories.id,
    name: categories.name,
    description: categories.description,
  },
})
```

This was repeated across multiple services and methods, making the code:

- Hard to maintain
- Error-prone
- Inconsistent
- Verbose

## Solution Implemented

Created reusable selector objects in `src/db/selectors/` directory:

### File Structure

```
src/db/selectors/
├── index.ts              # Central export file
├── carSelectors.ts       # Car-related selectors
├── fleetSelectors.ts     # Fleet-related selectors
├── bookingSelectors.ts   # Booking-related selectors
└── README.md            # Documentation
```

### Available Selectors

#### Car Selectors

- `carBaseSelect` - All car fields without relations
- `carListSelect` - Minimal car fields for list views
- `carDetailsSelect` - Car fields for detail views
- `carWithAdminAndCategory` - Car with admin and category relations
- `carWithAllRelations` - Car with all possible relations

#### Fleet Selectors

- `fleetBaseSelect` - All fleet fields
- `fleetWithCarsSelect` - Fleet with basic car information
- `fleetWithCarsAndCategoriesSelect` - Fleet with cars and their categories

#### Booking Selectors

- `bookingBaseSelect` - All booking fields
- `bookingWithCarAndCustomer` - Booking with car and customer relations
- `bookingWithCarCustomerAndPayment` - Booking with all relations including payment

#### Individual Field Selectors

- `adminSelect` - Admin fields for relations
- `categorySelect` - Category fields for relations
- `fleetSelect` - Fleet fields for relations
- `bookingCarSelect` - Minimal car fields for booking queries
- `bookingCustomerSelect` - Customer fields for booking queries
- `bookingPaymentSelect` - Payment fields for booking queries

## Usage Examples

### Before (Repetitive)

```typescript
const result = await db
  .select({
    id: cars.id,
    model: cars.model,
    // ... 20+ more fields
    admin: {
      id: admins.id,
      firstName: admins.firstName,
      lastName: admins.lastName,
      email: admins.email,
    },
    category: {
      id: categories.id,
      name: categories.name,
      description: categories.description,
    },
  })
  .from(cars)
  .leftJoin(admins, eq(cars.adminId, admins.id))
  .leftJoin(categories, eq(cars.categoryId, categories.id));
```

### After (Clean)

```typescript
import { carWithAdminAndCategory } from "@src/db/selectors";

const result = await db
  .select(carWithAdminAndCategory)
  .from(cars)
  .leftJoin(admins, eq(cars.adminId, admins.id))
  .leftJoin(categories, eq(cars.categoryId, categories.id));
```

## Services Updated

### CarService

- `createCar()` - Now uses `carWithAdminAndCategory`
- `getCarById()` - Now uses `carWithAdminAndCategory`
- `getFilteredCars()` - Now uses `carWithAdminAndCategory`

### FleetService

- `createFleet()` - Now uses `fleetWithCarsSelect`
- `getPaginatedFleets()` - Now uses `fleetWithCarsSelect`
- `getFleetById()` - Now uses `fleetWithCarsAndCategoriesSelect`
- `updateFleet()` - Now uses `fleetWithCarsSelect`

### BookingService

- `createBooking()` - Now uses `bookingWithCarAndCustomer`
- `getPaginatedBookings()` - Now uses `bookingWithCarCustomerAndPayment`

## Benefits Achieved

1. **Reduced Code Duplication**: Eliminated 100+ lines of repetitive select objects
2. **Improved Maintainability**: Field changes only need to be made in one place
3. **Better Consistency**: All queries use the same field selections
4. **Enhanced Readability**: Query code is now focused on business logic, not field selection
5. **Type Safety**: Full TypeScript support with proper inference
6. **Easier Testing**: Consistent data structures across all queries

## TypeScript Improvements

Fixed several TypeScript errors:

- Added null checks with non-null assertion operator (`!`) where appropriate
- Removed unused imports (`like`, `asc`)
- Ensured proper type inference for all selectors

## Documentation

Created comprehensive documentation in `src/db/selectors/README.md` explaining:

- How to use the selectors
- Available selector types
- Benefits of the approach
- Guidelines for adding new selectors

## Future Enhancements

The selector pattern can be extended to:

- Add more specialized selectors for specific use cases
- Create selectors for other entities (users, payments, etc.)
- Implement conditional selectors based on user permissions
- Add performance-optimized selectors for different query types

This implementation provides a solid foundation for maintainable and consistent database queries throughout the application.
