import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";

import { userService } from "../services/user.service";
import { IUser } from "../types/user.type";

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
      const createdUser = await userService.create(req.body);

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
      const { userId } = req.params;
      const user = await userService.findById(userId);

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
      const { userId } = req.params;

      const updatedUser = await userService.updateById(userId, req.body);

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
      const { userId } = req.params;

      await userService.deleteById(userId);

      return res.sendStatus(204);
    } catch (e) {
      // це вказує що ерорку потрібно передати далі
      next(e);
    }
  }

  public async uploadAvatar(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<void>> {
    try {
      const { userId } = req.params;
      // пишемо as UploadedFile щоб тайпскріпт розумів що це один файл а не масив
      const avatar = req.files.avatar as UploadedFile;

      const user = await userService.uploadAvatar(userId, avatar);

      return res.status(201).json(user);
    } catch (e) {
      // це вказує що ерорку потрібно передати далі
      next(e);
    }
  }

  public async deleteAvatar(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<void>> {
    try {
      const { userId } = req.params;

      await userService.deleteById(userId);

      return res.sendStatus(204);
    } catch (e) {
      // це вказує що ерорку потрібно передати далі
      next(e);
    }
  }
}

export const userController = new UserController();
