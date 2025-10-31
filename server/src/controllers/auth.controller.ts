import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request<unknown, unknown, RegisterInput>, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request<unknown, unknown, LoginInput>, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
