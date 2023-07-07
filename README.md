### Rate Limit

npm i express-rate-limit

swagger це документація в форматі json яку ми пишемо для фронта, запустити її http://localhost:5100/swagger/ , також 
хороший приклад з якого можна підглядати https://petstore.swagger.io/, ми розписуємо що робить, віддає і як працює 
кожен ендпоінт.

app.ts
````
import rateLimit from "express-rate-limit";

// набір правил по кількості запитів з одної айпі за певний час
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 60 second
  max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
});

// це якщо хочемо використовувати на всіх ендпоінтах *
// Apply the rate limiting middleware to API calls only
app.use("*", apiLimiter);
// це якщо хочемо використовувати на одному ендпоінту
//app.use("/users", apiLimiter, userRouter);
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
