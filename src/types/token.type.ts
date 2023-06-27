import { IUser } from "./user.type";

export interface ITokensPair {
  accessToken: string;
  refreshToken: string;
}

export type ICredentials = Pick<IUser, "password" | "email">;

export type ITokenPayload = Pick<IUser, "_id" | "name">;
