import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromCookie } from '../utils/jwt';
import { AuthenticationError } from '../utils/errors';

/**
 * Middleware pour vérifier l'authentification JWT
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = extractTokenFromCookie(req.headers.cookie);

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Token manquant',
    });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré',
    });
    return;
  }

  req.user = payload;
  next();
};

/**
 * Middleware pour vérifier que l'utilisateur est admin
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Non authentifié',
    });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Accès réservé aux administrateurs',
    });
    return;
  }

  next();
};

/**
 * Middleware optionnel pour extraire le user s'il est fourni
 */
export const optionalAuthMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const token = extractTokenFromCookie(req.headers.cookie);
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
};
