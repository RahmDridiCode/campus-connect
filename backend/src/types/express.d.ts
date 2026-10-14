import { Request } from 'express';
import { JWTPayload } from './index';

// Extend Express Request avec l'utilisateur authentifié
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
