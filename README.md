npm i mongoose

// дивитись в терміналі чи порт зайнятий, замість 80 номер порта

netstat -ano | findstr 80

app.listen(PORT, () => {

// підключаємо mongoose, також можна ввести mongodb://localhost:27017/dec-2022 або mongodb://127.0.0.1:27017/dec-2022 

mongoose.connect("mongodb+srv://gydini13:<password>@mongodb1.grht4ea.mongodb.net/");
});

npm i dotenv

// вчить ноду читати .env файли, щоб видягувати дані в конфіги

// в папці configs в configs.ts

import { config } from "dotenv";

config();

export const configs = {
DB_PORT: process.env.DB_PORT || 5000,
DB_URL: process.env.DB_URL,
};

// а в апп файлі

import { configs } from "./configs/configs";

app.listen(configs.DB_PORT, () => {
mongoose.connect(configs.DB_URL);
console.log(`Server has started on PORT ${configs.DB_PORT}`);
});

// створюємо моделі

import { model, Schema } from "mongoose";

import { EGenders } from "../enums/user.enum";

const userSchema = new Schema({
name: {
type: String,
},
age: {
type: Number,
min: [2, "Min age is 2"],
max: [110, "Max age is 110"],
},
gender: {
type: String,
enum: EGenders,

// EGenders це енамки з іншого файлу

export enum EGenders {
Male = "male",
Female = "female",
Other = "other",
}

},
email: {
type: String,
require: true,
trim: true,
lowercase: true,
},
password: {
type: String,
require: true,
},
});

export const User = model("user", userSchema);

// далі щоб доступатися до бази

await User.find()

// створюємо інтерфейс для типізації респонсів

import { Types } from "mongoose";

export interface IUser {
id: Types.ObjectId;
name: string;
age: number;
email: string;
password: string;
gender: string;
}
