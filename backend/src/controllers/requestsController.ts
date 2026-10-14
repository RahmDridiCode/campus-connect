import { Request, Response } from 'express';
import { requestService } from '../services/requestService';
import {
  CreateHelpRequestSchema,
  UpdateHelpRequestSchema,
  HelpRequestFilterSchema,
} from '../validators/requestValidator';

export const requestsController = {
  /**
   * GET /api/v1/requests
   * Lister les demandes avec filtres
   */
  async listRequests(req: Request, res: Response) {
    const filters = HelpRequestFilterSchema.parse(req.query);
    const authorId = filters.mine === 'true' && req.user ? req.user.userId : undefined;
    const result = await requestService.listRequests(filters, authorId);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        pages: result.pages,
        total: result.total,
        limit: filters.limit,
      },
    });
  },

  /**
   * POST /api/v1/requests
   * Créer une demande d'aide
   */
  async createRequest(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    const input = CreateHelpRequestSchema.parse(req.body);
    const result = await requestService.createRequest(req.user.userId, input);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Demande créée avec succès',
    });
  },

  /**
   * GET /api/v1/requests/:id
   * Obtenir une demande par ID
   */
  async getRequest(req: Request, res: Response) {
    const { id } = req.params;
    const result = await requestService.getRequest(id, req.user);

    res.status(200).json({
      success: true,
      data: result,
    });
  },

  /**
   * PATCH /api/v1/requests/:id
   * Mettre à jour une demande
   */
  async updateRequest(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    const { id } = req.params;
    const input = UpdateHelpRequestSchema.parse(req.body);
    const result = await requestService.updateRequest(id, req.user.userId, input);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Demande mise à jour',
    });
  },

  /**
   * DELETE /api/v1/requests/:id
   * Supprimer une demande
   */
  async deleteRequest(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    const { id } = req.params;
    await requestService.deleteRequest(id, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Demande supprimée',
    });
  },
};
