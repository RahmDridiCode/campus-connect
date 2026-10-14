import { Router } from 'express';
import { requestsController } from '../controllers/requestsController';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

/**
 * GET /api/v1/requests
 * Lister les demandes avec filtres (public)
 */
router.get(
  '/',
  optionalAuthMiddleware,
  asyncHandler((req, res) => requestsController.listRequests(req, res)),
);

/**
 * POST /api/v1/requests
 * Créer une demande (auth required)
 */
router.post(
  '/',
  authMiddleware,
  asyncHandler((req, res) => requestsController.createRequest(req, res)),
);

/**
 * GET /api/v1/requests/:id
 * Obtenir une demande (public)
 */
router.get(
  '/:id',
  optionalAuthMiddleware,
  asyncHandler((req, res) => requestsController.getRequest(req, res)),
);

/**
 * PATCH /api/v1/requests/:id
 * Mettre à jour une demande (auth + auteur)
 */
router.patch(
  '/:id',
  authMiddleware,
  asyncHandler((req, res) => requestsController.updateRequest(req, res)),
);

/**
 * DELETE /api/v1/requests/:id
 * Supprimer une demande (auth + auteur)
 */
router.delete(
  '/:id',
  authMiddleware,
  asyncHandler((req, res) => requestsController.deleteRequest(req, res)),
);

export default router;
