import { config } from "dotenv";

config();
export const configs = {
  DB_PORT: process.env.DB_PORT || 5000,
  DB_URL: process.env.DB_URL,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "jwtAccessSecret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "jwtRefreshSecret",

  JWT_ACTIVATE_SECRET: process.env.JWT_ACTIVATE_SECRET || "jwtActivateSecret",
  JWT_FORGOT_SECRET: process.env.JWT_FORGOT_SECRET || "jwtForgotSecret",

  FRONT_URL: process.env.FRONT_URL,

  SECRET_SALT: process.env.SECRET_SALT || 7,

  NO_REPLY_EMAIL: process.env.NO_REPLY_EMAIL,
  NO_REPLY_PASSWORD: process.env.NO_REPLY_EMAIL,

  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
  AWS_S3_REGION: process.env.AWS_S3_REGION,
  AWS_S3_NAME: process.env.AWS_S3_NAME,
  AWS_S3_ACL: process.env.AWS_S3_ACL,
  AWS_S3_URL: process.env.AWS_S3_URL,

  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_MESSAGE_SERVICE_SID: process.env.TWILIO_MESSAGE_SERVICE_SID,
};
