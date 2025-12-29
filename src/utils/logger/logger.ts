import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import type { NextFunction, Request, Response } from "express";

dotenv.config();

// ---- Config ----
const MASKING_ENABLED = process.env.LOG_MASKING === "true";
const IS_VERCEL = process.env.VERCEL === "1" || process.env.VERCEL === "true";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LOG_DIR = IS_VERCEL
  ? "/tmp/logs"
  : process.env.LOG_DIR || path.join(__dirname, "../../assets/logs");

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "otp",
  "authorization",
  "x-api-key",
]);

// ---- Ensure logs directory exists (local only) ----
if (!IS_VERCEL) {
  fs.mkdir(LOG_DIR, { recursive: true }).catch((e) =>
    console.error("Logger dir creation failed:", e.message)
  );
}

// ---- Helpers ----
const getLogFilePath = () =>
  path.join(LOG_DIR, `${new Date().toISOString().slice(0, 10)}.log`);

const writeLog = async (level: string, message: string) => {
  const logLine = `[${new Date().toISOString()}] [${level}] ${message}`;

  // Always log to console
  console.log(logLine);

  if (!IS_VERCEL) {
    try {
      await fs.appendFile(getLogFilePath(), `${logLine}\n`);
    } catch (e) {
      console.error("Logger write error:", (e as Error).message);
    }
  }
};

const maskSensitive = (
  obj: Record<string, unknown> | null | undefined
): Record<string, unknown> | null | undefined => {
  if (!obj || typeof obj !== "object" || !MASKING_ENABLED) return obj;

  const clone: Record<string, unknown> = { ...obj };
  for (const key of Object.keys(clone)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      clone[key] = "****";
    }
  }
  return clone;
};

// ---- Express Middleware ----
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  let responseBody: unknown;

  const oldJson = res.json.bind(res);
  res.json = <T>(body: T): Response => {
    responseBody = body;
    return oldJson(body);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    const msg = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms - IP: ${req.ip}`;

    void writeLog("INFO", msg);
  });

  next();
};

// ---- Public API ----
export const info = (msg: string) => writeLog("INFO", msg);
export const warn = (msg: string) => writeLog("WARN", msg);
export const error = (msg: string) => writeLog("ERROR", msg);
export { requestLogger };
