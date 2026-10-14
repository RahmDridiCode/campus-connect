import axiosInstance from './api';
import { ApiResponse } from '@/types';
import {
  HelpRequest,
  CreateRequestFormData,
  HelpRequestFilters,
  HelpRequestListResponse,
} from '@/types/requests';

export const requestsAPI = {
  /**
   * Lister les demandes avec filtres
   */
  async listRequests(filters?: HelpRequestFilters): Promise<HelpRequestListResponse> {
    const response = await axiosInstance.get('/requests', { params: filters });
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  /**
   * Créer une demande d'aide
   */
  async createRequest(data: CreateRequestFormData): Promise<HelpRequest> {
    const response = await axiosInstance.post<ApiResponse<HelpRequest>>('/requests', data);
    return response.data.data!;
  },

  /**
   * Obtenir une demande par ID
   */
  async getRequest(id: string): Promise<HelpRequest> {
    const response = await axiosInstance.get<ApiResponse<HelpRequest>>(`/requests/${id}`);
    return response.data.data!;
  },

  /**
   * Mettre à jour une demande
   */
  async updateRequest(id: string, data: Partial<CreateRequestFormData>): Promise<HelpRequest> {
    const response = await axiosInstance.patch<ApiResponse<HelpRequest>>(`/requests/${id}`, data);
    return response.data.data!;
  },

  /**
   * Supprimer une demande
   */
  async deleteRequest(id: string): Promise<void> {
    await axiosInstance.delete(`/requests/${id}`);
  },
};
