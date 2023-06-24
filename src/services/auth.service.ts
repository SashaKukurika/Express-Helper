import { ICreateUser } from "../types/user.type";

class AuthService {
  // Record Створює тип об’єкта, ключі властивостей якого дорівнюють першому значенню до коми, а значення властивостей
  // другому після коми
  public register(data: ICreateUser): Promise<void> {

  }
}

export const authService = new AuthService();
