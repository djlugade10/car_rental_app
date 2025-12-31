export enum UserRole {
  admin = "admin",
  customer = "customer",
}


export enum FuelType {
  gasoline = "gasoline",
  diesel = "diesel",
  electric = "electric",
  hybrid = "hybrid",
  cng = "cng", // Added based on user request
}

export enum TransmissionType {
  manual = "manual",
  automatic = "automatic",
  cvt = "cvt",
}

export enum CarStatus {
  active = "active",
  maintenance = "maintenance",
  outOfService = "outOfService",
  retired = "retired",
}
