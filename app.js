// modules
const {sayHello} = require('./helpers/sayHello.helpers');

sayHello();

// global variables
// __dirname, __filename, process.cwd();

console.log(__dirname);  // шлях до теперешньої директорії де викликається лог
console.log(__filename);  // шлях до файлу де сталась функція де викликається лог
console.log(process.cwd());  // завжди шлях до директорії в якій лежить app.js типу файла що запускає все

// path для того щоб шляхи на лінуксі маку і віндовс працювали однаково, бо в системах по різному шляхи
// пишутьться через / або через \

const path = require('path');

const joinedPath = path.join(__dirname, 'folder', 'folder2', 'text.txt'); // обєднує шляхи
const normalize = path.normalize('///wersdf/sdfsdf/s/////sdfsdf'); // забирає зайві слеші
const resolve = path.resolve('folder', 'folder2', 'text.txt'); // саме додасть __dirname в початок а не самим писати як в join

console.log(joinedPath);
console.log(normalize);
console.log(resolve);


// OS інфа про операційну систему

const os = require('os');
const {exec} = require('child_process'); // bash scripts всі процеси можна робити в ПК, вкл викл і тд

console.log(os.cpus())
console.log(os.arch())
console.log(os.version())
console.log(os.type())

// FS доступ до файлової системи

const fs = require("fs");

const textPath = path.resolve('folder', 'folder2', 'text2.txt');
fs.writeFile(textPath, 'hello from write file', err => {
    if (err) throw new Error(err.message);
}) // записує другий аргумент в шлях з першого аргумента

fs.readFile(textPath, {encoding: 'utf-8'}, (err, data) => {
    if (err) throw new Error(err.message);
    console.log(data);
}) // читає те що є в файлі з першого аргументу (шлях)

fs.appendFile(textPath, '\newFile',err => {
    if (err) {
        throw new Error(err.message);
    }
}) // додає до вже найовного файлу другий аргумент, /n означає що з нового рядка

fs.truncate(textPath, err => {if (err) throw new Error(err.message); }) // видаляє вміст файлу але не сам файл

fs.unlink(textPath, err => {if (err) throw new Error(err.message); }) // видалить сам файл

fs.readdir(path.resolve('folder'), {withFileTypes: true},(err, files) => {
    if (err) throw new Error(err.message);
    files.forEach(file => {
        console.log(file.isFile()); // чи це файл
    })
}) // читає що є в директорії

fs.mkdir(path.resolve('folder', 'folder4'), err => {
    if (err) throw new Error(err.message);
}) // створює нову дерикторію

fs.rmdir(path.resolve('folder', 'folder4'), err => {
    if (err) throw new Error(err.message);
}) // видаляє дерикторію за шляхом

// FS Promise

const fs2 = require('node:fs/promises')

async function makeDir() {
    await fs2.mkdir(path.join(process.cwd(), 'baseFolder'))
}

makeDir()