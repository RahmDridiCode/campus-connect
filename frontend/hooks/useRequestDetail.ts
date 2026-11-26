'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import { HelpRequest } from '@/types/requests';
import { Proposal, Review, errorMessage } from '@/types/app';

// Charge une demande ; propositions et avis seulement si l'utilisateur est connecté
export const useRequestDetail = (id: string, isLoggedIn: boolean) => {
  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const { data } = await api.get(`/requests/${id}`);
      setRequest(data.data);
      setError(null);
    } catch (err) {
      setError(errorMessage(err, 'Demande introuvable'));
      setLoading(false);
      return;
    }
    if (isLoggedIn) {
      const [p, r] = await Promise.allSettled([
        api.get(`/requests/${id}/proposals`),
        api.get(`/requests/${id}/reviews`),
      ]);
      if (p.status === 'fulfilled') setProposals(p.value.data.data);
      if (r.status === 'fulfilled') setReviews(r.value.data.data);
    }
    setLoading(false);
  }, [id, isLoggedIn]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { request, proposals, reviews, loading, error, setError, reload };
};
