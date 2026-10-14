import { Request, Response } from 'express';
import { reviewService } from '../services/reviewService';
import { CreateReviewSchema } from '../validators/reviewValidator';

export const reviewsController = {
  /**
   * POST /api/v1/requests/:id/reviews
   * Créer une évaluation
   */
  async createReview(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    const { id: requestId } = req.params;
    const input = CreateReviewSchema.parse(req.body);

    const result = await reviewService.createReview(requestId, req.user.userId, input);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Évaluation créée avec succès',
    });
  },

  /**
   * GET /api/v1/requests/:id/reviews
   * Lister les évaluations d'une demande
   */
  async getReviews(req: Request, res: Response) {
    const { id: requestId } = req.params;
    const reviews = await reviewService.getReviews(requestId);

    res.status(200).json({
      success: true,
      data: reviews,
    });
  },

  /**
   * GET /api/v1/users/:id/reviews
   * Lister les évaluations reçues par un utilisateur
   */
  async getUserReviews(req: Request, res: Response) {
    const { id: userId } = req.params;
    const reviews = await reviewService.getUserReviews(userId);
    const rating = await reviewService.getUserRating(userId);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        averageRating: rating,
        totalReviews: reviews.length,
      },
    });
  },
};
