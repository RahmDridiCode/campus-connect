import { PrismaClient, Report, ReportStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface ReportDTO extends Report {
  reporter?: {
    id: string;
    fullName: string;
    email: string;
  };
  request?: {
    id: string;
    title: string;
    author: {
      id: string;
      fullName: string;
    };
  };
}

export const reportRepository = {
  /**
   * Créer un signalement
   */
  async create(data: {
    requestId: string;
    reporterId: string;
    reason: string;
    description?: string;
  }): Promise<ReportDTO> {
    return prisma.report.create({
      data,
      include: {
        reporter: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        request: {
          select: {
            id: true,
            title: true,
            author: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * Obtenir tous les signalements (paginas)
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: ReportDTO[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.report.findMany({
        skip,
        take: limit,
        include: {
          reporter: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          request: {
            select: {
              id: true,
              title: true,
              author: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.report.count(),
    ]);

    return { data, total };
  },

  /**
   * Obtenir un signalement par ID
   */
  async findById(id: string): Promise<ReportDTO | null> {
    return prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        request: {
          select: {
            id: true,
            title: true,
            description: true,
            author: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * Traiter un signalement PENDING dans une transaction :
   * - HIDE : masque la demande (hidden = true) et passe le signalement à REVIEWED
   * - DISMISS : passe le signalement à DISMISSED sans toucher à la demande
   * Retourne null si le signalement n'est plus PENDING (déjà traité).
   */
  async process(
    id: string,
    action: 'HIDE' | 'DISMISS',
    reviewerId: string,
    notes?: string,
  ): Promise<ReportDTO | null> {
    return prisma.$transaction(async tx => {
      // updateMany avec status: PENDING évite un double traitement concurrent
      const changed = await tx.report.updateMany({
        where: { id, status: 'PENDING' },
        data: {
          status: action === 'HIDE' ? 'REVIEWED' : 'DISMISSED',
          notes,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
        },
      });
      if (changed.count === 0) {
        return null;
      }

      const report = await tx.report.findUniqueOrThrow({
        where: { id },
        include: {
          reporter: { select: { id: true, fullName: true, email: true } },
          request: {
            select: {
              id: true,
              title: true,
              author: { select: { id: true, fullName: true } },
            },
          },
        },
      });

      if (action === 'HIDE') {
        await tx.helpRequest.update({
          where: { id: report.requestId },
          data: { hidden: true },
        });
      }
      return report;
    });
  },
};
