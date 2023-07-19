import { ESmsAction } from "../enums/sms.enum";

export const smsTemplates = {
  // [] динамічно будуть підставлятися ключі
  [ESmsAction.WELCOME]: "welcome to our platform",
};
