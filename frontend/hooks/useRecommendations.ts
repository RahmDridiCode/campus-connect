'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Recommendation } from '@/types/app';

// Les recommandations ne sont chargées que si `enabled` est vrai (auteur d'une demande ouverte)
export const useRecommendations = (requestId: string, enabled: boolean) => {
  const [recos, setRecos] = useState<Recommendation[]>([]);

  useEffect(() => {
    if (!enabled) return;
    api
      .get(`/requests/${requestId}/recommendations`)
      .then((res) => setRecos(res.data.data))
      .catch(() => setRecos([]));
  }, [enabled, requestId]);

  return recos;
};
