### Cron

npm i cron

npm i @types/cron

npm i dayjs

крони дають змогу запускати певну функцію у певний час або проміжок часу, це дає можливість автоматизувати процеси 
що часто повторюються, в нашому випадку видалення токенів які вже застаріли. тайм зони потрібно приводити до нульової, 
тобто там де буде працювати апка

remove-old-tokens.ts
````
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

````
index.ts
````
import { removeOldTokens } from "./remove-old-tokens.cron";

export const cronRunner = () => {
  // викликаємо тут функцію з методом старт
  removeOldTokens.start();
};
````
app.ts
````
app.listen(configs.DB_PORT, () => {
  // підключаємо mongoose
  // також можна ввести mongodb://localhost:27017/dec-2022 або mongodb://127.0.0.1:27017/dec-2022
  mongoose.connect(configs.DB_URL);
  // після запуску сервера почнуть виконуватись наші крони
  cronRunner();
  console.log(`Server has started on PORT ${configs.DB_PORT}`);
});
````