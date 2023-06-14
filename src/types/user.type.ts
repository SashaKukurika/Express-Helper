import { Types } from "mongoose";

export interface IUser {
  id: Types.ObjectId;
  name: string;
  age: number;
  email: string;
  password: string;
  gender: string;
}
