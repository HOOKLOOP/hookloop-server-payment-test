import { Router } from "express";

import { userControllers } from "@/controllers";
import { asyncWrapper, verifyUserInputMiddleware as verifyUserInput } from "@/middlewares";

const router = Router();
router.post("", verifyUserInput, asyncWrapper(userControllers.createUser));

export default router;
