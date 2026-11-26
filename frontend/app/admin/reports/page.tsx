'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import {
  Avatar,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
  StatusBadge,
  Toast,
} from '@/components/UI';
import { Icon } from '@/components/Icons';
import { formatDate } from '@/lib/format';
import { Report } from '@/types/app';
import { useAdminReports } from '@/hooks/useAdminReports';

const reasonLabels: Record<string, string> = {
  INAPPROPRIATE: 'Contenu inapproprié',
  SPAM: 'Spam',
  OTHER: 'Autre',
};

type Filter = 'ALL' | Report['status'];
const filters: { value: Filter; label: string }[] = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'REVIEWED', label: 'Traités' },
  { value: 'DISMISSED', label: 'Rejetés' },
  { value: 'ALL', label: 'Tous' },
];

export default function AdminReportsPage() {
  const { reports, loading, error, reload: load, handle } = useAdminReports();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('PENDING');
  const [pending, setPending] = useState<{ id: string; action: 'HIDE' | 'DISMISS' } | null>(null);

  const confirmAction = async () => {
    if (!pending) return;
    setBusy(true);
    if (await handle(pending.id, pending.action)) {
      setToast(
        pending.action === 'HIDE'
          ? 'Publication masquée et signalement traité.'
          : 'Signalement rejeté.',
      );
    }
    setPending(null);
    setBusy(false);
  };

  const counts = useMemo(
    () => ({
      ALL: reports.length,
      PENDING: reports.filter((r) => r.status === 'PENDING').length,
      REVIEWED: reports.filter((r) => r.status === 'REVIEWED').length,
      DISMISSED: reports.filter((r) => r.status === 'DISMISSED').length,
    }),
    [reports],
  );
  const visible = filter === 'ALL' ? reports : reports.filter((r) => r.status === filter);

  return (
    <AppShell requireAdmin>
      <PageHeader
        title="Signalements"
        description="Examinez les publications signalées par les étudiants."
        actions={
          counts.PENDING > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">
              <Icon name="shield" className="h-4 w-4" />
              {counts.PENDING} à traiter
            </span>
          )
        }
      />
      {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}
      {error && (
        <div className="mb-4">
          <ErrorState message={error} onRetry={load} />
        </div>
      )}

      <div
        className="mb-5 inline-flex max-w-full overflow-x-auto rounded-lg bg-slate-200/70 p-1"
        role="tablist"
        aria-label="Filtrer par statut"
      >
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`min-h-[40px] whitespace-nowrap rounded-md px-4 text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {f.label} ({counts[f.value]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3" role="status" aria-label="Chargement">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card space-y-3 p-5">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-9 w-48" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="card">
          <EmptyState
            iconName="shield"
            title="Aucun signalement"
            description={
              filter === 'PENDING'
                ? 'Tout est calme : aucun signalement en attente.'
                : 'Aucun signalement dans cette catégorie.'
            }
          />
        </div>
      ) : (
        <div className="grid gap-4">
          {visible.map((r) => (
            <article
              key={r.id}
              className={`card border-l-4 p-5 ${
                r.status === 'PENDING'
                  ? 'border-l-amber-400'
                  : r.status === 'REVIEWED'
                    ? 'border-l-brand-500'
                    : 'border-l-slate-300'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="mb-1 inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                    <Icon name="flag" className="h-3.5 w-3.5" />
                    {reasonLabels[r.reason] ?? r.reason}
                  </span>
                  <h2 className="text-base font-semibold">
                    <Link
                      href={`/requests/${r.requestId}`}
                      className="text-slate-900 hover:text-brand-700"
                    >
                      {r.request?.title ?? 'Demande supprimée'}
                    </Link>
                  </h2>
                </div>
                <StatusBadge status={r.status} />
              </div>

              {r.description && (
                <blockquote className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  {r.description}
                </blockquote>
              )}

              <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Avatar name={r.reporter?.fullName} className="h-7 w-7 text-xs" />
                  <div>
                    <dt className="text-xs text-slate-500">Signalé par</dt>
                    <dd className="font-medium">{r.reporter?.fullName}</dd>
                  </div>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Auteur de la demande</dt>
                  <dd className="font-medium">{r.request?.author.fullName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Date</dt>
                  <dd className="font-medium">{formatDate(r.createdAt)}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                <Link href={`/requests/${r.requestId}`} className="btn-secondary btn-sm">
                  <Icon name="eye" className="h-4 w-4" />
                  Consulter la demande
                </Link>
                {r.status === 'PENDING' && (
                  <>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={busy}
                      onClick={() => setPending({ id: r.id, action: 'HIDE' })}
                    >
                      Masquer et traiter
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={busy}
                      onClick={() => setPending({ id: r.id, action: 'DISMISS' })}
                    >
                      Rejeter le signalement
                    </Button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={pending !== null}
        title={pending?.action === 'HIDE' ? 'Masquer et traiter ?' : 'Rejeter le signalement ?'}
        message={
          pending?.action === 'HIDE'
            ? 'La demande sera masquée pour les étudiants et le signalement marqué comme traité.'
            : 'Le signalement sera rejeté et la demande restera inchangée.'
        }
        confirmLabel={pending?.action === 'HIDE' ? 'Masquer et traiter' : 'Rejeter'}
        tone={pending?.action === 'HIDE' ? 'danger' : 'primary'}
        isLoading={busy}
        onConfirm={confirmAction}
        onCancel={() => setPending(null)}
      />
    </AppShell>
  );
}
