import express, { NextFunction, Request, Response } from "express"; // витягуємо і інсталимо
import * as mongoose from "mongoose";

import { configs } from "./configs/configs";
import { ApiError } from "./errors";
import { authRouter } from "./routers/auth.router";
import { userRouter } from "./routers/user.router";

const app = express(); // пишемо app для зручності використання в подальшому, вже як виклик функції

app.use(express.json()); // ці два використовуються для того щоб наша апка могла читати body і квері
app.use(express.urlencoded({ extended: true }));

// звертаємось до нашого роутера, щоб мати доступ до прописаних там ендпоінтів
app.use("/users", userRouter);
app.use("/auth", authRouter);

// тут ми відловлюємо усі ерорки що випали з роутів, обовязково має бути 4 аргументи в колбеці, бо саме коли їх
// чотири то перша ерорка
app.use((error: ApiError, req: Request, res: Response, next: NextFunction) => {
  // з ерорки дістаємо статус який ми передали, або 500 по дефолту якщо немає статуса
  const status = error.status || 500;
  // витягнули повідомлення і передали як респонс
  return res.status(status).json(error.message);
});

const dbConnect = async () => {
  let dbCon = false;

  while (!dbCon){
    try{
      console.log("Connecting to database")
      await mongoose.connect(configs.DB_URL);
      dbCon = true
    } catch (e) {
      console.log("Database unavailable, wait 3 seconds");
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
}

const start = async () => {
  try{
  await dbConnect();
  await app.listen(configs.DB_PORT, () => {
    console.log(`Server has started on PORT ${configs.DB_PORT}`);
  });
  } catch (e) {
    console.log(e)
  }
}

start();

