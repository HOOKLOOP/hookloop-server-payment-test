import { Router } from "express";

import { planControllers } from "@/controllers";
import { asyncWrapper, verifyTokenMiddleware as verifyToken } from "@/middlewares";

const router = Router();
router.post("/createOrder", verifyToken, asyncWrapper(planControllers.createOrderForPayment));
router.post("/paymentNotify", planControllers.paymentNotify);
router.post("/paymentReturn", asyncWrapper(planControllers.paymentReturn));

export default router;
