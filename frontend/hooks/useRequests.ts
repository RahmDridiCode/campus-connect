'use client';

import { useState, useCallback } from 'react';
import {
  HelpRequest,
  HelpRequestFilters,
  HelpRequestListResponse,
  CreateRequestFormData,
} from '@/types/requests';
import { requestsAPI } from '@/lib/requests';

export const useRequests = () => {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async (filters?: HelpRequestFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await requestsAPI.listRequests(filters);
      setRequests(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRequest = useCallback(async (data: CreateRequestFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      const newRequest = await requestsAPI.createRequest(data);
      setRequests((prev) => [newRequest, ...prev]);
      return newRequest;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur de création';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    requests,
    pagination,
    isLoading,
    error,
    fetchRequests,
    createRequest,
  };
};

export const useRequest = (id: string) => {
  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequest = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await requestsAPI.getRequest(id);
      setRequest(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const updateRequest = useCallback(
    async (data: Partial<CreateRequestFormData>) => {
      try {
        setIsLoading(true);
        setError(null);
        const updated = await requestsAPI.updateRequest(id, data);
        setRequest(updated);
        return updated;
      } catch (err: any) {
        const message = err.response?.data?.message || 'Erreur de mise à jour';
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [id],
  );

  const deleteRequest = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await requestsAPI.deleteRequest(id);
      setRequest(null);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur de suppression';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return {
    request,
    isLoading,
    error,
    fetchRequest,
    updateRequest,
    deleteRequest,
  };
};
