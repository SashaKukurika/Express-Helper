import * as jwt from "jsonwebtoken";

import { configs } from "../configs/configs";
import { ApiError } from "../errors";
import { ITokenPayload, ITokensPair } from "../types/token.type";

class TokenService {
  // Record Створює тип об’єкта, ключі властивостей якого дорівнюють першому значенню до коми, а значення властивостей
  // другому після коми
  public generateTokenPair(payLoad: ITokenPayload): ITokensPair {
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
  public checkToken(token: string): ITokenPayload {
    try {
      return jwt.verify(token, configs.JWT_ACCESS_SECRET) as ITokenPayload;
    } catch (e) {
      throw new ApiError("Token not valid", 401);
    }
  }
}

export const tokenService = new TokenService();
