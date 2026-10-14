import { PrismaClient } from '@prisma/client';
import { proposalRepository } from '../repositories/proposalRepository';
import { requestRepository } from '../repositories/requestRepository';
import { CreateProposalInput } from '../validators/proposalValidator';
import { AuthorizationError, NotFoundError, ConflictError } from '../utils/errors';

const prisma = new PrismaClient();

export const proposalService = {
  /**
   * Proposer son aide (avec gestion atomique)
   */
  async createProposal(requestId: string, proposerId: string, input: CreateProposalInput) {
    // Vérifier que la demande existe
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Demande non trouvée');
    }

    // Vérifier que la demande est OPEN
    if (request.status !== 'OPEN') {
      throw new ConflictError("Cette demande n'accepte plus de propositions");
    }

    // Vérifier que l'utilisateur n'est pas l'auteur
    if (request.authorId === proposerId) {
      throw new AuthorizationError(
        'Vous ne pouvez pas proposer votre aide sur votre propre demande',
      );
    }

    // Vérifier qu'une proposition n'existe pas déjà
    const existing = await proposalRepository.findExisting(requestId, proposerId);
    if (existing) {
      throw new ConflictError('Vous avez déjà proposé votre aide pour cette demande');
    }

    // Créer la proposition
    return proposalRepository.create({
      requestId,
      proposerId,
      message: input.message,
      availabilities: input.availabilities,
    });
  },

  /**
   * Obtenir les propositions d'une demande :
   * l'auteur (et l'admin) voit tout, un proposant ne voit que la sienne.
   */
  async getProposals(requestId: string, viewer: { userId: string; role: string }) {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Demande non trouvée');
    }
    const proposals = await proposalRepository.findByRequestId(requestId);
    if (request.authorId === viewer.userId || viewer.role === 'ADMIN') {
      return proposals;
    }
    return proposals.filter((p) => p.proposerId === viewer.userId);
  },

  /**
   * Accepter une proposition : tout se passe dans UNE transaction (tx),
   * donc soit tout réussit, soit rien n'est modifié.
   */
  async acceptProposal(proposalId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const proposal = await tx.helpProposal.findUnique({
        where: { id: proposalId },
        include: { request: true },
      });
      if (!proposal) {
        throw new NotFoundError('Proposition non trouvée');
      }
      if (proposal.request.hidden) {
        throw new NotFoundError('Proposition non trouvée');
      }
      if (proposal.request.authorId !== userId) {
        throw new AuthorizationError("Seul l'auteur de la demande peut accepter une proposition");
      }
      if (proposal.status !== 'PENDING') {
        throw new ConflictError("Cette proposition n'est plus disponible");
      }

      // La condition status: 'OPEN' garantit une seule proposition acceptée
      const changed = await tx.helpRequest.updateMany({
        where: { id: proposal.requestId, status: 'OPEN' },
        data: { status: 'HELP_ACCEPTED' },
      });
      if (changed.count === 0) {
        throw new ConflictError("Cette demande n'est plus ouverte");
      }

      // Refus automatique des autres propositions en attente
      await tx.helpProposal.updateMany({
        where: {
          requestId: proposal.requestId,
          id: { not: proposalId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      });

      return tx.helpProposal.update({
        where: { id: proposalId },
        data: { status: 'ACCEPTED' },
        include: {
          proposer: {
            select: { id: true, email: true, fullName: true, skills: true },
          },
        },
      });
    });
  },
  /**
   * Refuser une proposition
   */
  async rejectProposal(proposalId: string, userId: string) {
    const proposal = await proposalRepository.findById(proposalId);
    if (!proposal) {
      throw new NotFoundError('Proposition non trouvée');
    }

    const request = await requestRepository.findById(proposal.requestId);
    if (request?.hidden) {
      throw new NotFoundError('Proposition non trouvée');
    }
    if (!request || request.authorId !== userId) {
      throw new AuthorizationError("Seul l'auteur de la demande peut refuser une proposition");
    }

    if (proposal.status !== 'PENDING') {
      throw new ConflictError("Cette proposition n'est plus disponible");
    }

    return proposalRepository.updateStatus(proposalId, 'REJECTED');
  },

  /**
   * Terminer la séance (auteur ou proposeur accepté)
   */
  async completeRequest(requestId: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const request = await requestRepository.findById(requestId);
      if (!request) {
        throw new NotFoundError('Demande non trouvée');
      }

      // Vérifier que c'est l'auteur ou le proposeur accepté
      if (request.authorId !== userId) {
        const acceptedProposal = await proposalRepository
          .findByRequestId(requestId)
          .then((proposals) => proposals.find((p) => p.status === 'ACCEPTED'));

        if (!acceptedProposal || acceptedProposal.proposerId !== userId) {
          throw new AuthorizationError(
            "Seul l'auteur ou le proposeur accepté peut terminer la séance",
          );
        }
      }

      // Vérifier que la demande est HELP_ACCEPTED
      if (request.status !== 'HELP_ACCEPTED') {
        throw new ConflictError('La demande doit être en cours pour la terminer');
      }

      // Mettre à jour le statut
      return requestRepository.updateStatus(requestId, 'COMPLETED');
    });
  },
};
