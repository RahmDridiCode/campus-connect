/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { userRepository } from '../repositories/userRepository';
import { RegisterSchema, LoginSchema, UpdateProfileSchema } from '../validators/authValidator';
import { generateAuthCookie, generateLogoutCookie } from '../utils/jwt';

export const authController = {
  /**
   * Register - POST /api/v1/auth/register
   */
  async register(req: Request, res: Response) {
    // Valider les données
    const input = RegisterSchema.parse(req.body);

    // Appeler le service
    const user = await authService.register(input);

    // Pas de cookie ni de token : l'inscription ne connecte pas l'utilisateur
    res.status(201).json({
      success: true,
      data: { user },
      message: 'Compte créé avec succès. Connectez-vous pour continuer.',
    });
  },

  /**
   * Login - POST /api/v1/auth/login
   */
  async login(req: Request, res: Response) {
    // Valider les données
    const input = LoginSchema.parse(req.body);

    // Appeler le service
    const { user, token } = await authService.login(input);

    // Définir le cookie HttpOnly
    res.setHeader('Set-Cookie', generateAuthCookie(token));

    // Répondre
    res.status(200).json({
      success: true,
      data: {
        user,
        token,
      },
      message: 'Connexion réussie',
    });
  },

  /**
   * Logout - POST /api/v1/auth/logout
   */
  async logout(_req: Request, res: Response) {
    // Supprimer le cookie
    res.setHeader('Set-Cookie', generateLogoutCookie());

    // Répondre
    return res.status(200).json({
      success: true,
      message: 'Déconnexion réussie',
    });
  },

  /**
   * Get current user - GET /api/v1/auth/me
   */
  async me(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    const user = await authService.getCurrentUser(req.user.userId);

    return res.status(200).json({
      success: true,
      data: user,
    });
  },
};

export const usersController = {
  /**
   * Get current user profile - GET /api/v1/users/me
   */
  async getProfile(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    const user = await userRepository.findByIdDTO(req.user.userId);

    return res.status(200).json({
      success: true,
      data: user,
    });
  },

  /**
   * Update current user profile - PATCH /api/v1/users/me
   */
  async updateProfile(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    // Valider les données
    const input = UpdateProfileSchema.parse(req.body);

    // Mettre à jour
    const user = await userRepository.update(req.user.userId, input);

    return res.status(200).json({
      success: true,
      data: user,
      message: 'Profil mis à jour',
    });
  },

  /**
   * Get public user profile - GET /api/v1/users/:id
   */
  async getPublicProfile(req: Request, res: Response) {
    const { id } = req.params;

    const user = await userRepository.findPublicProfile(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  },
};
