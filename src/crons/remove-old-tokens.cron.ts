import { CronJob } from "cron";
import dayjs from "dayjs";
import uts from "dayjs/plugin/utc";

import { Token } from "../models/Token.model";

// екстендимо щоб могти використовувати час в нульовій тайм зоні
dayjs.extend(uts);
const tokensRemover = async () => {
  // subtract дая змогу відняти певну кількість часу від теперешнього
  const previousMonth = dayjs().utc().subtract(30, "days");
  // видалиться через 30 днів з моменту створення
  await Token.deleteMany({ createdAt: { $lte: previousMonth } });
};

// removeOldTokens назва фнкції що ми будемо передавати в індекс.тс, chatGPT класно гернерує крони * * * * * *,
// другий параметр tokensRemover це фн яку ми запускаєма start, а третім можна передати функцію яку будемо викликати
// в індекс з методом stop
export const removeOldTokens = new CronJob("* * * * * *", tokensRemover);
