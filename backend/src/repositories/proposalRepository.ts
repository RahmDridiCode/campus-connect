import { PrismaClient, HelpProposal, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface HelpProposalDTO extends HelpProposal {
  proposer?: {
    id: string;
    email: string;
    fullName: string;
    skills: string[];
  };
}

export const proposalRepository = {
  /**
   * Créer une proposition
   */
  async create(data: {
    requestId: string;
    proposerId: string;
    message: string;
    availabilities: string[];
  }): Promise<HelpProposalDTO> {
    return prisma.helpProposal.create({
      data,
      include: {
        proposer: {
          select: {
            id: true,
            email: true,
            fullName: true,
            skills: true,
          },
        },
      },
    });
  },

  /**
   * Propositions envoyées et reçues par un utilisateur
   */
  async findMine(userId: string) {
    const include = {
      proposer: { select: { id: true, fullName: true, email: true, skills: true } },
      request: {
        select: {
          id: true,
          title: true,
          subject: true,
          status: true,
          author: { select: { id: true, fullName: true } },
        },
      },
    };
    const [sent, received] = await Promise.all([
      prisma.helpProposal.findMany({
        where: { proposerId: userId, request: { hidden: false } },
        include,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.helpProposal.findMany({
        where: { request: { authorId: userId, hidden: false } },
        include,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { sent, received };
  },

  /**
   * Trouver une proposition par ID
   */
  async findById(id: string): Promise<HelpProposalDTO | null> {
    return prisma.helpProposal.findUnique({
      where: { id },
      include: {
        proposer: {
          select: {
            id: true,
            email: true,
            fullName: true,
            skills: true,
          },
        },
      },
    });
  },

  /**
   * Trouver propositions pour une demande
   */
  async findByRequestId(requestId: string): Promise<HelpProposalDTO[]> {
    return prisma.helpProposal.findMany({
      where: { requestId },
      include: {
        proposer: {
          select: {
            id: true,
            email: true,
            fullName: true,
            skills: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Vérifier si une proposition existe déjà
   */
  async findExisting(requestId: string, proposerId: string): Promise<HelpProposalDTO | null> {
    return prisma.helpProposal.findUnique({
      where: {
        requestId_proposerId: {
          requestId,
          proposerId,
        },
      },
      include: {
        proposer: {
          select: {
            id: true,
            email: true,
            fullName: true,
            skills: true,
          },
        },
      },
    });
  },

  /**
   * Mettre à jour le statut d'une proposition
   */
  async updateStatus(
    id: string,
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED',
  ): Promise<HelpProposalDTO> {
    return prisma.helpProposal.update({
      where: { id },
      data: { status: status as any },
      include: {
        proposer: {
          select: {
            id: true,
            email: true,
            fullName: true,
            skills: true,
          },
        },
      },
    });
  },

  /**
   * Mettre à jour le statut de plusieurs propositions
   */
  async updateManyStatus(
    proposalIds: string[],
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED',
  ): Promise<number> {
    const result = await prisma.helpProposal.updateMany({
      where: {
        id: {
          in: proposalIds,
        },
      },
      data: { status: status as any },
    });
    return result.count;
  },
};
