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
"start": "rimraf dist && tsc-watch --onSuccess \"npm run watch\"",
"watch": "nodemon \"src/app.ts\" --watch \"./src\""
},

// щоб попередні скріпти працювали, дивиться на зміни в файлах 
npm i nodemon


// ESLINT https://typescript-eslint.io/getting-started

npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint typescript

.eslintrc.js

// в цьому файлі прописуємо

module.exports = {
parser: '@typescript-eslint/parser',
parserOptions: {
project: 'tsconfig.json',
sourceType: 'module',
},
plugins: [
'@typescript-eslint/eslint-plugin',
'simple-import-sort',
'import',
],
extends: [
'plugin:prettier/recommended',
'plugin:@typescript-eslint/eslint-recommended',
'plugin:@typescript-eslint/recommended',
'prettier',
],
root: true,
env: {
node: true,
jest: true,
},
rules: {
'@typescript-eslint/no-unused-vars': ['error', {
argsIgnorePattern: 'req|res|next'
}],
'@typescript-eslint/interface-name-prefix': 'off',
'@typescript-eslint/explicit-function-return-type': 'off',
'@typescript-eslint/explicit-module-boundary-types': 'off',
'@typescript-eslint/no-explicit-any': 'off',
"simple-import-sort/imports": "error",
"import/first": "error",
"import/newline-after-import": ["error", { "count": 1 }],
"import/no-duplicates": "error",
'no-console': 'warn',
'sort-imports': ['error', {
'ignoreCase': true,
'ignoreDeclarationSort': true,
'ignoreMemberSort': false,
'memberSyntaxSortOrder': ['none', 'all', 'multiple', 'single'],
'allowSeparatedGroups': false
}],
},
ignorePatterns: ['.eslintrc.js']
};

npm i eslint-plugin-prettier

npm i eslint-config-prettier

npm i eslint-plugin-import

// в налаштуваннях eslint і включити автоматично

// щоб сортувало імпорти
npm i eslint-plugin-simple-import-sort