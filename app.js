const express = require('express'); // витягуємо і інсталимо
const {readDB, writeDB} = require("./file.service");
const app = express(); // пишемо app для зручності використання в подальшому, вже як виклик функції

app.use(express.json()); // ці два використовуються для того щоб наша апка могла читати body і квері
app.use(express.urlencoded({extended: true}))

// CRUD - create, read, update, delete

app.get('/users', async (req, res) => {
    const users = await readDB(); // витягнули функцію х файла яка читає сам файл і повертає юзерів
    res.status(200).json(users) // res це те що ми повертаємо клієнту
})

app.get('/users/:userId', async (req, res) => {
    const {userId} = req.params; // req.params достаємо параметри з урли, а ось це :id і є параметри і вони завжди у
    // вигляді стрічки

    const users = await readDB();

    const user = users.find((user) => user.id === +userId)

    if (!user) {
        return res.status(422).json('user not found');
    }

    res.json(user);
})

app.post('/users', async (req, res) => {
    const {name, age, gender} = req.body; // дістаємо з баді певні поля, деструктиризуємо

    if (!name) {
        return res.status(400).json('name is wrong')
    }
    if (!age || age < 10 || age > 100) {
        return res.status(400).json('age is wrong')
    }

    const users = await readDB(); // дістаємо усіх юзерів з бази

    const newUser = {
        id: users.length ? users[users.length - 1].id + 1 : 1, // якщо існує масив, тобто довжина не 0, то беремо
        // айді останього і додаємо 1 якщо всетаки нуль то просто це перше айді
        name,
        age,
        gender,
    } // створюємо нового юзера з даними отриманими з баді

    users.push(newUser); // пушимо нового юзера що створили

    await writeDB(users); // записуємо в базу всіх з новим

    res.status(201).json(newUser);
})

app.patch('/users/:userId', async (req, res) => {
    const {userId} = req.params;
    const {name, age} = req.body;

    if (name && name.length < 5) {
        return res.status(400).json('name is wrong');
    }
    if (age && (age < 10 || age > 110)) {
        return res.status(400).json('age is wrong');
    }

    const users = await readDB();
    const user = users.find((user) => user.id === +userId);

    if (!user) {
        return res.status(422).json('user not found');
    }
    if (name) user.name = name;
    if (age) user.age = age;

    await writeDB(users);

    res.status(201).json(user);
});

app.delete('/users/:userId', async (req, res) => {
    const {userId} = req.params;

    const users = await readDB();

    const index = users.findIndex((user) => user.id === +userId) // findIndex повертає -1 якщо незнаходить, або сам
    // індекс а не нуль якщо немає

    if (index === -1) {
        return res.status(422).json('user not found');
    }

    users.splice(index, 1); //вирізаємо з масива по індексу один елемент

    await writeDB(users);

    res.sendStatus(204);
})

const PORT = 5000; // по дефолту наш локалхост це 127.0.0.1 або в постмані 0.0.0.0, а в поєднані з портом
// 127.0.0.1:5001, а ще далі
// 127.0.0.1:5001/users

app.listen(PORT, () => {
    console.log(`Server has started on PORT ${PORT}`)
}) // буде слухати порт, топто івентлуп буде завжди працювати і чекати на нові реквести щоб їх обробити
