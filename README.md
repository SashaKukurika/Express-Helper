### AWS STREAM

npm i multer - але версія нижча ніж 1.4.5

npm i streamifier

стріми для великих файлів, передаються файли чанками, туду - зберігати шлях в базу даних.

user.router.ts
````
router.post(
  "/:userId/video",
  authMiddleware.checkAccessToken,
  commonMiddleware.isIdValid("userId"),
  userController.uploadVideo
);
````
user.controller.ts
````
  public async uploadVideo(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { userId } = req.params;
      const upload = multer().single("");

      upload(req, res, async (err) => {
        if (err) {
          throw new ApiError("Download error", 500);
        }

        const video = req.files.video as UploadedFile;
        // так ми створили стрім
        const stream = createReadStream(video.data);
        // наш стрім направляємо в с3 бакет, буде поступово читати наш файл і віддавати
        const pathToVideo = await s3Service.uploadFileStream(
          stream,
          "user",
          userId,
          video
        );

        return res.status(201).json(pathToVideo);
      });
    } catch (e) {
      // це вказує що ерорку потрібно передати далі
      next(e);
    }
  }
````
s3.service.ts
````
public async uploadFileStream(
    stream: Readable,
    itemType: string,
    itemId: string,
    file: UploadedFile
  ): Promise<void> {
    const filePath = this.buildPath(itemType, itemId, file.name);

    await this.client.send(
      //видаляємо наявний файл з aws
      new PutObjectCommand({
        // в який бакет пишемо
        Bucket: configs.AWS_S3_NAME,
        // шлях до файла, за якою адресою в бакеті щоб лежав
        Key: filePath,
        // це і є сам файл що ми хочемо зберегти
        Body: stream,
        ACL: configs.AWS_S3_ACL,
        ContentType: file.mimetype,
        // вказуємо розмір того що буде завантажуватися
        ContentLength: file.size,
      })
    );
  }
  private buildPath(type: string, id: string, fileName: string): string {
    // генеруємо унікальний шлях, v4 це унікальна айді, а path.extname(fileName) витягне розширення файлу
    return `${type}/${id}/${v4()}${path.extname(fileName)}`;
  }
````

