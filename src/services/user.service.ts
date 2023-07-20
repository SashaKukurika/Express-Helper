import { UploadedFile } from "express-fileupload";

import { ApiError } from "../errors";
import { User } from "../models/User.model";
import { IPaginationResponse, IQuery } from "../types/query.type";
import { IUser } from "../types/user.type";
import { s3Service } from "./s3.service";

class UserService {
  public async findAllWithPagination(
    query: IQuery
  ): Promise<IPaginationResponse<any>> {
    try {
      // ці всі махінації щоб поставити знак $ перед gte|lte|gt|lt, щоб потім при пошуку видати значення потрібні
      const queryStr = JSON.stringify(query);
      const queryObj = JSON.parse(
        queryStr.replace(/\b(gte|lte|gt|lt)\b/, (match) => `$${match}`)
      );
      // page = 1 це означає що якщо нам не передали даних до по дефолту буде 1, ...searchObject rest оператор що
      // забере до себе всі дані що залишилися
      const {
        page = 1,
        limit = 10,
        sortedBy = "createdAt",
        ...searchObject
      } = queryObj;

      // формула щоб вирахувати скільки потрібно пропустити
      const skip = +limit * (+page - 1);

      // limit скільки елементів ми візьмемо, skip - скільки пропустимо від першого елементу, sort по якому ключу
      // сортувати
      const [users, usersTotalCount, usersSearchCount] = await Promise.all([
        User.find(searchObject).limit(+limit).skip(skip).sort(sortedBy),
        User.count(),
        User.count(searchObject),
      ]);

      return {
        page: +page,
        perPage: +limit,
        itemsCount: usersTotalCount,
        itemsFound: usersSearchCount,
        data: users,
      };
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }
  public async create(data: IUser): Promise<IUser | any> {
    return await User.create({ ...data });
  }
  public async findById(id: string): Promise<IUser> {
    return await this.getByIdOrThrow(id);
  }

  // Partial це з TS робить усі поля з інтерфейсу не обовязковими
  public async updateById(userId: string, dto: Partial<IUser>): Promise<IUser> {
    await this.getByIdOrThrow(userId);

    return await User.findOneAndUpdate(
      // _id пишемо бо так в монгусі
      { _id: userId },
      // другий параметр це те що ми оновлюємо саме
      { ...dto },
      // покаже вже обєкт після оновлень а не до
      { returnDocument: "after" }
    );
  }

  public async deleteById(userId: string): Promise<void> {
    await this.getByIdOrThrow(userId);

    await User.deleteOne({ _id: userId });
  }
  public async uploadAvatar(
    userId: string,
    avatar: UploadedFile
  ): Promise<IUser> {
    const user = await this.getByIdOrThrow(userId);
    // якщо був старий аватар то варто почистити його з aws щоб зберігався лише один
    if (user.avatar) {
      await s3Service.deleteFile(user.avatar);
    }
    const pathToFile = await s3Service.uploadFile(avatar, "user", userId);

    return await User.findByIdAndUpdate(
      userId,
      // $set дозволяє оновити лише один параметр а не весь обєкт
      {
        $set: { avatar: pathToFile },
      },
      // для того щоб повернуло вже оновленого користувача а не того що він першочергово знайшов
      { new: true }
    );
  }
  public async deleteAvatar(userId: string): Promise<IUser> {
    const user = await this.getByIdOrThrow(userId);

    if (!user.avatar) {
      return user;
    }
    await s3Service.deleteFile(user.avatar);

    return await User.findByIdAndUpdate(
      userId,
      // $unset дозволяє видалити лише один параметр а не весь обєкт
      {
        $unset: { avatar: true },
      },
      // для того щоб повернуло вже оновленого користувача а не того що він першочергово знайшов
      { new: true }
    );
  }

  private async getByIdOrThrow(userId: string): Promise<IUser> {
    const user: IUser = await User.findById(userId);
    if (!user) {
      throw new ApiError("User not found", 422);
    }

    return user;
  }
}

export const userService = new UserService();
