import http from "node:http";

import express, { NextFunction, Request, Response } from "express"; // витягуємо і інсталимо
import fileUpload from "express-fileupload";
import rateLimit from "express-rate-limit";
import * as mongoose from "mongoose";
import socketIO from "socket.io";
import swaggerUi from "swagger-ui-express";

import { configs } from "./configs/configs";
import { cronRunner } from "./crons";
import { ApiError } from "./errors";
import { authRouter } from "./routers/auth.router";
import { userRouter } from "./routers/user.router";
// імпортуємо щоб закинути в swaggerUi.setup
import * as swaggerJson from "./utils/swagger.json";

const app = express(); // пишемо app для зручності використання в подальшому, вже як виклик функції

// щоб використовувати server як і app раніше
const server = http.createServer(app);
// cors може надавати доступ до певних ендпоінтів лише, типу localhost:3000, в нашому випадку ми кажемо що є доступ
// з усіх origin: "*"
const io = new socketIO.Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log(socket.id);
  // handshake можемо приймати з auth певну інфу, наприклад токени, чи query
  console.log(socket.handshake);

  // messageData це те що ми передали з фронта при кліку по назві події message:create
  socket.on("message:create", (messageData) => {
    console.log(messageData, "MESSAGE DATA");

    // тут ми знову оголосили подію і назвали її message:receive і передали на фронт { ok: true }
    socket.emit("message:receive", { ok: true });
  });

  // надсилає усім приєднаним сокетам
  socket.on("broadcast:all", () => {
    // io.emit це вказує на те що розіслати усім включаючи відправника а не лише одному коли socket.emit
    // io.emit("alert", "Air alert");

    // socket.broadcast.emit вказує на те що розіслати усім окрім відправника
    socket.broadcast.emit("alert", "Air alert");
  });

  // приєднання до якоїсь кімнати, тобто як до якогось чату в телеграмі
  socket.on("room:joinUser", ({ roomId }) => {
    socket.join(roomId);
    // а це щоб покинути кімнату
    // socket.leave(roomId);

    // io.to це бродкаст в межах кімнати усім включаючи відправника
    io.to(roomId).emit("room:newUserAlert", socket.id);

    // socket.to це бродкаст в межах кімнати усім окрім відправника
    // socket.to(roomId).emit("room:newUserAlert", socket.id);
  });
});

// набір правил по кількості запитів з одної айпі за певний час
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 60 second
  max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
});

// це якщо хочемо використовувати на всіх ендпоінтах *
// Apply the rate limiting middleware to API calls only
app.use("*", apiLimiter);
// це якщо хочемо використовувати на одному ендпоінту
//app.use("/users", apiLimiter, userRouter);

app.use(express.json()); // ці два використовуються для того щоб наша апка могла читати body і квері
app.use(express.urlencoded({ extended: true }));
// для можливості завантаження файлів, дозволить в реквесті мати окреме поле files де будуть лежати файли що ми
// будемо відправляти
app.use(fileUpload());

// звертаємось до нашого роутера, щоб мати доступ до прописаних там ендпоінтів
app.use("/users", userRouter);
app.use("/auth", authRouter);

// щоб запустився наш свагер на цьому ендпоінті
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerJson));

// тут ми відловлюємо усі ерорки що випали з роутів, обовязково має бути 4 аргументи в колбеці, бо саме коли їх
// чотири то перша ерорка
app.use((error: ApiError, req: Request, res: Response, next: NextFunction) => {
  // з ерорки дістаємо статус який ми передали, або 500 по дефолту якщо немає статуса
  const status = error.status || 500;
  // витягнули повідомлення і передали як респонс
  return res.status(status).json(error.message);
});

app.listen(configs.DB_PORT, () => {
  // підключаємо mongoose
  // також можна ввести mongodb://localhost:27017/dec-2022 або mongodb://127.0.0.1:27017/dec-2022
  mongoose.connect(configs.DB_URL);
  // після запуску сервера почнуть виконуватись наші крони
  cronRunner();
  console.log(`Server has started on PORT ${configs.DB_PORT}`);
}); // буде слухати порт, топто івентлуп буде завжди працювати і чекати на нові реквести щоб їх обробити

// так само як і в простому pull слухаємо сервер
server.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log("Listen", 3000);
});
