import { Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  age?: number;
  email: string;
  password: string;
  gender?: string;
}

// через Omit вказуємо що ми хочемо викинути з інтерфейсу IUser
export type IUserWithoutPassword = Omit<IUser, "password">;
