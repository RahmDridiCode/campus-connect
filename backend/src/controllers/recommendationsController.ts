import { Request, Response } from 'express';
import { recommendationService } from '../services/recommendationService';

export const recommendationsController = {
  /**
   * GET /api/v1/requests/:id/recommendations
   * Obtenir les recommandations pour une demande
   */
  async getRecommendations(req: Request, res: Response) {
    const { id: requestId } = req.params;

    const recommendations = await recommendationService.getRecommendations(requestId, req.user!);

    res.status(200).json({
      success: true,
      data: recommendations,
      message: 'Recommandations trouvées',
    });
  },
};
