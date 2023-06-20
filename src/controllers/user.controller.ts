import { NextFunction, Request, Response } from "express";

import { ApiError } from "../errors";
import { User } from "../models/User.model";
import { userService } from "../services/user.service";
import { IUser } from "../types/user.type";
import { UserValidator } from "../validators";

class UserController {
  public async findAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<IUser[]>> {
    try {
      const users = await userService.findAll();

      return res.json(users);
    } catch (e) {
      next(e);
    }
  }

  public async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<IUser>> {
    try {
      // as IUser можна вказувати як що портібно валідувати по типізації
      const createdUser = await userService.create(req.res.locals as IUser);

      return res.status(201).json(createdUser);
    } catch (e) {
      next(e);
    }
  }

  public async findById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<IUser>> {
    try {
      const user = await userService.findById(req.params.id);

      return res.status(200).json(user);
    } catch (e) {
      next(e);
    }
  }

  public async updateById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<IUser>> {
    try {
      // викликаємо валідатор, передаємо що саме мусить валідуватись, і витягуємо ерорки і саме вже провалідоване
      // значення
      const { error, value } = UserValidator.create.validate(req.body);
      // якщо не пройшло валідацію кидаємо помилку
      if (error) {
        throw new ApiError(error.message, 400);
      }

      const { id } = req.params;

      const updatedUser = await User.findOneAndUpdate(
        // _id пишемо бо так в монгусі
        { _id: id },
        // другий параметр це те що ми оновлюємо саме
        { ...value },
        // покаже вже обєкт після оновлень а не до
        { returnDocument: "after" }
      );
      return res.status(200).json(updatedUser);
    } catch (e) {
      next(e);
    }
  }

  public async deleteById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<void>> {
    try {
      await User.deleteOne({ _id: req.params.id });

      return res.status(200);
    } catch (e) {
      // це вказує що ерорку потрібно передати далі
      next(e);
    }
  }
}

export const userController = new UserController();
