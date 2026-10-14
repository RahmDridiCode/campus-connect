import { Request } from 'express';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
