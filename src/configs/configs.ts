import { config } from "dotenv";

config();
export const configs = {
  DB_PORT: process.env.DB_PORT || 5000,
  DB_URL: process.env.DB_URL,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "jwtAccessSecret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "jwtRefreshSecret",

  SECRET_SALT: process.env.SECRET_SALT || 7,
};
