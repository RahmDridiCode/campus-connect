import { reportRepository } from '../repositories/reportRepository';
import { requestRepository } from '../repositories/requestRepository';
import { CreateReportInput, UpdateReportInput } from '../validators/reportValidator';
import { AuthorizationError, NotFoundError, ConflictError } from '../utils/errors';

export const reportService = {
  /**
   * Créer un signalement
   */
  async createReport(userId: string, input: CreateReportInput) {
    // Vérifier que la demande existe
    const request = await requestRepository.findById(input.requestId);
    if (!request || request.hidden) {
      throw new NotFoundError('Demande non trouvée');
    }

    // L'auteur ne peut pas signaler sa propre demande
    if (request.authorId === userId) {
      throw new ConflictError('Vous ne pouvez pas signaler votre propre demande');
    }

    // Créer le signalement
    return reportRepository.create({
      requestId: input.requestId,
      reporterId: userId,
      reason: input.reason as any,
      description: input.description,
    });
  },

  /**
   * Lister les signalements (administrateurs uniquement)
   */
  async getReports(userId: string, page: number = 1, limit: number = 10) {
    // Vérifier que l'utilisateur est administrateur (géré par middleware)
    return reportRepository.findAll(page, limit);
  },

  /**
   * Obtenir un signalement (administrateurs uniquement)
   */
  async getReport(userId: string, reportId: string) {
    // Vérifier que l'utilisateur est administrateur (géré par middleware)
    const report = await reportRepository.findById(reportId);
    if (!report) {
      throw new NotFoundError('Signalement non trouvé');
    }

    return report;
  },

  /**
   * Mettre à jour un signalement (administrateurs uniquement)
   */
  async updateReport(userId: string, reportId: string, input: UpdateReportInput) {
    // Vérifier que l'utilisateur est administrateur (géré par middleware)
    const report = await reportRepository.findById(reportId);
    if (!report) {
      throw new NotFoundError('Signalement non trouvé');
    }

    if (report.status !== 'PENDING') {
      throw new ConflictError('Ce signalement a déjà été traité');
    }

    const result = await reportRepository.process(reportId, input.action, userId, input.notes);
    if (!result) {
      throw new ConflictError('Ce signalement a déjà été traité');
    }
    return result;
  },
};
