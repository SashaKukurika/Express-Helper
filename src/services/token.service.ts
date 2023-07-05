import * as jwt from "jsonwebtoken";

import { configs } from "../configs/configs";
import { EActionTokenType } from "../enums/action-token-type.enum";
import { ETokenType } from "../enums/token-type.enum";
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
  public checkToken(token: string, type: ETokenType): ITokenPayload {
    try {
      let secret: string;

      switch (type) {
        case ETokenType.Access:
          secret = configs.JWT_ACCESS_SECRET;
          break;
        case ETokenType.Refresh:
          secret = configs.JWT_REFRESH_SECRET;
          break;
      }
      return jwt.verify(token, secret) as ITokenPayload;
    } catch (e) {
      throw new ApiError("Token not valid", 401);
    }
  }
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
}

export const tokenService = new TokenService();
