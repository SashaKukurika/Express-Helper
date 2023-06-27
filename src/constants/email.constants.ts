import { EEmailAction } from "../enums/email.enum";

export const allTemplates = {
  // [] динамічно будуть підставлятися ключі
  [EEmailAction.WELCOME]: {
    templateName: "register",
    subject: "Welcome to our powerful CRUD platform",
  },
  [EEmailAction.FORGOT_PASSWORD]: {
    templateName: "forgot-password",
    subject: "To change password click here",
  },
};
