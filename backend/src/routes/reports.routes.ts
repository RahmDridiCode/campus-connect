import { Router } from 'express';
import { reportsController } from '../controllers/reportsController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

/**
 * POST /api/v1/reports
 * Créer un signalement
 */
router.post(
  '/',
  authMiddleware,
  asyncHandler((req, res) => reportsController.createReport(req, res)),
);

/**
 * GET /api/v1/admin/reports
 * Lister les signalements (administrateurs uniquement)
 */
router.get(
  '/',
  authMiddleware,
  adminMiddleware,
  asyncHandler((req, res) => reportsController.getReports(req, res)),
);

/**
 * GET /api/v1/admin/reports/:id
 * Obtenir un signalement
 */
router.get(
  '/:id',
  authMiddleware,
  adminMiddleware,
  asyncHandler((req, res) => reportsController.getReport(req, res)),
);

/**
 * PATCH /api/v1/admin/reports/:id
 * Mettre à jour un signalement
 */
router.patch(
  '/:id',
  authMiddleware,
  adminMiddleware,
  asyncHandler((req, res) => reportsController.updateReport(req, res)),
);

export default router;
