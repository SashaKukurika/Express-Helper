import { configs } from "../configs/configs";
import { IUser } from "../types/user.type";

class UserMapper {
  public toResponse(user: IUser) {
    // прописуємо що саме буде повертатися на фронт
    return {
      _id: user._id,
      name: user.name,
      age: user.age,
      email: user.email,
      gender: user.gender,
      avatar: user.avatar ? `${configs.AWS_S3_URL}/${user.avatar}` : null,
    };
  }
}

export const userMapper = new UserMapper();
