### CheckRefreshToken

на окремий роут створюємо перевірку рефреш токена, якщо він пройшов валідацію по сікрету, перевіряємо чи існує він у 
нас в базі, потім передаємо його на контролер, де достаємо інфу по токенах і перекидаємо в аузсервіс, а там вже 
генеруємо нову пару токерін, вносимо їх в базу перед тим видаляючи стару пару з бази.

auth.router.ts
````
router.post(
  "/refresh",
  authMiddleware.checkRefreshToken,
  authController.refresh
);
````
auth.middleware.ts
````
public async checkRefreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // req.get таким чином дістаємо дані з хедера по ключу authorization
      const refreshToken = req.get("Authorization");

      if (!refreshToken) {
        throw new ApiError("No token", 401);
      }

      const payload = tokenService.checkToken(refreshToken, ETokenType.Refresh);

      const entity = await Token.findOne({ refreshToken });

      if (!entity) {
        throw new ApiError("Token not valid", 401);
      }

      req.res.locals.oldTokenPair = entity;
      req.res.locals.tokenPayload = { name: payload.name, _id: payload._id };
      next();
    } catch (e) {
      next(e);
    }
  }
````
token.service.ts
````
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
}
````
auth.controller.ts
````
public async refresh(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ITokensPair>> {
    try {
      const oldTokenPair = req.res.locals.oldTokenPair as ITokensPair;
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;

      const tokensPair = await authService.refresh(oldTokenPair, tokenPayload);

      return res.status(200).json(tokensPair);
    } catch (e) {
      next(e);
    }
  }
````
token-type.enum.ts
````
export enum ETokenType {
  Refresh = "refresh",
  Access = "access",
}

````
auth.service.ts
````
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
````