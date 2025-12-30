import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express, { type Application } from "express";
import dotenv from "dotenv";

dotenv.config();

import corsOptions from "@src/config/corsOptions";
import { connectDB, closeDB } from "@src/db/connection";
import errorHandler from "@src/middlewares/errorHandler";
import { rateLimiter } from "@src/middlewares/rateLimiter";
import { requestLogger } from "@src/utils/logger/logger";
import healthRoutes from "@src/routes/health";
import adminRoutes from "@src/routes/admin";
import customerRoutes from "@src/routes/customer";
import commonRoutes from "@src/routes/common";
// ---- Resolve __dirname for ESM ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();
const PORT = process.env.PORT || 8000;

// ---- Middleware ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(rateLimiter);

// CORS (with preflight handling)
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Logging
app.use(requestLogger);

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

app.use("/", healthRoutes);
app.use("/api/v1/common", commonRoutes);
app.use("/api/v1/admin", adminRoutes); // Handles both Admin and SuperAdmin (SuperAdmin inherits all Admin rights)
app.use("/api/v1/customer", customerRoutes);

app.use(errorHandler);

// ---- Start server ----
let server: any;
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`📝 Log Level: ${process.env.LOG_LEVEL}`);
  });
}

export default app;

// ---- Graceful shutdown ----
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  if (!server) {
    process.exit(0);
  }

  server.close(async () => {
    console.log("🔌 HTTP server closed");

    try {
      await closeDB();
      console.log("✅ Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error("⚠️ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
