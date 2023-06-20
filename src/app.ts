import express, { NextFunction, Request, Response } from "express"; // витягуємо і інсталимо
import * as mongoose from "mongoose";

import { configs } from "./configs/configs";
import { ApiError } from "./errors";
import { User } from "./models/User.model";
import { IUser } from "./types/user.type";
import { UserValidator } from "./validators";

const app = express(); // пишемо app для зручності використання в подальшому, вже як виклик функції

app.use(express.json()); // ці два використовуються для того щоб наша апка могла читати body і квері
app.use(express.urlencoded({ extended: true }));

// CRUD - create, read, update, delete

app.get(
  "/users",
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<IUser[]>> => {
    try {
      const users = await User.find();

      return res.json(users);
    } catch (e) {
      next(e);
    }
  }
);

app.post(
  "/users",
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<IUser>> => {
    try {
      // викликаємо валідатор, передаємо що саме мусить валідуватись, і витягуємо ерорки і саме вже провалідоване
      // значення
      const { error, value } = UserValidator.create.validate(req.body);
      // якщо не пройшло валідацію кидаємо помилку
      if (error) {
        throw new ApiError(error.message, 400);
      }
      // якщо ж пройшло то ми передаємо вже провалідоване значення в базу для створення
      const createdUser = await User.create(value);

      return res.status(201).json(createdUser);
    } catch (e) {
      next(e);
    }
  }
);
app.get(
  "/users/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.params.id);

      res.status(200).json(user);
    } catch (e) {
      next(e);
    }
  }
);
app.put(
  "/users/:id",
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<IUser>> => {
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
);

app.delete(
  "/users/:id",
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<void>> => {
    try {
      await User.deleteOne({ _id: req.params.id });

      return res.status(200);
    } catch (e) {
      // це вказує що ерорку потрібно передати далі
      next(e);
    }
  }
);

// тут ми відловлюємо усі ерорки що випали з роутів, обовязково має бути 4 аргументи в колбеці, бо саме коли їх
// чотири то перша ерорка
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  // з ерорки дістаємо статус який ми передали, або 500 по дефолту якщо немає статуса
  const status = error.status || 500;
  // витягнули повідомлення і передали як респонс
  return res.status(status).json(error.message);
});

app.listen(configs.DB_PORT, () => {
  // підключаємо mongoose
  // також можна ввести mongodb://localhost:27017/dec-2022 або mongodb://127.0.0.1:27017/dec-2022
  mongoose.connect(configs.DB_URL);
  console.log(`Server has started on PORT ${configs.DB_PORT}`);
}); // буде слухати порт, топто івентлуп буде завжди працювати і чекати на нові реквести щоб їх обробити
