import { NextFunction, Request, Response } from "express";

import { avatarConfig } from "../configs/file.configs";
import { ApiError } from "../errors";

class FileMiddleware {
  // огорнули наш метод в функцію щоб могти динамічно передавати філду з роутера в наш метод
  public isAvatarValid(req: Request, res: Response, next: NextFunction) {
    try {
      // перевіряємо чи че масив
      if (Array.isArray(req.files.avatar)) {
        throw new ApiError("Avatar must be only one file", 400);
      }

      const { mimetype, size } = req.files.avatar;

      // якщо аватар не того формату що ми задали кидаємо помилку
      if (!avatarConfig.MIMETYPES.includes(mimetype)) {
        throw new ApiError("Avatar has invalid format", 400);
      }

      if (size > avatarConfig.MAX_SIZE) {
        throw new ApiError("Avatar too big", 400);
      }

      next();
    } catch (e) {
      next(e);
    }
  }
}

export const fileMiddleware = new FileMiddleware();
