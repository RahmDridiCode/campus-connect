import { Router } from 'express';
import { recommendationsController } from '../controllers/recommendationsController';
import { authMiddleware } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router({ mergeParams: true });

/**
 * GET /api/v1/requests/:id/recommendations
 * Obtenir les recommandations pour une demande
 */
router.get(
  '/',
  authMiddleware,
  asyncHandler((req, res) => recommendationsController.getRecommendations(req, res)),
);

export default router;
