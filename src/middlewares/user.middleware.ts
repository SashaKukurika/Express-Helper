import { NextFunction, Request, Response } from "express";

import { ApiError } from "../errors";
import { UserValidator } from "../validators";

class UserMiddleware {
  public isCreateValid(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = UserValidator.create.validate(req.body);
      // якщо не пройшло валідацію кидаємо помилку
      if (error) {
        throw new ApiError(error.message, 400);
      }
      // для req.res який є обєктом створюємо нове значення locals в яке записуємо що захочемо в даному випадку value, щоб
      // ми змогли це забрати в контролері
      req.res.locals = value;

      next();
    } catch (e) {
      next(e);
    }
  }
}

export const userMiddleware = new UserMiddleware();
