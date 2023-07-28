import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";
import { isObjectIdOrHexString } from "mongoose";

import { ApiError } from "../errors";

class CommonMiddleware {
  // огорнули наш метод в функцію щоб могти динамічно передавати філду з роутера в наш метод
  public isIdValid(field: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const id = req.params[field];

        // isObjectIdOrHexString(id) метод з монгуса для перевірки валідності id
        if (!isObjectIdOrHexString(id)) {
          throw new ApiError("Id is nit valid", 400);
        }

        next();
      } catch (e) {
        next(e);
      }
    };
  }
  // ObjectSchema типізуємо так щоб TS розумів що validator це як схема з JOI і знав що у нього є методи такі як
  // validate()
  public isBodyValid(validator: ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const { error, value } = validator.validate(req.body);
        // якщо не пройшло валідацію кидаємо помилку
        if (error) {
          throw new ApiError(error.message, 400);
        }
        // для req.res який є обєктом створюємо нове значення locals в яке записуємо що захочемо в даному випадку value, щоб
        // ми змогли це забрати в контролері
        req.body = value;

        next();
      } catch (e) {
        next(e);
      }
    };
  }
}

export const commonMiddleware = new CommonMiddleware();
