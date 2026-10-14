import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DashboardStats {
  totalRequests: number;
  openRequests: number;
  completedRequests: number;
  totalProposals: number;
  receivedProposals: number;
  pendingProposals: number;
  acceptedProposals: number;
  totalReviews: number;
  averageRating: number | null;
  recentRequests: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: Date;
  }>;
  recentProposals: Array<{
    id: string;
    status: string;
    request: { id: string; title: string };
    createdAt: Date;
  }>;
}

export const dashboardService = {
  /**
   * Obtenir les statistiques du tableau de bord
   */
  async getStats(userId: string): Promise<DashboardStats> {
    // Demandes publiées
    const totalRequests = await prisma.helpRequest.count({
      where: { authorId: userId, hidden: false },
    });

    const openRequests = await prisma.helpRequest.count({
      where: { authorId: userId, status: 'OPEN', hidden: false },
    });

    const completedRequests = await prisma.helpRequest.count({
      where: {
        status: 'COMPLETED',
        hidden: false,
        OR: [
          { authorId: userId },
          { proposals: { some: { proposerId: userId, status: 'ACCEPTED' } } },
        ],
      },
    });

    // Propositions envoyées
    const totalProposals = await prisma.helpProposal.count({
      where: { proposerId: userId, request: { hidden: false } },
    });

    const receivedProposals = await prisma.helpProposal.count({
      where: { request: { authorId: userId, hidden: false } },
    });

    const pendingProposals = await prisma.helpProposal.count({
      where: { proposerId: userId, status: 'PENDING', request: { hidden: false } },
    });

    const acceptedProposals = await prisma.helpProposal.count({
      where: { proposerId: userId, status: 'ACCEPTED', request: { hidden: false } },
    });

    // Évaluations reçues
    const totalReviews = await prisma.review.count({
      where: { targetId: userId },
    });

    const averageRating = (
      await prisma.review.aggregate({
        where: { targetId: userId },
        _avg: { rating: true },
      })
    )._avg.rating;

    // Demandes récentes
    const recentRequests = await prisma.helpRequest.findMany({
      where: { authorId: userId, hidden: false },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Propositions récentes
    const recentProposals = await prisma.helpProposal.findMany({
      where: { proposerId: userId, request: { hidden: false } },
      select: {
        id: true,
        status: true,
        request: { select: { id: true, title: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      totalRequests,
      openRequests,
      completedRequests,
      totalProposals,
      receivedProposals,
      pendingProposals,
      acceptedProposals,
      totalReviews,
      averageRating,
      recentRequests,
      recentProposals,
    };
  },
};
