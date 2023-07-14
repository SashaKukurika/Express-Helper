### AWS

npm i uuid

npm i express-fileupload

npm i @aws-sdk/client-s3

створення бакета на AWS див lesson 10 з 35хв

app.ts
````
import fileUpload from "express-fileupload";
// для можливості завантаження файлів, дозволить в реквесті мати окреме поле files де будуть лежати файли що ми
// будемо відправляти
app.use(fileUpload());
````
user.router.ts
````
router.post(
  "/:userId/avatar",
  authMiddleware.checkAccessToken,
  commonMiddleware.isIdValid("userId"),
  fileMiddleware.isAvatarValid,
  userController.uploadAvatar
);
router.delete(
  "/:userId/avatar",
  authMiddleware.checkAccessToken,
  commonMiddleware.isIdValid("userId"),
  userController.deleteAvatar
);
````
file.middleware.ts
````
import { NextFunction, Request, Response } from "express";

import { avatarConfig } from "../configs/file.configs";
import { ApiError } from "../errors";

class FileMiddleware {
  // огорнули наш метод в функцію щоб могти динамічно передавати філду з роутера в наш метод
  public isAvatarValid(req: Request, res: Response, next: NextFunction) {
    try {
      // перевіряємо чи че масив
      if (Array.isArray(req.files.avatar)) {
        throw new ApiError("Avatar must be only one file", 400);
      }

      const { mimetype, size } = req.files.avatar;

      // якщо аватар не того формату що ми задали кидаємо помилку
      if (!avatarConfig.MIMETYPES.includes(mimetype)) {
        throw new ApiError("Avatar has invalid format", 400);
      }

      if (size > avatarConfig.MAX_SIZE) {
        throw new ApiError("Avatar too big", 400);
      }

      next();
    } catch (e) {
      next(e);
    }
  }
}

export const fileMiddleware = new FileMiddleware();

````
user.controller.ts
````
  public async uploadAvatar(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<void>> {
    try {
      const { userId } = req.params;
      // пишемо as UploadedFile щоб тайпскріпт розумів що це один файл а не масив
      const avatar = req.files.avatar as UploadedFile;

      const user = await userService.uploadAvatar(userId, avatar);

      return res.status(201).json(user);
    } catch (e) {
      // це вказує що ерорку потрібно передати далі
      next(e);
    }
  }

  public async deleteAvatar(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<void>> {
    try {
      const { userId } = req.params;

      await userService.deleteById(userId);

      return res.sendStatus(204);
    } catch (e) {
      // це вказує що ерорку потрібно передати далі
      next(e);
    }
  }
````
user.service.ts
````
  public async uploadAvatar(
    userId: string,
    avatar: UploadedFile
  ): Promise<IUser> {
    const user = await this.getByIdOrThrow(userId);

    const pathToFile = await s3Service.uploadFile(avatar, "user", userId);
    console.log(pathToFile);
    return user;
    // await User.deleteOne({ _id: userId });
  }
````
s3.service.ts
````
import path from "node:path";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { UploadedFile } from "express-fileupload";
import { v4 } from "uuid";

import { configs } from "../configs/configs";

class S3Service {
  constructor(
    private client = new S3Client({
      // надаштування щоб отримати доступ
      region: configs.AWS_S3_REGION,
      credentials: {
        accessKeyId: configs.AWS_ACCESS_KEY,
        secretAccessKey: configs.AWS_SECRET_KEY,
      },
    })
  ) {}
  public async uploadFile(
    file: UploadedFile,
    itemType: "user",
    itemId: string
  ): Promise<string> {
    const filePath = this.buildPath(itemType, itemId, file.name);
    await this.client.send(
      new PutObjectCommand({
        // в який бакет пишемо
        Bucket: configs.AWS_S3_NAME,
        // шлях до файла, за якою адресою в бакеті щоб лежав
        Key: filePath,
        // це і є сам файл що ми хочемо зберегти
        Body: file.data,
        ACL: configs.AWS_S3_ACL,
        ContentType: file.mimetype,
      })
    );
    return filePath;
  }
  private buildPath(type: string, id: string, fileName: string): string {
    // генеруємо унікальний шлях, v4 це унікальна айді, а path.extname(fileName) витягне розширення файлу
    return `${type}/${id}/${v4()}${path.extname(fileName)}`;
  }
}

export const s3Service = new S3Service();
````
file.configs.ts
````
export const avatarConfig = {
  // типи файлів які ми зможемо завантажувати
  MIMETYPES: ["image/gif", "image/jpeg", "image/png", "image/jpg"],
  // їх максимальний розмір в даному випадку 8 мегабайта, але краще ставити до 2
  MAX_SIZE: 8 * 1024 * 1024,
};
````
User.model.ts
````
    avatar: {
      type: String,
      required: false,
    },
````

