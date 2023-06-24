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
