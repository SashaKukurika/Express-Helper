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
// через Pick вказуємо що ми хочемо взяти з інтерфейсу IUser
export type ICreateUser = Pick<IUser, "password" | "email">;
