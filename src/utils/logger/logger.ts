import type { NextFunction, Request, Response } from "express";

// ---- Simple logger for serverless environment ----
const writeLog = (level: string, message: string) => {
  const logLine = `[${new Date().toISOString()}] [${level}] ${message}`;
  console.log(logLine);
};

// ---- Express Middleware ----
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const msg = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms - IP: ${req.ip}`;
    writeLog("INFO", msg);
  });

  next();
};

// ---- Public API ----
export const info = (msg: string) => writeLog("INFO", msg);
export const warn = (msg: string) => writeLog("WARN", msg);
export const error = (msg: string) => writeLog("ERROR", msg);
export { requestLogger };
