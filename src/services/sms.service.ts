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
