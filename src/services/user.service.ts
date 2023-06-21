import { ApiError } from "../errors";
import { User } from "../models/User.model";
import { IUser } from "../types/user.type";

class UserService {
  public async findAll(): Promise<IUser[] | any> {
    return await User.find();
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
  // Partial це з TS робить усі поля з інтерфейсу не обовязковими
  public async deleteById(userId: string): Promise<void> {
    await this.getByIdOrThrow(userId);

    await User.deleteOne({ _id: userId });
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
