// встановлення TS
tsc -init

// check version
tsc -v

// мої налаштування
{
"compilerOptions": {
"module": "commonjs",
"declaration": true,
"removeComments": true,
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
"allowSyntheticDefaultImports": true,
"target": "ES2020",
"sourceMap": true,
"outDir": "./dist",
"baseUrl": "./",
"incremental": true,
"skipLibCheck": true,
"strictNullChecks": false,
"noImplicitAny": false,
"strictBindCallApply": false,
"forceConsistentCasingInFileNames": false,
"noFallthroughCasesInSwitch": false
}
}


npm i rimraf
npm i tsc-watch
npm i ts-node

// в package.json вставляємо скріпти щоб вони відслідковували усі зміни в файлах
"scripts": {
"start": "rimraf dist && tsc-watch --onSuccess 'npm run watch'",
"watch": "nodemon 'src/app.ts' --watch './src'"
},

// щоб попередні скріпти працювали, дивиться на зміни в файлах 
npm i nodemon