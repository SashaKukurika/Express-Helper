import { config } from "dotenv";

config();
export const configs = {
  DB_PORT: process.env.DB_PORT || 5000,
  DB_URL: process.env.DB_URL,
};
