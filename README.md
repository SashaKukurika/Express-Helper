npm i jsonwebtoken

npm i @types/jsonwebtoken

шифрування - це як JWT токен, в який ми можемо положити корисне навантаження, зашифрувати, а потім розшифрувати і
дістати потрібну нам інформацію

access token - зазвичай живе 15-30 хв

refresh token - від 15 до 60 днів

npm i bcrypt

хешування - це коли ми не можемо дістати інформацію з захешованого пароля наприклад, використовується переважно для 
паролів

для реєстрації створюємо новий роут auth в app.ts
````
app.use("/auth", authRouter);
````
далі auth.router.ts
````
import { Router } from "express";

import { authController } from "../controllers/auth.controller";

const router = Router();

router.post("/register", authController.register);

export const authRouter = router;

````
в auth.controller.ts
````
import { Router } from "express";

import { authController } from "../controllers/auth.controller";

const router = Router();

router.post("/register", authController.register);

export const authRouter = router;

````
в token.service.ts
````
import * as jwt from "jsonwebtoken";

import { ITokensPair } from "../types/token.type";

class TokenService {
  // Record Створює тип об’єкта, ключі властивостей якого дорівнюють першому значенню до коми, а значення властивостей
  // другому після коми
  public generateTokenPair(
    payLoad: Record<string, string | number>
  ): ITokensPair {
    // sign просто генерує токен, приймає корисне навантаження (інфу що ми хочемо зашифрувати в токені, не
    // передавати важливу), та сикретне слово, і останє це опції, в даному випадку час життя токенів, секретне слово
    // обовязково виносити в .env
    const accessToken = jwt.sign(payLoad, "jwtAccess", { expiresIn: "15m" });
    const refreshToken = jwt.sign(payLoad, "jwtRefresh", { expiresIn: "30d" });

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
export interface ITokensPair {
  accessToken: string;
  refreshToken: string;
}
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

export const TokensPair = model("user", tokensSchema);
````