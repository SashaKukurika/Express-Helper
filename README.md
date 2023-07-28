## Docker AWC Connection

### Nest CLI
```bash
remove dotenv from package.json and configs
create directory - backend, move -src, package.json, eslint, tsconfig to this directory
$ create file - docker-compose.yml

version: "3.9"

services:
  app:
    build:
      context: .
    env_file:
      - .env
#    ports:
#      - "5555:${PORT}"
    volumes:
      - ./dist:/app
      - /app/node_modules
    restart: on-failure
    command: sh -c "node --watch app.js"
  db:
    image: mongo
    env_file:
      - .env
    ports:
      - "27018:27017"
    volumes:
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js
      - ./mongo_db:/data/db
    restart: on-failure
    web:
    image: nginx:alpine
    ports:
      - "80:80"
    restart: on-failure
    volumes:
      - ./client:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      
      
$ create file - mongo-init.js

db.createUser(
    {
        user: "user",
        pwd: "user",
        roles: [
            {
                role: "readWrite",
                db: "express-help",
            }
        ]
    }
)
  
$ connect database - mongoDB - port 27018 - username - password

$ go to directory backend (cd backend) and run npm instal

$ create file - Dockerfile

FROM node:18-alpine

MAINTAINER Some Dev

RUN mkdir /app

COPY backend/package.json /app

WORKDIR /app

RUN npm install --production

$ at app.ts

const dbConnect = async () => {
  let dbCon = false;

  while (!dbCon){
    try{
      console.log("Connecting to database")
      await mongoose.connect(configs.DB_URL);
      dbCon = true
    } catch (e) {
      console.log("Database unavailable, wait 3 seconds");
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
}

const start = async () => {
  try{
  await dbConnect();
  await app.listen(configs.DB_PORT, () => {
    console.log(`Server has started on PORT ${configs.DB_PORT}`);
  });
  } catch (e) {
    console.log(e)
  }
}

start();

$ at tsconfig "outDir": "../dist", add second dot
$ delete --onSuccess "npm run watch" from script start

$ to run docker - docker compose up --build

$ create directory client
$ create file - nginx.conf

server {
    listen 80;
    server_name localhost;
    index index.html;
    root /usr/share/nginx/html;
    client_max_body_size 20M;

    location / {
        try_files $uri$args $uri$args/ /index.html;
    }

    location /api/ {
        proxy_pass http://app:5000/;
        proxy_set_header HOST $host;
        # for sockets
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

}

$ docker restart serviceName - wil restart only one service, like web or app
$ docker up serviceName - wil start only one service, like web or app
$ docker stop serviceName - wil stop only one service, like web or app
```