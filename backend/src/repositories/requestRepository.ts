import { PrismaClient, HelpRequest, Prisma } from '@prisma/client';
import { HelpRequestFilterInput } from '../validators/requestValidator';

const prisma = new PrismaClient();

export interface HelpRequestDTO extends HelpRequest {
  author?: {
    id: string;
    email: string;
    fullName: string;
    skills: string[];
  };
  _count?: {
    proposals: number;
    reviews: number;
  };
}

export const requestRepository = {
  /**
   * Créer une demande d'aide
   */
  async create(data: {
    title: string;
    description: string;
    subject: string;
    requiredLevel: string;
    authorId: string;
    availabilities: string[];
  }): Promise<HelpRequestDTO> {
    return prisma.helpRequest.create({
      data: {
        title: data.title,
        description: data.description,
        subject: data.subject,
        requiredLevel: data.requiredLevel as any,
        authorId: data.authorId,
        availabilities: data.availabilities,
        status: 'OPEN',
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            fullName: true,
            skills: true,
          },
        },
        _count: {
          select: {
            proposals: true,
            reviews: true,
          },
        },
      },
    });
  },

  /**
   * Obtenir une demande par ID
   */
  async findById(id: string): Promise<HelpRequestDTO | null> {
    return prisma.helpRequest.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            fullName: true,
            skills: true,
          },
        },
        _count: {
          select: {
            proposals: true,
            reviews: true,
          },
        },
      },
    });
  },

  /**
   * Lister les demandes avec filtres et pagination
   */
  async findMany(
    filters: HelpRequestFilterInput,
    authorId?: string,
  ): Promise<{
    data: HelpRequestDTO[];
    total: number;
    page: number;
    pages: number;
  }> {
    const skip = (filters.page - 1) * filters.limit;

    // Construire les conditions de filtrage
    const where: Prisma.HelpRequestWhereInput = { hidden: false };
    if (authorId) {
      where.authorId = authorId;
    }

    if (filters.status) {
      where.status = filters.status as any;
    }

    if (filters.requiredLevel) {
      where.requiredLevel = filters.requiredLevel as any;
    }

    if (filters.subject) {
      where.subject = {
        contains: filters.subject,
        mode: 'insensitive',
      };
    }

    if (filters.search) {
      where.OR = [
        {
          title: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.helpRequest.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              fullName: true,
              skills: true,
            },
          },
          _count: {
            select: {
              proposals: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.helpRequest.count({ where }),
    ]);

    return {
      data,
      total,
      page: filters.page,
      pages: Math.ceil(total / filters.limit),
    };
  },

  /**
   * Mettre à jour une demande
   */
  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      subject?: string;
      requiredLevel?: string;
      availabilities?: string[];
    },
  ): Promise<HelpRequestDTO> {
    return prisma.helpRequest.update({
      where: { id },
      data: data as any,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            fullName: true,
            skills: true,
          },
        },
        _count: {
          select: {
            proposals: true,
            reviews: true,
          },
        },
      },
    });
  },

  /**
   * Mettre à jour le statut d'une demande
   */
  async updateStatus(
    id: string,
    status: 'OPEN' | 'HELP_ACCEPTED' | 'COMPLETED',
  ): Promise<HelpRequestDTO> {
    return prisma.helpRequest.update({
      where: { id },
      data: { status: status as any },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            fullName: true,
            skills: true,
          },
        },
        _count: {
          select: {
            proposals: true,
            reviews: true,
          },
        },
      },
    });
  },

  /**
   * Supprimer une demande
   */
  async delete(id: string): Promise<void> {
    await prisma.helpRequest.delete({
      where: { id },
    });
  },
};
