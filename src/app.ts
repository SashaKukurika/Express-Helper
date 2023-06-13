import express, { Request, Response } from "express"; // витягуємо і інсталимо

const app = express(); // пишемо app для зручності використання в подальшому, вже як виклик функції

const users = [
  {
    name: "Oleh",
    age: 20,
    gender: "male",
  },
  {
    name: "Anton",
    age: 10,
    gender: "male",
  },
  {
    name: "Inokentiy",
    age: 25,
    gender: "female",
  },
  {
    name: "Anastasiya",
    age: 15,
    gender: "female",
  },
  {
    name: "Cocos",
    age: 25,
    gender: "other",
  },
];

app.use(express.json()); // ці два використовуються для того щоб наша апка могла читати body і квері
app.use(express.urlencoded({ extended: true }));

// CRUD - create, read, update, delete

app.get("/users", (req: Request, res: Response) => {
  res.status(200).json(users); // res це те що ми повертаємо клієнту
});

app.get("/users/:id", (req: Request, res: Response) => {
  const { id } = req.params; // req.params достаємо параметри з урли, а ось це :id і є параметри і вони завжди у
  // вигляді стрічки

  res.status(200).json(users[+id]);
});

app.post("/users", (req: Request, res: Response) => {
  users.push(req.body); // req.body те що нам передає клієнт в body

  res.status(201).json({
    message: "User created.", // повідомлення яке отримає фронт/клієнт
  });
});

app.put("/users/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  users[+id] = req.body;

  res.status(200).json({
    message: "User updated",
    data: users[+id], // можемо передати обєкт
  });
});

app.delete("/users/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  users.splice(+id, 1);

  res.status(200).json({
    message: "User deleted",
  });
});

const PORT = 5001; // по дефолту наш локалхост це 127.0.0.1, а в поєднані з портом 127.0.0.1:5001, а ще далі
// 127.0.0.1:5001/users

app.listen(PORT, () => {
  console.log(`Server has started on PORT ${PORT} 🥸`);
}); // буде слухати порт, топто івентлуп буде завжди працювати і чекати на нові реквести щоб їх обробити
