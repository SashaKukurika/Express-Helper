import { Model, model, Schema } from "mongoose";

import { EGenders } from "../enums/user.enum";
import { EUserStatus } from "../enums/user-status.enum";
import { IUser } from "../types/user.type";

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    age: {
      type: Number,
      min: [2, "Min age is 2"],
      max: [110, "Max age is 110"],
    },
    gender: {
      type: String,
      enum: EGenders,
    },
    status: {
      type: String,
      default: EUserStatus.Inactive,
      enum: EUserStatus,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      // таким чином не буде видаватися пароль при запитах до бази
      select: true,
    },
    avatar: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      trim: true,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export interface IUserModel
  extends Model<IUser, object, IUserMethods, IUserVirtuals> {
  findByEmail(email: string): Promise<IUser>;
}

interface IUserMethods {
  nameWithAge(): string;
}

interface IUserVirtuals {
  nameWithSurname: string;
}

userSchema.methods = {
  nameWithAge() {
    return `${this.name} is ${this.age} years old`;
  },
};

userSchema.statics = {
  async findByEmail(email: string): Promise<IUser> {
    return this.findOne({ email });
  },
};

userSchema.virtual("nameWithSurname").get(function () {
  return `${this.name} Kukurika`;
});
export const User = model<IUser, IUserModel>("user", userSchema);
