import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { authMiddleware } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

/**
 * GET /api/v1/dashboard
 * Obtenir les statistiques du tableau de bord
 */
router.get(
  '/',
  authMiddleware,
  asyncHandler((req, res) => dashboardController.getStats(req, res)),
);

export default router;
