import { Router } from 'express';
import { proposalsController } from '../controllers/proposalsController';
import { proposalRepository } from '../repositories/proposalRepository';
import { authMiddleware } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';

// Monté sur /api/v1/requests/:id/proposals
export const requestProposalsRouter = Router({ mergeParams: true });

requestProposalsRouter.post(
  '/',
  authMiddleware,
  asyncHandler((req, res) => proposalsController.createProposal(req, res)),
);

requestProposalsRouter.get(
  '/',
  authMiddleware,
  asyncHandler((req, res) => proposalsController.getProposals(req, res)),
);

// Monté sur /api/v1/proposals
export const proposalActionsRouter = Router();

proposalActionsRouter.get(
  '/mine',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await proposalRepository.findMine(req.user!.userId);
    res.status(200).json({ success: true, data });
  }),
);

proposalActionsRouter.patch(
  '/:id/accept',
  authMiddleware,
  asyncHandler((req, res) => proposalsController.acceptProposal(req, res)),
);

proposalActionsRouter.patch(
  '/:id/reject',
  authMiddleware,
  asyncHandler((req, res) => proposalsController.rejectProposal(req, res)),
);

// Monté sur /api/v1/requests/:id/complete
export const completeRequestRouter = Router({ mergeParams: true });

completeRequestRouter.post(
  '/',
  authMiddleware,
  asyncHandler((req, res) => proposalsController.completeRequest(req, res)),
);
