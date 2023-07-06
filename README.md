### Activate Account

при реєстрації в емейлі включаємо в урлу актівейт токен і записуємо його в базу даних з силкою на юзера, потім нам 
фронт повертає на наш ендпоінт токен що ми передавали, потім в мідлварі ми перевіряємо токен чи він є і чи він 
валідний, в контролені витягуємо пейлоад і передаємо в сервіс, в якому ми оновлюємо статус та видаляємо токен з бази.

user-status.enum.ts
````
export enum EUserStatus {
  Inactive = "inactive",
  Active = "active",
}
````
register.hbs
````
<table style="width: 100%; padding: 45px 35px; box-sizing: border-box">
    <tr>
        <td style="font-size: 18px; text-align: center;">
<!--            {{name}} так ми динамічно можемо передавати дані сюди, через context в сервісі-->
            {{name}} Welcome on our platform!
        </td>
    </tr>
    <tr>
        <td style="text-align: center;">
            <p style="margin: 17px 0 0;">
                You need drink some beer! Click on button!
            </p>
        </td>
    </tr>
    <tr>
        <td style="text-align: center;">
            <a href="{{frontUrl}}/{{actionToken}}"><button>SUBMIT</button></a>
        </td>
    </tr>Q
</table>
````
auth.router.ts
````
router.put(
  "/register/:token",
  authMiddleware.checkActionToken(EActionTokenType.Activate),
  authController.activate
);
````
auth.controller.ts
````
public async activate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<void>> {
    try {
      const { jwtPayload } = req.res.locals;
      await authService.activate(jwtPayload);

      return res.sendStatus(201);
    } catch (e) {
      next(e);
    }
  }
````
auth.service.ts
````
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
````