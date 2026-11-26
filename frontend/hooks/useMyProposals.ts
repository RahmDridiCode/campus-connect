'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import { Proposal, errorMessage } from '@/types/app';

// Propositions envoyées et reçues par l'utilisateur connecté
export const useMyProposals = () => {
  const [sent, setSent] = useState<Proposal[]>([]);
  const [received, setReceived] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const res = await api.get('/proposals/mine');
      setSent(res.data.data.sent);
      setReceived(res.data.data.received);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const decide = useCallback(
    async (id: string, action: 'accept' | 'reject') => {
      try {
        await api.patch(`/proposals/${id}/${action}`);
        await reload();
        return true;
      } catch (err) {
        setError(errorMessage(err));
        return false;
      }
    },
    [reload],
  );

  return { sent, received, loading, error, reload, decide };
};
