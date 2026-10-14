'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { AppShell } from '@/components/AppShell';
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
  Toast,
} from '@/components/UI';
import { Report, errorMessage } from '@/types/app';

const reasonLabels: Record<string, string> = {
  INAPPROPRIATE: 'Contenu inapproprié',
  SPAM: 'Spam',
  OTHER: 'Autre',
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pending, setPending] = useState<{ id: string; action: 'HIDE' | 'DISMISS' } | null>(null);

  const load = useCallback(async () => {
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
    load();
  }, [load]);

  const confirmAction = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      await api.patch(`/admin/reports/${pending.id}`, { action: pending.action });
      setToast(
        pending.action === 'HIDE'
          ? 'Publication masquée et signalement traité.'
          : 'Signalement rejeté.',
      );
      setPending(null);
      await load();
    } catch (err) {
      setError(errorMessage(err));
      setPending(null);
    } finally {
      setBusy(false);
    }
  };
  return (
    <AppShell requireAdmin>
      <h1 className="text-2xl font-bold mb-4">Signalements</h1>
      {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}
      {error && <ErrorState message={error} />}
      {loading ? (
        <LoadingState />
      ) : reports.length === 0 ? (
        <EmptyState title="Aucun signalement" description="Tout est calme." />
      ) : (
        <div className="grid gap-3">
          {reports.map((r) => (
            <article key={r.id} className="bg-white border rounded-lg p-4">
              <div className="flex justify-between gap-2">
                <h2 className="font-semibold">
                  {reasonLabels[r.reason] ?? r.reason} —{' '}
                  <Link href={`/requests/${r.requestId}`}>{r.request?.title}</Link>
                </h2>
                <StatusBadge status={r.status} />
              </div>
              <p className="text-sm text-gray-600">
                Signalé par {r.reporter?.fullName} — auteur de la demande :{' '}
                {r.request?.author.fullName}
              </p>
              {r.description && <p className="mt-2">{r.description}</p>}
              {r.status === 'PENDING' && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setPending({ id: r.id, action: 'HIDE' })}
                    className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                  >
                    Masquer et traiter
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setPending({ id: r.id, action: 'DISMISS' })}
                    className="border px-3 py-1 rounded disabled:opacity-50"
                  >
                    Rejeter le signalement
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      <ConfirmDialog
        isOpen={pending !== null}
        title={pending?.action === 'HIDE' ? 'Masquer et traiter ?' : 'Rejeter le signalement ?'}
        message={
          pending?.action === 'HIDE'
            ? 'La demande sera masquée pour les étudiants et le signalement marqué comme examiné.'
            : 'Le signalement sera rejeté et la demande restera inchangée.'
        }
        isLoading={busy}
        onConfirm={confirmAction}
        onCancel={() => setPending(null)}
      />
    </AppShell>
  );
}
