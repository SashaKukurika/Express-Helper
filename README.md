### Forgot Password

для екшн токенів потрібно створювати окремі секретні слова, не такі як для авторизації.

створюємо окремий роутер на форгот, де перевіряємо спочатко чи емейл валідний, потім чи такий є у нас в базі даних, 
в контролені дістаємо і передаємо в сервіс айді і емейл юзера, в сервісі генеруємо екшн токен, записуємо його в базу 
даних, та відправляємо емейл з екшн токеном в контексті, щоб використати його в листі хабеес. Далі фронтенд відсилає 
нам урлу з токеном на ендпоін що ми створили, там ми перевіряємо введений пароль на валідність, беремо з баді бо нам 
так фронт надішле, перевіряємо чи екшн токен відправили який отримали з парамсів, перевіряємо на валідність екшн 
токен якщо його передали, далі дивимося по базі чи у нас він уже є в базі, якщо немає кидаємо помилку, далі в 
контролері дістаємо інфу яка потрібна, щоб оновити пароль юзеру, та видалити екшин токен.

Action.model.ts
````
import { model, Schema, Types } from "mongoose";

import { EActionTokenType } from "../enums/action-token-type.enum";
import { User } from "./User.model";

const actionSchema = new Schema(
  {
    actionToken: {
      type: String,
      require: true,
    },
    tokenType: {
      type: String,
      require: true,
      // вказуємо тип токена енамкою, щоб не зробити опічатку
      enum: EActionTokenType,
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

export const Action = model("Action", actionSchema);
````
action-token-type.enum.ts
````
export enum EActionTokenType {
  Forgot = "forgotPassword",
  Activate = "activate",
}
````
user.validator.ts
````
  static forgotPassword = Joi.object({
    email: this.email.required(),
  });
  static setForgotPassword = Joi.object({
    password: this.password.required(),
  });
````
forgot-password.hbs
````
<table style="width: 100%; padding: 45px 35px; box-sizing: border-box">
    <tr>
        <td style="font-size: 18px; text-align: center;">
            Do not worry< we control your password!
        </td>
    </tr>
    <tr>
        <td style="text-align: center;">
            <p style="margin: 17px 0 0;">
                Click link below to restore your password!
            </p>
        </td>
    </tr>
    <tr>Q
        <td style="text-align: center;">
            <a href="{{frontUrl}}/restore-password/{{actionToken}}">RESTORE</a>
        </td>
    </tr>
</table>
````
auth.router.ts
````
router.post(
  "/password/forgot",
  commonMiddleware.isBodyValid(UserValidator.forgotPassword),
  userMiddleware.isUserExist<IUser>("email"),
  authController.forgotPassword
);
router.put(
  "/password/forgot/:token",
  commonMiddleware.isBodyValid(UserValidator.setForgotPassword),
  authMiddleware.checkActionToken(EActionTokenType.Forgot),
  authController.setForgotPassword
);
````
auth.controller.ts
````
public async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ITokensPair>> {
    try {
      const { user } = req.res.locals;

      await authService.forgotPassword(user._id, req.body.email);

      return res.sendStatus(200);
    } catch (e) {
      next(e);
    }
  }
  public async setForgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<void>> {
    try {
      const { password } = req.body;
      const { jwtPayload } = req.res.locals;

      await authService.setForgotPassword(
        password,
        jwtPayload._id,
        req.params.token
      );

      return res.sendStatus(200);
    } catch (e) {
      next(e);
    }
  }
````
auth.service.ts
````
public async forgotPassword(
    userId: Types.ObjectId,
    email: string
  ): Promise<void> {
    try {
      const actionToken = tokenService.generateActionToken(
        { _id: userId },
        EActionTokenType.Forgot
      );

      await Promise.all([
        Action.create({
          actionToken,
          tokenType: EActionTokenType.Forgot,
          _userId: userId,
        }),
        emailService.sendMail(email, EEmailAction.FORGOT_PASSWORD, {
          actionToken,
        }),
      ]);
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }
  public async setForgotPassword(
    password: string,
    userId: Types.ObjectId,
    actionToken: string
  ): Promise<void> {
    try {
      const hashedPassword = await passwordService.hash(password);

      await Promise.all([
        User.updateOne({ _id: userId }, { password: hashedPassword }),
        Action.deleteOne({ actionToken }),
      ]);
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }
````
token.service.ts
````
public checkActionToken(
    token: string,
    tokenType: EActionTokenType
  ): ITokenPayload {
    try {
      let secret: string;

      switch (tokenType) {
        case EActionTokenType.Activate:
          secret = configs.JWT_ACTIVATE_SECRET;
          break;
        case EActionTokenType.Forgot:
          secret = configs.JWT_FORGOT_SECRET;
          break;
      }
      return jwt.verify(token, secret) as ITokenPayload;
    } catch (e) {
      throw new ApiError("Token not valid", 401);
    }
  }
  public generateActionToken(
    payload: ITokenPayload,
    tokenType: EActionTokenType
  ): string {
    try {
      let secret: string;

      switch (tokenType) {
        case EActionTokenType.Activate:
          secret = configs.JWT_ACTIVATE_SECRET;
          break;
        case EActionTokenType.Forgot:
          secret = configs.JWT_FORGOT_SECRET;
          break;
      }
      return jwt.sign(payload, secret, { expiresIn: "7d" });
    } catch (e) {
      throw new ApiError("Token not valid", 401);
    }
  }
````