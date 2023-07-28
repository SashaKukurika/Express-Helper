import { NextFunction, Request, Response } from "express";

import { ApiError } from "../errors";
import { User } from "../models/User.model";
import { IUser } from "../types/user.type";

class UserMiddleware {
  // keyof дозволить використовувати в якості філди лише ключі з обєкту IUser
  public isUserExist<T>(field: keyof T) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = await User.findOne({ [field]: req.body[field] });

        if (!user) {
          throw new ApiError("User not exist", 422);
        }

        req.res.locals.user = user;

        next();
      } catch (e) {
        next(e);
      }
    };
  }
  public findAndThrow(field: keyof IUser) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = await User.findOne({ [field]: req.body[field] });

        if (user) {
          throw new ApiError("User with this email already exist", 409);
        }

        next();
      } catch (e) {
        next(e);
      }
    };
  }
}

export const userMiddleware = new UserMiddleware();
