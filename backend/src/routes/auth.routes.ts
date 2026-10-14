import { Router, RequestHandler } from 'express';
import { authController, usersController } from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';

import rateLimit from 'express-rate-limit';

const router = Router();

// Anti brute-force : 10 échecs de connexion max par IP toutes les 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Trop de tentatives de connexion, réessayez dans 15 minutes',
  },
});

// ============================================
// Authentication Routes
// ============================================

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post(
  '/register',
  asyncHandler((req, res) => authController.register(req, res)),
);

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post(
  '/login',
  loginLimiter as unknown as RequestHandler,
  asyncHandler((req, res) => authController.login(req, res)),
);

/**
 * POST /api/v1/auth/logout
 * Logout user (requires auth)
 */
router.post(
  '/logout',
  authMiddleware,
  asyncHandler((req, res) => authController.logout(req, res)),
);

/**
 * GET /api/v1/auth/me
 * Get current user data (requires auth)
 */
router.get(
  '/me',
  authMiddleware,
  asyncHandler((req, res) => authController.me(req, res)),
);

// ============================================
// User Profile Routes
// ============================================

/**
 * GET /api/v1/users/me
 * Get current user profile (requires auth)
 */
router.get(
  '/me',
  authMiddleware,
  asyncHandler((req, res) => usersController.getProfile(req, res)),
);

/**
 * PATCH /api/v1/users/me
 * Update current user profile (requires auth)
 */
router.patch(
  '/me',
  authMiddleware,
  asyncHandler((req, res) => usersController.updateProfile(req, res)),
);

/**
 * GET /api/v1/users/:id
 * Get public user profile
 */
router.get(
  '/:id',
  asyncHandler((req, res) => usersController.getPublicProfile(req, res)),
);

export default router;
