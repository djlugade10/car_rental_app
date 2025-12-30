import { Router, type Request, type Response } from "express";

const router = Router();

// Root route
router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Car Rental API is running!",
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});



export default router;
