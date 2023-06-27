### Nodemailer

npm i nodemailer

npm i @types/nodemailer

email endings - види для створення html в emails

npm i hbs

hbs - handlebars для написання email в html форматі

npm i nodemailer-express-handlebars - щоб подружити nodemailer з handlebars

npm i @types/nodemailer-express-handlebars

заходимо на пошту -> керування обліковим записом -> безпека -> двохетапна перевірка -> паролі додатків -> генеруємо 
пароль

створюємо папку email-templates, а в ній ще три 

layouts -> main.hbs
````
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body style="color: black; background-color: aqua;">
<!--// header буде підгружатися з partial щоб кожен раз не прописувати їх, адже вони переважно однакові-->
{{>header}}
<!--// буде братися з папки views-->
{{{body}}}
<!--// footer буде підгружатися з partial щоб кожен раз не прописувати їх, адже вони переважно однакові-->
{{>footer}}
</body>
</html>
````
partials -> footer.hbs and header.hbs

views -> register.hbs
````
<table style="width: 100%; padding: 45px 35px; box-sizing: border-box">
    <tr>
        <td style="font-size: 18px; text-align: center;">
<!--            {{name}} так ми динамічно можемо передавати дані сюди, через context в сервісі-->
            {{name}} Welcome on our platform!
        </td>
    </tr>
    <tr>
        <td style="text-align: center;">
            <p style="margin: 17px 0 0;">
                You need drink some beer! Click on button!
            </p>
        </td>
    </tr>
    <tr>
        <td style="text-align: center;">
            <button>SUBMIT</button>
        </td>
    </tr>
</table>
````
auth.service.ts
````
// name ключ по якому тягнемо дані в hbs
      await emailService.sendMail(email, EEmailAction.WELCOME, { name });
````
email.service.ts
````
import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import * as path from "path";

import { configs } from "../configs/configs";
import { allTemplates } from "../constants/email.constants";
import { EEmailAction } from "../enums/email.enum";

class EmailService {
  private transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      // від кого приходить email
      from: "No reply",
      // який сервіс використовуємо для відправки
      service: "gmail",
      auth: {
        // з відки, тобто з якої пошти буде надсилатися email користувачеві
        user: configs.NO_REPLY_EMAIL,
        // пароль з пошти, дивитись як згенерити в readme.md
        pass: configs.NO_REPLY_PASSWORD,
      },
    });

    const hbsOptions = {
      viewEngine: {
        // вказуємо що будемо використовувати файли з розширенням hbs
        extname: ".hbs",
        // назва основної hbs
        defaultLayout: "main",
        // шлях до папки з main.hbs
        layoutsDir: path.join(
          process.cwd(),
          "src",
          "email-templates",
          "layouts"
        ),
        // шлях до папки з хабеескою на хедер і футер
        partialsDir: path.join(
          process.cwd(),
          "src",
          "email-templates",
          "partials"
        ),
      },
      // шлях до основних хабеесок, що саме буде в body
      viewPath: path.join(process.cwd(), "src", "email-templates", "views"),
      // назва розширення з яким будемо працювати
      extName: ".hbs",
    };

    this.transporter.use("compile", hbs(hbsOptions));
  }

  public async sendMail(
    email: string,
    emailAction: EEmailAction,
    // коли пишемо = {} це означає що він може бути не обовязковим
    context: Record<string, string | number> = {}
  ) {
    // [] динамічно підставляємо
    const { templateName, subject } = allTemplates[emailAction];

    const mailOptions = {
      // to - кому ми хочемо відправити email
      to: email,
      // subject - заголовок емейла
      subject,
      // назва hbs яку хочемо відмалювати
      template: templateName,
      // так ми динамічно можемо передавати дані в hbs
      context,
    };
    return await this.transporter.sendMail(
      mailOptions
      // те що знизу так теж можна писати
      //     {
      //   // to - кому ми хочемо відправити email
      //   to: email,
      //   // subject - заголовок емейла
      //   subject: "Hello, it is my first email",
      //   // те що знаходиться в самому листі
      //   html: "<div>OKTEN IS THE BEST</div>",
      // }
    );
  }
}

export const emailService = new EmailService();
````
email.enum.ts
````
export enum EEmailAction {
  WELCOME,
  FORGOT_PASSWORD,
}
````
email.constants.ts
````
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
````