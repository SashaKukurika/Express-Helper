import express, { Request, Response } from "express"; // витягуємо і інсталимо
import * as mongoose from "mongoose";

import { configs } from "./configs/configs";
import { User } from "./models/user.model";
import { IUser } from "./types/user.type";

const app = express(); // пишемо app для зручності використання в подальшому, вже як виклик функції

app.use(express.json()); // ці два використовуються для того щоб наша апка могла читати body і квері
app.use(express.urlencoded({ extended: true }));

// CRUD - create, read, update, delete

app.get(
  "/users",
  async (req: Request, res: Response): Promise<Response<IUser[]>> => {
    try {
      const users = await User.find();

      return res.json(users);
    } catch (e) {
      console.log(e);
    }
  }
);

app.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    res.status(200).json(user);
  } catch (e) {}
});

app.post(
  "/users",
  async (req: Request, res: Response): Promise<Response<IUser>> => {
    try {
      const createdUser = await User.create(req.body);

      return res.status(201).json(createdUser);
    } catch (e) {
      console.log(e);
    }
  }
);

app.put(
  "/users/:id",
  async (req: Request, res: Response): Promise<Response<IUser>> => {
    try {
      const { id } = req.params;

      const updatedUser = await User.findOneAndUpdate(
        // _id пишемо бо так в монгусі
        { _id: id },
        // другий параметр це те що ми оновлюємо саме
        { ...req.body },
        // покаже вже обєкт після оновлень а не до
        { returnDocument: "after" }
      );
      return res.status(200).json(updatedUser);
    } catch (e) {}
  }
);

app.delete(
  "/users/:id",
  async (req: Request, res: Response): Promise<Response<void>> => {
    try {
      await User.deleteOne({ _id: req.params.id });

      return res.status(200);
    } catch (e) {}
  }
);

app.listen(configs.DB_PORT, () => {
  // підключаємо mongoose
  // також можна ввести mongodb://localhost:27017/dec-2022 або mongodb://127.0.0.1:27017/dec-2022
  mongoose.connect(configs.DB_URL);
  console.log(`Server has started on PORT ${configs.DB_PORT}`);
}); // буде слухати порт, топто івентлуп буде завжди працювати і чекати на нові реквести щоб їх обробити
