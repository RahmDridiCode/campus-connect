import { Request, Response } from 'express';
import { reportService } from '../services/reportService';
import { CreateReportSchema, UpdateReportSchema } from '../validators/reportValidator';

export const reportsController = {
  /**
   * POST /api/v1/reports
   * Créer un signalement
   */
  async createReport(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    const input = CreateReportSchema.parse(req.body);
    const report = await reportService.createReport(req.user.userId, input);

    res.status(201).json({
      success: true,
      data: report,
      message: 'Signalement créé avec succès',
    });
  },

  /**
   * GET /api/v1/admin/reports
   * Lister les signalements (administrateurs uniquement)
   */
  async getReports(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await reportService.getReports(req.user.userId, page, limit);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    });
  },

  /**
   * GET /api/v1/admin/reports/:id
   * Obtenir un signalement
   */
  async getReport(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    const { id } = req.params;
    const report = await reportService.getReport(req.user.userId, id);

    res.status(200).json({
      success: true,
      data: report,
    });
  },

  /**
   * PATCH /api/v1/admin/reports/:id
   * Mettre à jour un signalement
   */
  async updateReport(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    const { id } = req.params;
    const input = UpdateReportSchema.parse(req.body);
    const report = await reportService.updateReport(req.user.userId, id, input);

    res.status(200).json({
      success: true,
      data: report,
      message:
          input.action === 'HIDE'
            ? 'Publication masquée et signalement traité'
            : 'Signalement rejeté',
    });
  },
};
