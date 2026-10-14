import { requestRepository } from '../repositories/requestRepository';
import { userRepository } from '../repositories/userRepository';
import {
  CreateHelpRequestInput,
  UpdateHelpRequestInput,
  HelpRequestFilterInput,
} from '../validators/requestValidator';
import { AuthorizationError, NotFoundError } from '../utils/errors';

export const requestService = {
  /**
   * Créer une demande d'aide
   */
  async createRequest(authorId: string, input: CreateHelpRequestInput) {
    return requestRepository.create({
      ...input,
      authorId,
    });
  },

  /**
   * Obtenir une demande par ID
   */
  async getRequest(id: string, viewer?: { userId: string; role: string }) {
    const request = await requestRepository.findById(id);
    if (!request || (request.hidden && viewer?.role !== 'ADMIN')) {
      throw new NotFoundError('Demande non trouvée');
    }
    return request;
  },

  /**
   * Lister les demandes avec filtres
   */
  async listRequests(filters: HelpRequestFilterInput, authorId?: string) {
    return requestRepository.findMany(filters, authorId);
  },

  /**
   * Mettre à jour une demande (auteur seulement)
   */
  async updateRequest(id: string, userId: string, input: UpdateHelpRequestInput) {
    const request = await requestRepository.findById(id);
    if (!request) {
      throw new NotFoundError('Demande non trouvée');
    }

    // Vérifier que l'utilisateur est l'auteur
    if (request.authorId !== userId) {
      throw new AuthorizationError('Vous ne pouvez modifier que vos propres demandes');
    }

    // Vérifier que la demande est toujours OPEN (ne peut pas modifier si elle a une proposition acceptée)
    if (request.status !== 'OPEN') {
      throw new AuthorizationError('Vous ne pouvez modifier une demande que si elle est ouverte');
    }

    return requestRepository.update(id, input);
  },

  /**
   * Supprimer une demande (auteur seulement)
   */
  async deleteRequest(id: string, userId: string) {
    const request = await requestRepository.findById(id);
    if (!request) {
      throw new NotFoundError('Demande non trouvée');
    }

    if (request.authorId !== userId) {
      throw new AuthorizationError('Vous ne pouvez supprimer que vos propres demandes');
    }

    await requestRepository.delete(id);
  },
};
