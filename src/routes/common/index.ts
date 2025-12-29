import { Router } from "express";
import carRouter from "./cars";
import authRouter from "./auth";

const router = Router();


router.use("/", carRouter);
router.use("/auth", authRouter);

export default router;
