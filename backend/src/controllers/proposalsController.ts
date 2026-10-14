import { Request, Response } from 'express';
import { proposalService } from '../services/proposalService';
import { CreateProposalSchema } from '../validators/proposalValidator';

export const proposalsController = {
  /**
   * POST /api/v1/requests/:id/proposals
   * Créer une proposition
   */
  async createProposal(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    const { id: requestId } = req.params;
    const input = CreateProposalSchema.parse(req.body);

    const result = await proposalService.createProposal(requestId, req.user.userId, input);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Proposition créée avec succès',
    });
  },

  /**
   * GET /api/v1/requests/:id/proposals
   * Lister les propositions d'une demande
   */
  async getProposals(req: Request, res: Response) {
    const { id: requestId } = req.params;
    const proposals = await proposalService.getProposals(requestId, req.user!);

    res.status(200).json({
      success: true,
      data: proposals,
    });
  },

  /**
   * PATCH /api/v1/proposals/:id/accept
   * Accepter une proposition
   */
  async acceptProposal(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    const { id: proposalId } = req.params;
    const result = await proposalService.acceptProposal(proposalId, req.user.userId);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Proposition acceptée',
    });
  },

  /**
   * PATCH /api/v1/proposals/:id/reject
   * Refuser une proposition
   */
  async rejectProposal(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    const { id: proposalId } = req.params;
    const result = await proposalService.rejectProposal(proposalId, req.user.userId);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Proposition refusée',
    });
  },

  /**
   * POST /api/v1/requests/:id/complete
   * Terminer la séance
   */
  async completeRequest(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    const { id: requestId } = req.params;
    const result = await proposalService.completeRequest(requestId, req.user.userId);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Séance terminée',
    });
  },
};
