import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Create connection pool with fallback configuration
const connectionConfig = process.env.DATABASE_URL
  ? {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  }
  : {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };

const pool = new Pool(connectionConfig);

// Create drizzle instance
export const db = drizzle(pool, { schema });

// Connection management
export const connectDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    client.release();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed");
    // Don't exit in production/serverless environment
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  }
};

export const closeDB = async (): Promise<void> => {
  try {
    await pool.end();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error closing database connection");
    throw error;
  }
};
