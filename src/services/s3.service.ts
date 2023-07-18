import path from "node:path";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { UploadedFile } from "express-fileupload";
import { Readable } from "stream";
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
  public async deleteFile(filePath: string): Promise<void> {
    await this.client.send(
      //видаляємо наявний файл з aws
      new DeleteObjectCommand({
        // в який бакет пишемо
        Bucket: configs.AWS_S3_NAME,
        // шлях до файла, за якою адресою в бакеті щоб лежав
        Key: filePath,
      })
    );
  }
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
}

export const s3Service = new S3Service();
