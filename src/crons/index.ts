import { removeOldTokens } from "./remove-old-tokens.cron";

export const cronRunner = () => {
  // викликаємо тут функцію з методом старт
  removeOldTokens.start();
};
