import { PrismaClient, Review } from '@prisma/client';

const prisma = new PrismaClient();

export interface ReviewDTO extends Review {
  author?: {
    id: string;
    fullName: string;
    email: string;
  };
  target?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export const reviewRepository = {
  /**
   * Créer une évaluation
   */
  async create(data: {
    requestId: string;
    authorId: string;
    targetId: string;
    rating: number;
    comment?: string;
  }): Promise<ReviewDTO> {
    return prisma.review.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        target: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * Obtenir les évaluations d'une demande
   */
  async findByRequestId(requestId: string): Promise<ReviewDTO[]> {
    return prisma.review.findMany({
      where: { requestId },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        target: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Vérifier si une évaluation existe déjà
   */
  async findExisting(
    requestId: string,
    authorId: string,
    targetId: string,
  ): Promise<ReviewDTO | null> {
    return prisma.review.findUnique({
      where: {
        requestId_authorId_targetId: {
          requestId,
          authorId,
          targetId,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        target: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * Obtenir les évaluations reçues par un utilisateur
   */
  async findByTargetId(targetId: string): Promise<ReviewDTO[]> {
    return prisma.review.findMany({
      where: { targetId },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        target: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Calculer la moyenne de notes pour un utilisateur
   */
  async getAverageRating(userId: string): Promise<number | null> {
    const result = await prisma.review.aggregate({
      where: { targetId: userId },
      _avg: {
        rating: true,
      },
    });
    return result._avg.rating;
  },
};
