import { CronJob } from "cron";
import dayjs from "dayjs";
import uts from "dayjs/plugin/utc";

import { OldPassword } from "../models/OldPassword.model";

// екстендимо щоб могти використовувати час в нульовій тайм зоні
dayjs.extend(uts);
const oldPasswordsRemover = async () => {
  // subtract дая змогу відняти певну кількість часу від теперешнього
  const previousYear = dayjs().utc().subtract(1, "year");
  // видалиться через 30 днів з моменту створення
  await OldPassword.deleteMany({ createdAt: { $lte: previousYear } });
};

// removeOldTokens назва фнкції що ми будемо передавати в індекс.тс, chatGPT класно гернерує крони * * * * * *,
// другий параметр tokensRemover це фн яку ми запускаєма start, а третім можна передати функцію яку будемо викликати
// в індекс з методом stop
export const removeOldPassword = new CronJob(
  "0 0 0 * * *",
  oldPasswordsRemover
);
