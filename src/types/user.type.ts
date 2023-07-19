import { Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  age?: number;
  email: string;
  avatar: string;
  password: string;
  gender?: string;
  phone: string;
}

// через Omit вказуємо що ми хочемо викинути з інтерфейсу IUser
export type IUserWithoutPassword = Omit<IUser, "password">;
// через Pick вказуємо що ми хочемо взяти з інтерфейсу IUser
export type ICreateUser = Pick<IUser, "password" | "email" | "phone">;
