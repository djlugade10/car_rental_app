import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create drizzle instance
export const db = drizzle(pool, { schema });

// Connection management
export const connectDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    client.release();
    console.log("✅ Connected to PostgreSQL database via Drizzle ORM");
  } catch (error) {
    console.error("❌ Database connection error:", error);
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
    console.error("❌ Error closing database connection:", error);
    throw error;
  }
};
