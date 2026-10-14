import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/userRepository';
import { RegisterInput, LoginInput, AuthResponse, UserDTO } from '../types';
import { generateToken } from '../utils/jwt';
import { ValidationError, AuthenticationError, ConflictError } from '../utils/errors';

const BCRYPT_COST = 10;

export const authService = {
  /**
   * Enregistrer un nouvel utilisateur
   */
  async register(input: RegisterInput): Promise<UserDTO> {
    // Vérifier si l'email existe déjà
    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('Cet email est déjà utilisé');
    }

    // Vérifier que les mots de passe correspondent
    if (input.password !== input.confirmPassword) {
      throw new ValidationError('Les mots de passe ne correspondent pas');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(input.password, BCRYPT_COST);

    // Créer l'utilisateur : aucun JWT ici, l'utilisateur doit ensuite se connecter
    return userRepository.create({
      email: input.email,
      password: hashedPassword,
      fullName: input.fullName,
      specialty: input.specialty,
      studyLevel: input.studyLevel || 'BACHELOR',
    });
  },

  /**
   * Connexion utilisateur
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    // Trouver l'utilisateur par email
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AuthenticationError('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Email ou mot de passe incorrect');
    }

    // Convertir en DTO
    const userDTO: UserDTO = {
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

    // Générer JWT
    const token = generateToken({
      userId: userDTO.id,
      email: userDTO.email,
      role: userDTO.role,
    });

    return {
      user: userDTO,
      token,
    };
  },

  /**
   * Obtenir les données de l'utilisateur connecté
   */
  async getCurrentUser(userId: string): Promise<UserDTO> {
    const user = await userRepository.findByIdDTO(userId);
    if (!user) {
      throw new AuthenticationError('Utilisateur non trouvé');
    }
    return user;
  },
};
