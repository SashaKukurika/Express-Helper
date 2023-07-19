### SOCKET

npm install socket.io

npm i socket.io-client

на бекенді будуть самі emit, тобто лише приймати, а на фронті лише on, і це все буде використовуватись в стандартних 
ендпоінтах

app.ts
````
import http from "node:http";
import express, { NextFunction, Request, Response } from "express"; // витягуємо і інсталимо
import socketIO from "socket.io";

const app = express();
/ щоб використовувати server як і app раніше
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

// так само як і в простому pull слухаємо сервер
server.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log("Listen", 3000);
});
````
index.html
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
<body>
<button id="send">one-to-one</button>
<button id="broadcast">broadcast</button>
<button id="joinRoom1">Room 1</button>
<button id="joinRoom2">Room 2</button>

<script src="https://cdn.socket.io/4.6.0/socket.io.min.js" integrity="sha384-c79GN5VsunZvi+Q/WObgk2in0CbZsHnjEqvFxC5DxHn9lTfNce2WW6h2pH6u/kF+" crossorigin="anonymous"></script>
<script>
    const socket = io("http://localhost:3000", {
        // передаємо в handshake щоб відловити на беці
        query: "age=20&name=diana",
        auth: {token: "Barer sgvdfbdsgb"}
    })

    const okBtn = document.getElementById('send');
    const broadcastBtn = document.getElementById('broadcast');
    const joinRoom1Btn = document.getElementById('joinRoom1');
    const joinRoom2Btn = document.getElementById('joinRoom2');

    okBtn.onclick = () => {
        // перший аргумент це назва події, другий те що ми передамо при її виклиці on
        socket.emit("message:create", {text: "My first socket event"})
    }

    // ми по назві пподії message:receive отримали інфу massageInfo з бекенду і вивели
    socket.on("message:receive", (massageInfo) => {
        document.write(JSON.stringify(massageInfo, null, 2))
    })

    broadcastBtn.onclick = () => {
        socket.emit("broadcast:all", "This is broadcast to all")
    }

    socket.on("alert", (message) => {
        alert(message)
    })

    socket.on("room:newUserAlert", (joinedUserId) => {
        alert(`user ${joinedUserId} join chat`)
    })

    joinRoom1Btn.onclick = () => {
        socket.emit("room:joinUser", {roomId: 1});
    }

    joinRoom2Btn.onclick = () => {
        socket.emit("room:joinUser", {roomId: 2});
    }
</script>
</body>
</html>
````