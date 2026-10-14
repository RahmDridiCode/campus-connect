import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboardService';

export const dashboardController = {
  /**
   * GET /api/v1/dashboard
   * Obtenir les statistiques du tableau de bord
   */
  async getStats(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    const stats = await dashboardService.getStats(req.user.userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  },
};
