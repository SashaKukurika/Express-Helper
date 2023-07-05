### Change Password

для зміна пароля створюємо окремий ендпоінт, перевіряємо за допомогою валідатора чи паролі валідні (відповідають 
вимогам) і старий і новий, які ввів юзер, перевіряємо access токен, і далі уже в сервісі дивимося чи новий пароль не 
такий як інші старі паролі, або лише поередній, якщо відрізняється то міняємо пароль на новий, в базу відповідно 
записуємо захешований пароль, і окремо зберігаємо старі паролі в новій таблиці з айдішніком юзера

OldPassword.model.ts
````
import { model, Schema, Types } from "mongoose";

import { User } from "./User.model";

const oldPasswordSchema = new Schema(
  {
    password: {
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

export const OldPassword = model("OldPassword", oldPasswordSchema);

````
user.validator.ts
````
static changePassword = Joi.object({
    oldPassword: this.password.required(),
    newPassword: this.password.required(),
  });
````
auth.router.ts
````
router.post(
  "/changePassword",
  commonMiddleware.isBodyValid(UserValidator.changePassword),
  authMiddleware.checkAccessToken,
  authController.changePassword
);
````
auth.controller.ts
````
public async changePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ITokensPair>> {
    try {
      const { _id: userId } = req.res.locals.tokenPayload as ITokenPayload;

      await authService.changePassword(req.body, userId);

      return res.sendStatus(200);
    } catch (e) {
      next(e);
    }
  }
````
auth.service.ts
````
public async changePassword(
    dto: { newPassword: string; oldPassword: string },
    userId: string
  ): Promise<void> {
    try {
      // todo check for mistakes

      // дістаємо масив усіх старих паролів що раніше вводив користувач
      const oldPasswords = await OldPassword.find({ _userId: userId });
      // порівнюємо наш старий пароль, який ми хочемо змінити з усіма іншими що раніше були
      await Promise.all(
        // { password: hash } беоремо пасворд але називаємо його хеш
        oldPasswords.map(async ({ password: hash }) => {
          const isMatched = await passwordService.compare(
            dto.oldPassword,
            hash
          );
          if (isMatched) {
            throw new ApiError("Wrong old password", 400);
          }
        })
      );

      const user = await User.findById(userId);

      const isMatched = await passwordService.compare(
        dto.oldPassword,
        user.password
      );

      if (!isMatched) {
        throw new ApiError("Wrong old password", 400);
      }
      // захешовуємо новий пароль
      const newHashPassword = await passwordService.hash(dto.newPassword);

      await Promise.all([
        // записуємо старий пароль в базу з паролями і з айдішніком юзера, щоб знати кому він належав
        await OldPassword.create({ _userId: userId, password: user.password }),
        // оновлюємо пароль юзера
        await User.updateOne({ _id: userId }, { password: newHashPassword }),
      ]);
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }
````