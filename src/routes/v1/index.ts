import { Router } from "express";

import plansRoutes from "./plansRoutes";
import userRoutes from "./userRoutes";

const router = Router();

router.use("/users", userRoutes);
router.use("/plans", plansRoutes);

export default router;
