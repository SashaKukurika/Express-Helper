import { Types } from "mongoose";

import { EActionTokenType } from "../enums/action-token-type.enum";
import { EEmailAction } from "../enums/email.enum";
import { ESmsAction } from "../enums/sms.enum";
import { EUserStatus } from "../enums/user-status.enum";
import { ApiError } from "../errors";
import { Action } from "../models/Action.model";
import { OldPassword } from "../models/OldPassword.model";
import { Token } from "../models/Token.model";
import { User } from "../models/User.model";
import { ICredentials, ITokenPayload, ITokensPair } from "../types/token.type";
import { ICreateUser, IUser } from "../types/user.type";
import { emailService } from "./email.service";
import { passwordService } from "./password.service";
import { smsService } from "./sms.service";
import { tokenService } from "./token.service";

class AuthService {
  // Record Створює тип об’єкта, ключі властивостей якого дорівнюють першому значенню до коми, а значення властивостей
  // другому після коми
  public async register(data: ICreateUser): Promise<void> {
    try {
      const { password, email } = data;

      const name = "Sasha";

      const hashedPassword = await passwordService.hash(password);

      const user = await User.create({ ...data, password: hashedPassword });

      const actionToken = tokenService.generateActionToken(
        { _id: user._id },
        EActionTokenType.Activate
      );

      await Promise.all([
        Action.create({
          actionToken,
          tokenType: EActionTokenType.Activate,
          _userId: user._id,
        }),
        // name ключ по якому тягнемо дані в hbs
        emailService.sendMail(email, EEmailAction.WELCOME, {
          name,
          actionToken,
        }),
        smsService.sendSms(data.phone, ESmsAction.WELCOME),
      ]);
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }
  public async activate(jwtPayload: ITokenPayload): Promise<void> {
    try {
      await Promise.all([
        User.updateOne({ _id: jwtPayload._id }, { status: EUserStatus.Active }),
        Action.deleteMany({
          _userId: jwtPayload._id,
          tokenType: EActionTokenType.Activate,
        }),
      ]);
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }
  public async login(
    credentials: ICredentials,
    user: IUser
  ): Promise<ITokensPair> {
    try {
      const isMatched = await passwordService.compare(
        credentials.password,
        user.password
      );

      if (!isMatched) {
        throw new ApiError("Invalid email or password", 401);
      }

      const tokensPair = await tokenService.generateTokenPair({
        _id: user._id,
        name: user.name,
      });

      await Token.create({ ...tokensPair, _userId: user._id });

      return tokensPair;
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }
  public async refresh(
    oldTokenPair: ITokensPair,
    tokenPayload: ITokenPayload
  ): Promise<ITokensPair> {
    try {
      const tokensPair = await tokenService.generateTokenPair(tokenPayload);

      await Promise.all([
        Token.create({ _userId: tokenPayload._id, ...tokensPair }),
        Token.deleteOne({ refreshToken: tokensPair.refreshToken }),
      ]);

      return tokensPair;
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }
  public async changePassword(
    dto: { newPassword: string; oldPassword: string },
    userId: string
  ): Promise<void> {
    try {
      // дістаємо масив усіх старих паролів що раніше вводив користувач

      const [oldPasswords, user] = await Promise.all([
        OldPassword.find({ _userId: userId }).lean(),
        User.findById(userId),
      ]);
      const passwords = [...oldPasswords, { password: user.password }];
      // порівнюємо наш старий пароль, який ми хочемо змінити з усіма іншими що раніше були
      await Promise.all(
        // { password: hash } беоремо пасворд але називаємо його хеш
        passwords.map(async ({ password: hash }) => {
          const isMatched = await passwordService.compare(
            dto.newPassword,
            hash
          );
          if (isMatched) {
            throw new ApiError("Wrong old password", 400);
          }
        })
      );

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
}

export const authService = new AuthService();
