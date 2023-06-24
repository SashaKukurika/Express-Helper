import { model, Schema, Types } from "mongoose";

import { User } from "./User.model";

const tokensSchema = new Schema(
  {
    accessToken: {
      type: String,
      require: true,
    },
    refreshToken: {
      type: String,
      require: true,
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

export const TokensPair = model("user", tokensSchema);
