// EVENTS називаємо, прописуємо що має робитись і можемо викликати цей івент в інш файлах,
const events = require('node:events');

const eventEmitter = new events();

eventEmitter.on('click', (data)=>{
  console.log(data)
  console.log('Click click click');
}) // що буде при виклиці eventEmitter що дорівнює = new events()

eventEmitter.emit('click', { data: "Hello" });
eventEmitter.emit('click');
eventEmitter.emit('click'); // виклик самого івенту
eventEmitter.emit('click');
eventEmitter.emit('click');

console.log(eventEmitter.eventNames());

eventEmitter.once('clickAndDie', ()=>{
  console.log('Clicked and died');
}) // викличиться івент лише один раз, в подальшому не зможемо викликати цей самий івент, тобто він раз працює і помирає

console.log(eventEmitter.eventNames());

eventEmitter.emit('clickAndDie');
eventEmitter.emit('clickAndDie');
eventEmitter.emit('clickAndDie');
eventEmitter.emit('clickAndDie');

console.log(eventEmitter.eventNames());

// STREAM стріми - як в ютубі, коли ми отримуємо не фесь файл а частинами (певного розміру), паралельно того як вже
// першу частину дивимось інша підгружається

const fs = require('fs');

const readStream = fs.createReadStream('text.txt'); // файл з якого читаємо дані
const writeStream = fs.createWriteStream('text2.txt'); // записуємо дані з стріма, кожниу частинку chunk в певний файл

readStream.on('data', (chunk)=>{
  console.log(chunk);
  writeStream.write(chunk)
}) // chunk - це частинки інфи з файлу які передаються, їх таких багато

readStream
  .on('error', ()=>{
    readStream.destroy();  // знищує рідстрім, що б не хавало ресурси
    writeStream.end('ERROR ON READING FILE'); // при помилці в кінець файлу запише наше повідомлення

    // handle error
  })
  .pipe(writeStream) // pipe сам відразу прокине chunk в writeStream

// read, write, duplex - читає (read) і записує (write) одночасно, transform - це чотири типи стрімів!!!


// EXPRESS - фреймврок, дає змогу підняти сервер на ноді,
// DNS - domain name system це коли ми пишемо google.com але на спаравді ідемо на певний IP 128.93.350.5

const express = require('express') // витягуємо і інсталимо
const app = express(); // пишемо app для зручності використання в подальшому, вже як виклик функції

const users = [
    {
        name: 'Oleh',
        age: 20,
        gender: 'male'
    },
    {
        name: 'Anton',
        age: 10,
        gender: 'male'
    },
    {
        name: 'Inokentiy',
        age: 25,
        gender: 'female'
    },
    {
        name: 'Anastasiya',
        age: 15,
        gender: 'female'
    },
    {
        name: 'Cocos',
        age: 25,
        gender: 'other',
    },
]


app.use(express.json()); // ці два використовуються для того щоб наша апка могла читати body і квері
app.use(express.urlencoded({extended: true}))

// CRUD - create, read, update, delete

app.get('/users', (req, res) => {
    res.status(200).json(users) // res це те що ми повертаємо клієнту
})

app.get('/users/:id', (req, res) => {
    const { id } = req.params; // req.params достаємо параметри з урли, а ось це :id і є параметри і вони завжди у
    // вигляді стрічки

    res.status(200).json(users[+id]);
})

app.post('/users', (req, res)=>{
    users.push(req.body); // req.body те що нам передає клієнт в body

    res.status(201).json({
        message: "User created." // повідомлення яке отримає фронт/клієнт
    });
})

app.put('/users/:id', (req, res)=>{
    const { id } = req.params;

    users[+id] = req.body;

    res.status(200).json({
        message: 'User updated',
        data: users[+id], // можемо передати обєкт
    })
})

app.delete('/users/:id', (req, res)=>{
    const { id } = req.params;

    users.splice(+id, 1);

    res.status(200).json({
        message: 'User deleted',
    })
})

const PORT = 5001; // по дефолту наш локалхост це 127.0.0.1, а в поєднані з портом 127.0.0.1:5001, а ще далі
// 127.0.0.1:5001/users

app.listen(PORT, () => {
    console.log(`Server has started on PORT ${PORT} 🥸`)
}) // буде слухати порт, топто івентлуп буде завжди працювати і чекати на нові реквести щоб їх обробити
