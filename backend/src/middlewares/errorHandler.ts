import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { ZodError } from 'zod';

/**
 * Middleware de gestion centralisée des erreurs
 */
export const errorHandler = (
  error: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error('❌ Error:', error);

  // Erreurs de validation Zod
  if (error instanceof ZodError) {
    const formattedErrors: Record<string, string[]> = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!formattedErrors[path]) {
        formattedErrors[path] = [];
      }
      formattedErrors[path].push(err.message);
    });
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: formattedErrors,
    });
  }

  // Erreurs d'application personnalisées
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error instanceof ValidationError && { errors: error.errors }),
    });
  }

  // Erreurs génériques
  res.status(500).json({
    success: false,
    message: 'Erreur serveur interne',
  });
};

/**
 * Wrapper pour les routes async afin de capturer les erreurs
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
