

import { Router } from "express";
import { CommonCarController } from "@src/controllers/common/carController";

const router = Router();

router.get("/cars", CommonCarController.getCars);
router.get("/cars/:id", CommonCarController.getCarById);

export default router;
