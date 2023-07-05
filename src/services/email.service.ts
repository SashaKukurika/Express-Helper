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
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
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

    context.frontUrl = configs.FRONT_URL;

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
