npm i jsonwebtoken

npm i @types/jsonwebtoken

шифрування - це як JWT токен, в який ми можемо положити корисне навантаження, зашифрувати, а потім розшифрувати і
дістати потрібну нам інформацію

access token - зазвичай живе 15-30 хв

refresh token - від 15 до 60 днів

npm i bcrypt

npm i @types/bcrypt

хешування - це коли ми не можемо дістати інформацію з захешованого пароля наприклад, використовується переважно для 
паролів

password.service.ts
````
import bcrypt from "bcrypt";

import { configs } from "../configs/configs";

class PasswordService {
  public async hash(password: string): Promise<string> {
    // hash хешує пароль який ми приймаєио, сіль це те наскільки сильно ми будемо хешувати
    return bcrypt.hash(password, +configs.SECRET_SALT);
  }
  public async compare(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    // compare порівнює звичайний пароль який вводить користувач з тим що в нас є захешований
    return bcrypt.compare(password, hashedPassword);
  }
}

export const passwordService = new PasswordService();
````

для реєстрації створюємо новий роут auth в app.ts
````
app.use("/auth", authRouter);
````
далі auth.router.ts
````
import { Router } from "express";

import { authController } from "../controllers/auth.controller";
import { commonMiddleware } from "../middlewares";
import { UserValidator } from "../validators";

const router = Router();

router.post(
  "/register",
  commonMiddleware.isBodyValid(UserValidator.register),
  authController.register
);
router.post("/login", authController.login);

export const authRouter = router;
Q````
в auth.controller.ts
````
import { NextFunction, Request, Response } from "express";

import { authService } from "../services/auth.service";
import { ITokensPair } from "../types/token.type";

class AuthController {
  public async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<void>> {
    try {
      await authService.register(req.body);

      return res.sendStatus(201);
    } catch (e) {
      next(e);
    }
  }
  public async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ITokensPair>> {
    try {
      const tokensPair = await authService.login(
        req.body,
        req.res.locals?.user
      );

      return res.status(200).json({ ...tokensPair });
    } catch (e) {
      next(e);
    }
  }
}

export const authController = new AuthController();
````
в token.service.ts
````
import * as jwt from "jsonwebtoken";
import { Types } from "mongoose";

import { configs } from "../configs/configs";
import { ITokensPair } from "../types/token.type";

class TokenService {
  // Record Створює тип об’єкта, ключі властивостей якого дорівнюють першому значенню до коми, а значення властивостей
  // другому після коми
  public generateTokenPair(
    payLoad: Record<string, string | number | Types.ObjectId>
  ): ITokensPair {
    // sign просто генерує токен, приймає корисне навантаження (інфу що ми хочемо зашифрувати в токені, не
    // передавати важливу), та сикретне слово, і останє це опції, в даному випадку час життя токенів, секретне слово
    // обовязково виносити в .env
    const accessToken = jwt.sign(payLoad, configs.JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(payLoad, configs.JWT_REFRESH_SECRET, {
      expiresIn: "30d",
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}

export const tokenService = new TokenService();

````
в token.type.ts
````
import { IUser } from "./user.type";

export interface ITokensPair {
  accessToken: string;
  refreshToken: string;
}

export type ICredentials = Pick<IUser, "password" | "email">;
````
user.types.ts
````
// через Pick вказуємо що ми хочемо взяти з інтерфейсу IUser
export type ICreateUser = Pick<IUser, "password" | "email">;
````
Token.model.ts для зберігання токенів у базі даних
````
import { model, Schema, Types } from "mongoose";

import { User } from "./User.model";

const tokensSchema = new Schema(
  {
    accessToken: {
      type: String,
      require: true,
    },
    refreshToken: {
      type: String,
      require: true,
    },
    // посилання на інші таблиці прийнято починати з "_", це для того щоб ми знали для якого юзера була видана пара
    // токенів та могли це перевірити
    _userId: {
      type: Types.ObjectId,
      require: true,
      // зсилаємось на таблицю юзер
      ref: User,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const Token = model("Token", tokensSchema);Q
````
в auth.service
````
import { ApiError } from "../errors";
import { Token } from "../models/Token.model";
import { User } from "../models/User.model";
import { ICredentials, ITokensPair } from "../types/token.type";
import { ICreateUser, IUser } from "../types/user.type";
import { passwordService } from "./password.service";
import { tokenService } from "./token.service";

class AuthService {
  // Record Створює тип об’єкта, ключі властивостей якого дорівнюють першому значенню до коми, а значення властивостей
  // другому після коми
  public async register(data: ICreateUser): Promise<void> {
    try {
      const { password } = data;

      const hashedPassword = await passwordService.hash(password);

      await User.create({ ...data, password: hashedPassword });
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }
  public async login(
    credentials: ICredentials,
    user: IUser
  ): Promise<ITokensPair> {
    try {
      const user = await User.findOne({ email: credentials.email });

      const isMachced = await passwordService.compare(
        credentials.password,
        user.password
      );

      if (!isMachced) {
        throw new ApiError("Invalid email or password", 401);
      }

      const tokensPair = await tokenService.generateTokenPair({
        _id: user._id,
      });

      await Token.create({ ...tokensPair, _userId: user._id });

      return tokensPair;
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }
}

export const authService = new AuthService();
````