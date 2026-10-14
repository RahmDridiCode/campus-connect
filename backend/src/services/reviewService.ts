import { reviewRepository } from '../repositories/reviewRepository';
import { requestRepository } from '../repositories/requestRepository';
import { proposalRepository } from '../repositories/proposalRepository';
import { CreateReviewInput } from '../validators/reviewValidator';
import { AuthorizationError, NotFoundError, ConflictError } from '../utils/errors';

export const reviewService = {
  /**
   * Créer une évaluation
   */
  async createReview(requestId: string, authorId: string, input: CreateReviewInput) {
    // Vérifier que la demande existe et est COMPLETED
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Demande non trouvée');
    }

    if (request.status !== 'COMPLETED') {
      throw new ConflictError('Les évaluations ne sont possibles que pour les demandes terminées');
    }

    // Vérifier que l'utilisateur est participant (auteur ou proposeur accepté)
    const proposals = await proposalRepository.findByRequestId(requestId);
    const acceptedProposal = proposals.find((p) => p.status === 'ACCEPTED');

    const isAuthor = request.authorId === authorId;
    const isProposer = acceptedProposal && acceptedProposal.proposerId === authorId;

    if (!isAuthor && !isProposer) {
      throw new AuthorizationError('Seuls les participants peuvent évaluer cette séance');
    }

    // Vérifier que l'utilisateur n'évalue pas lui-même
    if (authorId === input.targetId) {
      throw new ConflictError('Vous ne pouvez pas vous auto-évaluer');
    }

    // Vérifier que la cible est participant
    if (!isAuthor && input.targetId !== request.authorId) {
      throw new ConflictError("La personne à évaluer n'est pas participant");
    }

    if (isAuthor && input.targetId !== acceptedProposal?.proposerId) {
      throw new ConflictError("La personne à évaluer n'est pas participant");
    }

    // Vérifier qu'une évaluation n'existe pas déjà
    const existing = await reviewRepository.findExisting(requestId, authorId, input.targetId);
    if (existing) {
      throw new ConflictError('Vous avez déjà évalué cette personne pour cette séance');
    }

    // Créer l'évaluation
    return reviewRepository.create({
      requestId,
      authorId,
      targetId: input.targetId,
      rating: input.rating,
      comment: input.comment,
    });
  },

  /**
   * Obtenir les évaluations d'une demande
   */
  async getReviews(requestId: string) {
    return reviewRepository.findByRequestId(requestId);
  },

  /**
   * Obtenir les évaluations reçues par un utilisateur
   */
  async getUserReviews(userId: string) {
    return reviewRepository.findByTargetId(userId);
  },

  /**
   * Obtenir la moyenne de notes
   */
  async getUserRating(userId: string) {
    return reviewRepository.getAverageRating(userId);
  },
};
