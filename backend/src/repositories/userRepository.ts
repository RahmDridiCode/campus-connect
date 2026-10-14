import { PrismaClient, User } from '@prisma/client';
import { UserDTO } from '../types';

const prisma = new PrismaClient();

/**
 * Convertir User Prisma → DTO (sans password)
 */
const userToDTO = (user: User): UserDTO => {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    specialty: user.specialty || undefined,
    studyLevel: user.studyLevel as 'BACHELOR' | 'MASTER' | 'PHD',
    skills: user.skills,
    availabilities: user.availabilities,
    role: user.role as 'STUDENT' | 'ADMIN',
    bio: user.bio || undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const userRepository = {
  /**
   * Trouver utilisateur par email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  /**
   * Trouver utilisateur par ID (DTO)
   */
  async findByIdDTO(id: string): Promise<UserDTO | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user ? userToDTO(user) : null;
  },

  /**
   * Créer nouvel utilisateur
   */
  async create(data: {
    email: string;
    password: string;
    fullName: string;
    specialty?: string;
    studyLevel?: string;
  }): Promise<UserDTO> {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        specialty: data.specialty,
        studyLevel: (data.studyLevel as any) || 'BACHELOR',
        role: 'STUDENT', // Pas d'auto-attribution du rôle ADMIN
      },
    });
    return userToDTO(user);
  },

  /**
   * Mettre à jour le profil utilisateur
   */
  async update(
    id: string,
    data: {
      fullName?: string;
      specialty?: string;
      studyLevel?: string;
      bio?: string;
      skills?: string[];
      availabilities?: string[];
    },
  ): Promise<UserDTO> {
    const user = await prisma.user.update({
      where: { id },
      data: data as any,
    });
    return userToDTO(user);
  },

  /**
   * Trouver utilisateur public par ID (sans données sensibles)
   */
  async findPublicProfile(id: string): Promise<UserDTO | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user ? userToDTO(user) : null;
  },
};
