import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import { User } from "@/models";
import Plan from "@/models/planModel";
import { ApiResults, PlanOptions, StatusCode } from "@/types";
import { getJwtToken, getPriceByPlan, sendSuccessResponse } from "@/utils";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password, avatar } = req.body;
  const hasExistingEmail = await User.findOne({ email });
  if (hasExistingEmail) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
      field: "email",
      error: "The email is existing!",
    });
    return;
  }

  const securedPassword = await bcrypt.hash(password, 12);
  // 新建會員資料
  const newUser = await User.create({
    username,
    email,
    password: securedPassword,
    avatar,
    lastActiveTime: Date.now(),
  });
  // 新建方案資料
  const oneMonth = 30 * 24 * 60 * 60 * 1000;
  const newPlan = await Plan.create({
    name: PlanOptions.PREMIUM,
    price: getPriceByPlan(PlanOptions.PREMIUM),
    endAt: Date.now() + oneMonth, // 1 month
    userId: newUser.id,
    status: "UN-PAID",
  });
  const token = getJwtToken(newUser.id!);
  sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, {
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      avatar: newUser.avatar,
      isArchived: newUser.isArchived,
      lastActiveTime: newUser.lastActiveTime,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
      currentPlan: {
        userId: newPlan.userId,
        name: newPlan.name,
        endAt: newPlan.endAt,
        status: newPlan.status,
      },
    },
  });
};

export default {
  createUser,
};
