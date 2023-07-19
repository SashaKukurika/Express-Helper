### TWILIO

npm i twilio

сервіс для відправки смс та багато чого іншого, налаштування на сайті див лекція 11, створюємо окремо сервіс 
для розсилки смс, та викликаємо його де нам потрібно, наприклад при реєстрації користувача = smsService.sendSms(data.
phone, ESmsAction.WELCOME),.

configs.ts
````
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_MESSAGE_SERVICE_SID: process.env.TWILIO_MESSAGE_SERVICE_SID,
````
regex.constants.ts
````
PHONE:
    /\(?\+[0-9]{1,3}\)? ?-?[0-9]{1,3} ?-?[0-9]{3,5} ?-?[0-9]{4}( ?-?[0-9]{3})? ?(\w{1,10}\s?\d{1,6})?/,
````
sms.constants.ts
````
import { ESmsAction } from "../enums/sms.enum";

export const smsTemplates = {
  // [] динамічно будуть підставлятися ключі
  [ESmsAction.WELCOME]: "welcome to our platform",
};
````
sms.enums.ts
````
export enum ESmsAction {
  WELCOME,
}
````
User.model.ts
````
phone: {
      type: String,
      trim: true,
      required: true,
    },
````
sms.service.ts
````
import { Twilio } from "twilio";

import { configs } from "../configs/configs";
import { smsTemplates } from "../constants/sms.constants";
import { ESmsAction } from "../enums/sms.enum";

class SmsService {
  // в конструкторі ми ініціюємо екземпляр класу, тобто відразу нас реєструє в твіліо з нашими даними і тоді через
  // client ми можемо доступатись
  constructor(
    private client = new Twilio(
      configs.TWILIO_ACCOUNT_SID,
      configs.TWILIO_AUTH_TOKEN
    )
  ) {}
  public async sendSms(phone: string, action: ESmsAction) {
    try {
      const template = smsTemplates[action];
      await this.client.messages.create({
        // те що буде писатися в смс
        body: template,
        // з якого сервісу ми це відпарвляємо
        messagingServiceSid: configs.TWILIO_MESSAGE_SERVICE_SID,
        // кому прийде смс
        to: phone,
      });
    } catch (e) {
      console.log(e.message);
    }
  }
}

export const smsService = new SmsService();
````

