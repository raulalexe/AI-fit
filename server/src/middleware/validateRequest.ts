import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export const validateRequest = <T>(schema: ZodSchema<T>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schema.parseAsync(req.body);
      req.body = result;
      next();
    } catch (error) {
      next(error);
    }
  };
