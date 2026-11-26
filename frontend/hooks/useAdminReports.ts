'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import { Report, errorMessage } from '@/types/app';

// Signalements (administration)
export const useAdminReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const res = await api.get('/admin/reports', { params: { limit: 50 } });
      setReports(res.data.data);
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

  const handle = useCallback(
    async (id: string, action: 'HIDE' | 'DISMISS') => {
      try {
        await api.patch(`/admin/reports/${id}`, { action });
        await reload();
        return true;
      } catch (err) {
        setError(errorMessage(err));
        return false;
      }
    },
    [reload],
  );

  return { reports, loading, error, reload, handle };
};
