### CheckRefreshToken

npm i nodemailer

npm i @types/nodemailer

email endings - види для створення html в emails

npm i hbs

hbs - handlebars для написання email в html форматі

npm i nodemailer-express-handlebars - щоб подружити nodemailer з handlebars

npm i @types/nodemailer-express-handlebars

заходимо на пошту -> керування обліковим записом -> безпека -> двохетапна перевірка -> паролі додатків -> генеруємо 
пароль

створюємо папку email-templates, а в ній ще три
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