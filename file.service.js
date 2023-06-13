const fs = require('fs/promises'); // імпортуємо FS
const path = require("node:path");

module.exports = {
    readDB: async () => {
        const buffer = await fs.readFile(path.join(process.cwd(), 'users.json')); // читаємо файл з юзерами
        const json = buffer.toString(); // прочитавши ми отримаємо буфер і його конвертуємо в стрінгу
        return json ? JSON.parse(json) : []; // з стрінги робимо джейсон формат
    }, // відразу в експортах модуля прописуємо самі функції які будемо використовувати в інших файлах

    writeDB: async (users) => {
        await fs.writeFile(path.join(process.cwd(), 'users.json'), JSON.stringify(users)); // записуємо отриманих
        // юзерів в файл як стрінгу
    },
}