// Global type definitions
export interface CustomError extends Error {
  statusCode?: number;
  stack?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    role?: string;
    email?: string;
    type?: string;
    [key: string]: unknown;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface DatabaseConfig {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
}

export interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  DB_CONFIG: DatabaseConfig;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  LOG_LEVEL: string;
}
