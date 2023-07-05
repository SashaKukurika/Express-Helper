import { model, Schema, Types } from "mongoose";

import { EActionTokenType } from "../enums/action-token-type.enum";
import { User } from "./User.model";

const actionSchema = new Schema(
  {
    actionToken: {
      type: String,
      require: true,
    },
    tokenType: {
      type: String,
      require: true,
      // вказуємо тип токена енамкою, щоб не зробити опічатку
      enum: EActionTokenType,
    },
    // посилання на інші таблиці прийнято починати з "_", це для того щоб ми знали для якого юзера була видана пара
    // токенів та могли це перевірити
    _userId: {
      type: Types.ObjectId,
      require: true,
      // зсилаємось на таблицю юзер
      ref: User,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const Action = model("Action", actionSchema);
