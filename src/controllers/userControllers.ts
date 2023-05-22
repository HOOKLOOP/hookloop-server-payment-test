import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";

// BUG: 使用 multer 套件型別打架
// import fileupload from "express-fileupload";
import dbOptions from "@/config/dbOptions";
import { forwardCustomError } from "@/middlewares";
import { User, Workspace } from "@/models";
import { IUser } from "@/models/userModel";
import { ApiResults, IQueryUsersRequest, StatusCode } from "@/types";
import { filteredUndefinedConditions, getJwtToken, getUserIdByToken, sendSuccessResponse } from "@/utils";
import fileHandler from "@/utils/fileHandler";

const getUsers = async (req: IQueryUsersRequest, res: Response, next: NextFunction) => {
  const { email, isArchived } = req.body;
  const queryConditions = filteredUndefinedConditions({ email, isArchived });
  const targetUsers = await User.find(queryConditions);
  if (!targetUsers) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_TO_GET_DATA, {
      field: "email",
      error: "The email is not existing!",
    });
  }
  sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, targetUsers);
};

// workspace 用來搜尋使用者
const getMember = async (req: Request, res: Response) => {
  const { email } = req.params;

  const members = await User.find({
    // regex: 只要 User Schema 的 email 部分包含 req.params.email 就回傳資料
    // options.i: 用來忽略大小寫搜尋
    email: { $regex: email, $options: "i" },
    // username 欄位存在才回傳
    username: { $ne: null },
  }).select("email avatar username"); // 只回傳 {email, avatar, username} 給前端

  sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, {
    members,
  });
};

const getUserById = async (req: Request, res: Response) => {
  const { id } = req.user as IUser;
  const workspaceData = await Workspace.find({ members: id });

  sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, {
    userData: req.user,
    workspaceData,
  });
};

const deleteAllUsers = async (_: Request, res: Response) => {
  await User.deleteMany({});
  sendSuccessResponse(res, ApiResults.SUCCESS_DELETE, {
    users: [],
  });
};

const deleteUserById = async (req: Request, res: Response, next: NextFunction) => {
  const bearerToken = req.headers.authorization;
  const token = bearerToken ? getUserIdByToken(bearerToken.split(" ")[1]) : "";

  const { userId } = token as { userId: string };
  const targetUser = await User.findById(userId);

  if (!token || !targetUser) {
    forwardCustomError(next, StatusCode.UNAUTHORIZED, ApiResults.FAIL_TO_GET_DATA, {
      field: "userId",
      error: "The user is not existing!",
    });
  } else if (token && targetUser) {
    const userData = await User.findByIdAndUpdate(userId, { isArchived: true }, dbOptions);
    sendSuccessResponse(res, ApiResults.SUCCESS_UPDATE, {
      userData,
    });
  }
};

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
  const newUser = await User.create({
    username,
    email,
    password: securedPassword,
    avatar,
    lastActiveTime: Date.now(),
  });
  const token = getJwtToken(newUser.id!);
  sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, {
    token,
    username: newUser.username,
  });
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const bearerToken = req.headers.authorization;
  const token = bearerToken ? getUserIdByToken(bearerToken.split(" ")[1]) : "";

  const { userId } = token as { userId: string };
  const targetUser = await User.findById(userId);

  const { username, email, avatar, isArchived } = req.body;
  const { files } = req;

  if (!token || !targetUser) {
    forwardCustomError(next, StatusCode.UNAUTHORIZED, ApiResults.FAIL_TO_GET_DATA, {
      field: "userId",
      error: "The user is not existing!",
    });
  } else if (email) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
      field: "email",
      error: "Email cannot be changed!",
    });
  } else if (avatar || files) {
    if (avatar) {
      // for testing purpose (remove avatar)
      const data = await User.findByIdAndUpdate(userId, { avatar: "" }, dbOptions);
      sendSuccessResponse(res, ApiResults.SUCCESS_UPDATE, { userData: data });
    }

    if (!files || !Object.keys(files).length) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FILE_HANDLER_FAIL);
    } else {
      // INFO: 改用 multer 套件處理上傳檔案驗證
      let validFile = null;
      if (req.file) {
        validFile = req.file;
      }
      if (!validFile) {
        forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FILE_HANDLER_FAIL);
      } else {
        // upload avatar
        const uploadedFileMeta = await fileHandler.filePost(validFile, next);
        const { fileId } = uploadedFileMeta as { fileId: string };

        const newData = await User.findByIdAndUpdate(userId, { avatar: fileId }, dbOptions);
        sendSuccessResponse(res, ApiResults.SUCCESS_UPDATE, { userData: newData });
      }
    }
  } else if (username || isArchived) {
    const userData = await User.findByIdAndUpdate(userId, req.body, dbOptions);
    sendSuccessResponse(res, ApiResults.SUCCESS_UPDATE, { userData });
  } else {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
      field: "",
      error: "The column is not existing!",
    });
  }
};

const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  const { newPassword, oldPassword } = req.body;

  if (oldPassword) {
    const bearerToken = req.headers.authorization;
    const token = bearerToken ? getUserIdByToken(bearerToken.split(" ")[1]) : "";

    const { userId } = token as { userId: string };

    const targetUser = await User.findById(userId).select("+password");
    const isPasswordCorrect = await bcrypt.compare(oldPassword, targetUser?.password || "");

    if (!isPasswordCorrect) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "password",
        error: "The password is not correct!",
      });
    } else {
      const securedPassword = await bcrypt.hash(newPassword, 12);
      const newData = await User.findByIdAndUpdate(userId, { password: securedPassword }, dbOptions);

      sendSuccessResponse(res, ApiResults.SUCCESS_UPDATE, { userData: newData });
    }
  }
};

export default {
  getUsers,
  getMember,
  getUserById,
  createUser,
  updateUser,
  deleteAllUsers,
  deleteUserById,
  updatePassword,
};
