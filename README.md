### Swagger

npm i swagger-ui-express

npm i @types/swagger-ui-express

swagger це документація в форматі json яку ми пишемо для фронта, запустити її http://localhost:5100/swagger/ , також 
хороший приклад з якого можна підглядати https://petstore.swagger.io/, ми розписуємо що робить, віддає і як працює 
кожен ендпоінт.

app.ts
````
import swaggerUi from "swagger-ui-express";
// імпортуємо щоб закинути в swaggerUi.setup
import * as swaggerJson from "./utils/swagger.json";

// щоб запустився наш свагер на цьому ендпоінті
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerJson));
````
swagger.json
````
{
  "swagger": "2.0",
  "info": {
    "description": "It is my firs swagger",
    "version": "1.0.0",
    "title": "Swagger From My Heart",
    "contact": {
      "email": "gydini13@gmail.com"
    }
  },
  "paths": {
    "/users": {
      "get": {
        "tags": ["users"],
        "description": "get all users",
        "summary": "get all users summary",
        "responses": {
          "200": {
            "description": "return array of users",
            "schema": {
              "$ref": "#/definitions/User"
            }
          }
        }
      }
    },"/users/{userId}": {
      "get": {
        "tags": ["users"],
        "description": "get user by id",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "userId",
            "in": "path",
            "description": "ID of user to return",
            "required": true,
            "type": "string"
          },
          {
            "in": "header",
            "name": "Authorization",
            "required": true,
            "schema": {
            "type": "string",
            "default": "sdfasfjoniqjnrfiejqnvroieqbnvrohie"
          }
        }
        ],
        "responses": {
          "200": {
            "description": "return user",
            "schema": {
              "$ref": "#/definitions/User"
            }
          }
        }
      }
    }
  },
  "definitions": {
    "User": {
      "properties": {
      "email": {
        "type": "string"
      },
      "status": {
        "type": "string",
        "default": "inactive"
      },
      "password": {
        "type": "string"
      }
    }
    }
  }
}
````
tsconfig.json
````
// додаємо для свагера щоб бачило json
"resolveJsonModule": true,
````
