'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { RequestFormPayload } from '@/components/RequestForm';
import { errorMessage } from '@/types/app';

// Création / modification d'une demande depuis le formulaire, puis redirection vers la demande
export const useRequestForm = () => {
  const router = useRouter();

  const create = useCallback(
    async (data: RequestFormPayload) => {
      try {
        const res = await api.post('/requests', data);
        router.push(`/requests/${res.data.data.id}`);
      } catch (err) {
        throw new Error(errorMessage(err));
      }
    },
    [router],
  );

  const update = useCallback(
    async (id: string, data: RequestFormPayload) => {
      try {
        await api.patch(`/requests/${id}`, data);
        router.push(`/requests/${id}`);
      } catch (err) {
        throw new Error(errorMessage(err));
      }
    },
    [router],
  );

  return { create, update };
};
