import axiosInstance from './api';
import { User, RegisterFormData, LoginFormData, ApiResponse, AuthResponse } from '@/types';

export const authAPI = {
  /**
   * Enregistrer un nouvel utilisateur
   */
  async register(data: RegisterFormData): Promise<{ user: User }> {
    const response = await axiosInstance.post<ApiResponse<{ user: User }>>('/auth/register', data);
    return response.data.data!;
  },

  /**
   * Connexion utilisateur
   */
  async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data!;
  },

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    await axiosInstance.post('/auth/logout');
  },

  /**
   * Obtenir les données de l'utilisateur connecté
   */
  async getMe(): Promise<User> {
    const response = await axiosInstance.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },

  /**
   * Obtenir le profil de l'utilisateur
   */
  async getProfile(): Promise<User> {
    const response = await axiosInstance.get<ApiResponse<User>>('/users/me');
    return response.data.data!;
  },

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await axiosInstance.patch<ApiResponse<User>>('/users/me', data);
    return response.data.data!;
  },

  /**
   * Obtenir le profil public d'un utilisateur
   */
  async getPublicProfile(userId: string): Promise<User> {
    const response = await axiosInstance.get<ApiResponse<User>>(`/users/${userId}`);
    return response.data.data!;
  },
};
