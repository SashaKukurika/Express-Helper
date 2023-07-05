import Joi from "joi";

import { regexConstants } from "../constants";
import { EGenders } from "../enums/user.enum";

export class UserValidator {
  static firstName = Joi.string().trim().min(3).max(30);
  static age = Joi.number().min(1).max(199);
  static gender = Joi.valid(...Object.values(EGenders));
  static email = Joi.string().regex(regexConstants.EMAIL).lowercase().trim();
  static password = Joi.string().regex(regexConstants.PASSWORD);

  static create = Joi.object({
    name: this.firstName.required(),
    age: this.age.required(),
    gender: this.gender.required(),
    email: this.email.required(),
    password: this.password.required(),
  });
  static register = Joi.object({
    email: this.email.required(),
    password: this.password.required(),
  });
  static changePassword = Joi.object({
    oldPassword: this.password.required(),
    newPassword: this.password.required(),
  });

  static login = this.register;

  static update = Joi.object({
    name: this.firstName,
    age: this.age,
    gender: this.gender,
  });

  static forgotPassword = Joi.object({
    email: this.email.required(),
  });
  static setForgotPassword = Joi.object({
    password: this.password.required(),
  });
}
