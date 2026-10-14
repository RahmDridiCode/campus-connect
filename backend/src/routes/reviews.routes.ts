import { Router } from 'express';
import { reviewsController } from '../controllers/reviewsController';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router({ mergeParams: true });

/**
 * POST /api/v1/requests/:id/reviews
 * Créer une évaluation
 */
router.post(
  '/',
  authMiddleware,
  asyncHandler((req, res) => reviewsController.createReview(req, res)),
);

/**
 * GET /api/v1/requests/:id/reviews
 * Lister les évaluations d'une demande
 */
router.get(
  '/',
  optionalAuthMiddleware,
  asyncHandler((req, res) => reviewsController.getReviews(req, res)),
);

export default router;
