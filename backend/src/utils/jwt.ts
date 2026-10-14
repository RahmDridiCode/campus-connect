import jwt, { SignOptions } from 'jsonwebtoken';
import { JWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Générer un JWT token
 */
export const generateToken = (payload: JWTPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as any,
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Vérifier et décoder un JWT token
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Extraire le token d'un cookie HttpOnly
 */
export const extractTokenFromCookie = (cookieHeader?: string): string | null => {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const tokenCookie = cookies.find((c) => c.startsWith('token='));

  if (!tokenCookie) return null;
  return tokenCookie.substring('token='.length);
};

/**
 * Générer un cookie Set-Cookie pour HttpOnly
 */
export const generateAuthCookie = (token: string): string => {
  return `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`;
};

/**
 * Générer un cookie pour déconnexion
 */
export const generateLogoutCookie = (): string => {
  return 'token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0';
};
