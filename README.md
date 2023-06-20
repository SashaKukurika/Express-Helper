## JOI validator

створюємо папку validators в src щоб зберігати у ній наші валідатори

npm i joi

далі в папці файл з назвою того що будемо валідувати user.validator.ts
````
import Joi from "joi";

import { regexConstants } from "../constants";
import { EGenders } from "../enums/user.enum";

export class UserValidator {
  static firstName = Joi.string().trim().min(3).max(30);
  static age = Joi.number().min(1).max(199);
  static gender = Joi.valid(...Object.values(EGenders));;
  static email = Joi.string().regex(regexConstants.EMAIL).lowercase().trim();
  static password = Joi.string().regex(regexConstants.PASSWORD);

  static create = Joi.object({
    name: this.firstName.required(),
    age: this.age.required(),
    gender: this.gender.required(),
    email: this.email.required(),
    password: this.password.required(),
  });
  static update = Joi.object({
    name: this.firstName,
    age: this.age,
    gender: this.gender,
  });
}

````

для збереження констант по типу регулярок, створюємо папку constants а в ній файл regex.constants.ts
````
export const regexConstants = {
EMAIL: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%_*#?&])[A-Za-z\d@$_!%*#?&]{8,}$/,
};
````
тоді можемо викликати методи валідації в аппці
````
app.post(
  "/users",
  async (req: Request, res: Response): Promise<Response<IUser>> => {
    try {
      // викликаємо валідатор, передаємо що саме мусить валідуватись, і витягуємо ерорки і саме вже провалідоване
      // значення
      const { error, value } = UserValidator.create.validate(req.body);
      // якщо не пройшло валідацію кидаємо помилку
      if (error) {
        throw new Error(error.message);
      }
      // якщо ж пройшло то ми передаємо вже провалідоване значення в базу для створення
      const createdUser = await User.create(value);

      return res.status(201).json(createdUser);
    } catch (e) {
      console.log(e);
    }
  }
);
````
## Error handling

створюємо папку errors, в ній файл api.error.ts
````
export class ApiError extends Error {
  public status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
````
тоді можемо викликати їх в інших файлах
````
throw new ApiError(error.message, 400);
````
щоб ловити помилки по всьому файлі, тоді потрібно в низу апп файлу прописуємо
````
// тут ми відловлюємо усі ерорки що випали з роутів, обовязково має бути 4 аргументи в колбеці, бо саме коли їх
// чотири то перша ерорка
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  // з ерорки дістаємо статус який ми передали, або 500 по дефолту якщо немає статуса
  const status = error.status || 500;
  // витягнули повідомлення і передали як респонс
  return res.status(status).json(error.message);
});
````
а щоб викидати їх з роутів
````
catch (e) {
      // це вказує що ерорку потрібно передати далі
      next(e);Q
    }
````