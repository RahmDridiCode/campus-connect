'use client';

import { useMemo } from 'react';
import api from '@/lib/api';

// Appels API d'écriture liés à une demande (propositions, avis, signalement, cycle de vie)
export const useRequestActions = (requestId: string) =>
  useMemo(
    () => ({
      sendProposal: (message: string, availabilities: string[]) =>
        api.post(`/requests/${requestId}/proposals`, { message, availabilities }),
      decideProposal: (proposalId: string, action: 'accept' | 'reject') =>
        api.patch(`/proposals/${proposalId}/${action}`),
      sendReview: (targetId: string | undefined, rating: number, comment?: string) =>
        api.post(`/requests/${requestId}/reviews`, {
          targetId,
          rating,
          comment: comment || undefined,
        }),
      sendReport: (reason: string, description?: string) =>
        api.post('/reports', { requestId, reason, description: description || undefined }),
      complete: () => api.post(`/requests/${requestId}/complete`),
      remove: () => api.delete(`/requests/${requestId}`),
    }),
    [requestId],
  );
