import { NextFunction, Request, Response } from "express";

import { authService } from "../services/auth.service";

class AuthController {
  public async register(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.register(req.body);
    } catch (e) {
      next(e);
    }
  }
}

export const authController = new AuthController();
