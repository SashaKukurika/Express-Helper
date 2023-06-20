import { ApiError } from "../errors";
import { User } from "../models/User.model";
import { IUser } from "../types/user.type";

class UserService {
  public async findAll(): Promise<IUser[] | any> {
    try {
      return User.find().select("-password");
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }
  public async create(data: IUser): Promise<IUser | any> {
    try {
      return User.create({ ...data });
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }
  public async findById(id: string): Promise<IUser> {
    return User.findById(id);
  }
}

export const userService = new UserService();
