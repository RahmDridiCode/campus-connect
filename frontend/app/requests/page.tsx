'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRequests } from '@/hooks/useRequests';
import { RequestCard } from '@/components/RequestCard';
import { AppShell } from '@/components/AppShell';
import { CardListSkeleton, EmptyState, PageHeader } from '@/components/UI';
import { Icon } from '@/components/Icons';
import { useAuth } from '@/hooks/useAuth';
import { HelpRequestFilters } from '@/types/requests';

function RequestsContent() {
  const { requests, pagination, isLoading, fetchRequests } = useRequests();
  const { isAuthenticated } = useAuth();
  const initialMine = useSearchParams().get('mine') === 'true';
  const [filters, setFilters] = useState<HelpRequestFilters>({
    page: 1,
    limit: 9,
    mine: initialMine ? 'true' : undefined,
  });

  useEffect(() => {
    fetchRequests(filters);
  }, [filters, fetchRequests]);

  const update = (patch: Partial<HelpRequestFilters>) =>
    setFilters({ ...filters, ...patch, page: 1 });

  const hasFilters = !!(
    filters.subject ||
    filters.requiredLevel ||
    filters.status ||
    filters.search ||
    filters.mine
  );

  return (
    <>
      <PageHeader
        title="Demandes d'aide"
        description={
          pagination.total > 0
            ? `${pagination.total} demande${pagination.total > 1 ? 's' : ''} trouvée${pagination.total > 1 ? 's' : ''}`
            : 'Trouvez une demande à laquelle vous pouvez répondre.'
        }
        actions={
          isAuthenticated ? (
            <Link href="/requests/new" className="btn-primary">
              <Icon name="plus" className="h-4 w-4" />
              Nouvelle demande
            </Link>
          ) : undefined
        }
      />

      <section aria-label="Filtres" className="card mb-6 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label htmlFor="f-search" className="label">
              Recherche
            </label>
            <div className="relative">
              <Icon
                name="search"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
              <input
                id="f-search"
                type="search"
                placeholder="Titre ou description"
                value={filters.search || ''}
                onChange={(e) => update({ search: e.target.value || undefined })}
                className="input pl-9"
              />
            </div>
          </div>
          <div>
            <label htmlFor="f-subject" className="label">
              Matière
            </label>
            <input
              id="f-subject"
              type="text"
              placeholder="Ex : Java"
              value={filters.subject || ''}
              onChange={(e) => update({ subject: e.target.value || undefined })}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="f-level" className="label">
              Niveau
            </label>
            <select
              id="f-level"
              value={filters.requiredLevel || ''}
              onChange={(e) => update({ requiredLevel: (e.target.value as any) || undefined })}
              className="input"
            >
              <option value="">Tous les niveaux</option>
              <option value="BEGINNER">Débutant</option>
              <option value="INTERMEDIATE">Intermédiaire</option>
              <option value="ADVANCED">Avancé</option>
            </select>
          </div>
          <div>
            <label htmlFor="f-status" className="label">
              Statut
            </label>
            <select
              id="f-status"
              value={filters.status || ''}
              onChange={(e) => update({ status: (e.target.value as any) || undefined })}
              className="input"
            >
              <option value="">Tous les statuts</option>
              <option value="OPEN">Ouverte</option>
              <option value="HELP_ACCEPTED">Aide acceptée</option>
              <option value="COMPLETED">Terminée</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {isAuthenticated ? (
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={filters.mine === 'true'}
                onChange={(e) => update({ mine: e.target.checked ? 'true' : undefined })}
                className="h-4 w-4 rounded border-slate-300 text-brand-600"
              />
              Mes demandes uniquement
            </label>
          ) : (
            <span />
          )}
          {hasFilters && (
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={() => setFilters({ page: 1, limit: 9 })}
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </section>

      {isLoading ? (
        <CardListSkeleton count={6} />
      ) : requests.length === 0 ? (
        <div className="card">
          <EmptyState
            iconName="search"
            title="Aucune demande ne correspond"
            description={
              hasFilters
                ? 'Essayez de modifier ou de réinitialiser vos filtres.'
                : "Aucune demande n'a encore été publiée."
            }
            action={
              isAuthenticated ? { label: 'Publier une demande', href: '/requests/new' } : undefined
            }
          />
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>

          {pagination.pages > 1 && (
            <nav aria-label="Pagination" className="flex flex-wrap justify-center gap-1.5">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setFilters({ ...filters, page })}
                  aria-current={page === pagination.page ? 'page' : undefined}
                  className={`min-h-[40px] min-w-[40px] rounded-lg px-3 text-sm font-medium ${
                    page === pagination.page
                      ? 'bg-brand-600 text-white'
                      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          )}
        </>
      )}
    </>
  );
}

export default function RequestsPage() {
  return (
    <AppShell>
      <Suspense fallback={<CardListSkeleton count={6} />}>
        <RequestsContent />
      </Suspense>
    </AppShell>
  );
}
