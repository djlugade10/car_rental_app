import * as fs from "node:fs";
import type { NextFunction, Request, Response } from "express";

// ---- Configs ----
const RATE_LIMIT_WINDOW = 10 * 1000; // 10 seconds
const MAX_REQUESTS = 10;
const OFFENSE_RESET_WINDOW = 2 * 60 * 1000; // 2 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 mins

// ---- Types ----
interface OffenseData {
  count: number;
  lastOffenseTime: number;
}

type RequestMap = Record<string, number[]>;
type OffenseMap = Record<string, OffenseData>;
type CooldownMap = Record<string, number>;

// ---- State ----
const requestMap: RequestMap = {};
const offenseMap: OffenseMap = {};
const cooldownMap: CooldownMap = {};

// ---- Helpers ----
const logAbuse = (userKey: string, offenseCount: number): void => {
  const logMsg = `${new Date().toISOString()} | ${userKey} | offense: ${offenseCount}\n`;
  // Ensure logs directory exists
  fs.mkdir("./logs", { recursive: true }, () => {
    fs.appendFile("./logs/abuse.log", logMsg, () => { });
  });
};

const sendAlert = (userKey: string, offenses: number): void => {
  if (offenses >= 5) {
    // TODO: Integrate email/Slack alert system
    console.warn(
      `[ALERT] Abuse detected for ${userKey} - offenses: ${offenses}`
    );
  }
};

// ---- Memory cleanup ----
setInterval(() => {
  const now = Date.now();

  for (const userKey in requestMap) {
    const timestamps = requestMap[userKey];
    if (!timestamps) continue;

    const last = timestamps[timestamps.length - 1];
    if (timestamps.length === 0 || (last && now - last > RATE_LIMIT_WINDOW)) {
      delete requestMap[userKey];
    }
  }

  for (const userKey in offenseMap) {
    const offenseData = offenseMap[userKey];
    if (!offenseData) continue;

    if (now - offenseData.lastOffenseTime > OFFENSE_RESET_WINDOW) {
      delete offenseMap[userKey];
    }
  }

  for (const userKey in cooldownMap) {
    const cooldownTime = cooldownMap[userKey];
    if (cooldownTime === undefined) continue;

    if (cooldownTime < now) {
      delete cooldownMap[userKey];
    }
  }

  console.log(`[Cleanup] Memory cleared at ${new Date().toLocaleTimeString()}`);
}, CLEANUP_INTERVAL);

// ---- Rate limiter middleware ----
const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const now = Date.now();
  const ip = req.ip;
  const token = (req.headers.authorization as string) || "anon";
  const userKey = `rate:${token}:${ip}`;



  // 2. Check cooldown
  const cooldownUntil = cooldownMap[userKey];
  if (cooldownUntil && now < cooldownUntil) {
    const waitTime = Math.ceil((cooldownUntil - now) / 1000);
    res.status(429).json({
      success: false,
      message: `Too many requests. Cooldown: wait ${waitTime}s.`,
    });
    return;
  }

  // 3. Clean old timestamps
  if (!requestMap[userKey]) requestMap[userKey] = [];
  requestMap[userKey] = requestMap[userKey].filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW
  );

  // 4. Exceeds limit?
  if (requestMap[userKey].length >= MAX_REQUESTS) {
    const offenseData: OffenseData = offenseMap[userKey] || {
      count: 0,
      lastOffenseTime: 0,
    };

    // Reset if silence > OFFENSE_RESET_WINDOW
    if (now - offenseData.lastOffenseTime > OFFENSE_RESET_WINDOW) {
      offenseData.count = 0;
    }

    offenseData.count += 1;
    offenseData.lastOffenseTime = now;

    const cooldownDuration = 10_000 * 2 ** (offenseData.count - 1); // exponential backoff
    cooldownMap[userKey] = now + cooldownDuration;
    offenseMap[userKey] = offenseData;

    logAbuse(userKey, offenseData.count);
    sendAlert(userKey, offenseData.count);

    res.status(429).json({
      success: false,
      message: `Rate limit exceeded. Try again in ${cooldownDuration / 1000}s`,
    });
    return;
  }

  // 5. Accept request
  requestMap[userKey].push(now);

  // Reset cooldown if behaving well
  if (cooldownMap[userKey]) delete cooldownMap[userKey];

  next();
};

export { rateLimiter, offenseMap };
