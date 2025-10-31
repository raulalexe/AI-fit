import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { AppError, isAppError } from '../errors/appError';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.errors.map((err) => ({
        path: err.path,
        message: err.message,
      })),
    });
  }

  if (isAppError(error)) {
    return res.status(error.statusCode).json({
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  }

  console.error('Unexpected error', error);

  const payload: Record<string, unknown> = { message: 'Internal server error' };

  if (env.nodeEnv !== 'production') {
    payload.details = error;
  }

  return res.status(500).json(payload);
};
