import bcrypt from "bcrypt";

import { configs } from "../configs/configs";

class PasswordService {
  public async hash(password: string): Promise<string> {
    // hash хешує пароль який ми приймаєио, сіль це те наскільки сильно ми будемо хешувати
    return bcrypt.hash(password, +configs.SECRET_SALT);
  }
  public async compare(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    // compare порівнює звичайний пароль який вводить користувач з тим що в нас є захешований
    return bcrypt.compare(password, hashedPassword);
  }
}

export const passwordService = new PasswordService();
