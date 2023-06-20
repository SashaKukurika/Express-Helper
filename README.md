## Structure

створюємо папку routers в src, в ній файл user.router.ts,
але тепер замість того щоб писати у всіх роутах /users можна просто писати /
````
import { NextFunction, Request, Response, Router } from "express";

import { ApiError } from "../errors";
import { User } from "../models/User.model";
import { IUser } from "../types/user.type";
import { UserValidator } from "../validators";

// викликаємо як функцію
const router: Router = Router();
// CRUD - create, read, update, delete
router.get(
  "/",
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

router.post(
  "/",
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
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);

    res.status(200).json(user);
  } catch (e) {
    next(e);
  }
});
router.put(
  "/:id",
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

router.delete(
  "/:id",
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

export const userRouter: Router = router;
````
а в аппці пишемо
````
// звертаємось до нашого роутера, щоб мати доступ до прописаних там ендпоінтів
app.use("/users", userRouter);
````
створюємо папку controllers, а в ній файл user.controller.ts, тут прописуємо все те що раніше було просто в апці
````
import { NextFunction, Request, Response } from "express";

import { ApiError } from "../errors";
import { User } from "../models/User.model";
import { IUser } from "../types/user.type";
import { UserValidator } from "../validators";

class UserController {
  public async findAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<IUser[]>> {
    try {
      // select("-password") видасть відповідь але без пароля
      const users = await User.find().select("-password");

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
}

export const userController = new UserController();
````
а потім в роутерах викликаємо один з методів що нам потрібен
````
// викликаємо як функцію
const router: Router = Router();
// CRUD - create, read, update, delete

router.get("/", userController.findAll);

router.post("/", userController.create);
````
створюємо папку services, а в ній файл user.service.ts
````
import { ApiError } from "../errors";
import { User } from "../models/User.model";
import { IUser } from "../types/user.type";

class UserService {
  public async findAll(): Promise<IUser | any> {
    try {
      return User.find().select("-password");
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }
}

export const userService = new UserService();

````
а тоді в котрлорелах вже звертаємось до наших сервісів
````
public async findAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<IUser[]>> {
    try {
                           // ось тут
      const users = await userService.findAll();

      return res.json(users);
    } catch (e) {
      next(e);
    }
  }
  ````
створюємо папку middleware, а в ній файл user.middleware.ts тут валідуються дані, 
щоб потім передати їх в контролер
````
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
      // ми змогли це забрати в контролері!!!!!!
      req.res.locals = value;

      next();
    } catch (e) {
      console.log(e);
    }
  }
}

export const userMiddleware = new UserMiddleware();
````
в роутерах перед контролерами викликаємо нашу мідлвару, щоб вони отримали одразу валідні дані
````
router.post("/", userMiddleware.isCreateValid, userController.create);
````
є ще репозиторії які будуть робити лише!!! запити в базу