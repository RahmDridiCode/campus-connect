'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/AppShell';
import { DashboardStats } from '@/components/DashboardStats';
import { CardListSkeleton, EmptyState, ErrorState, PageHeader, StatusBadge } from '@/components/UI';
import { Icon } from '@/components/Icons';
import { formatDate } from '@/lib/format';
import { DashboardData, errorMessage } from '@/types/app';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    api
      .get('/dashboard')
      .then((res) => setData(res.data.data))
      .catch((err) => setError(errorMessage(err)));
  }, [user]);

  return (
    <AppShell requireAuth>
      <PageHeader
        title={`Bonjour, ${user?.fullName?.split(' ')[0] ?? ''}`}
        description="Voici un aperçu de votre activité sur CampusConnect."
        actions={
          <>
            <Link href="/requests" className="btn-secondary">
              <Icon name="search" className="h-4 w-4" />
              Parcourir
            </Link>
            <Link href="/requests/new" className="btn-primary">
              <Icon name="plus" className="h-4 w-4" />
              Nouvelle demande
            </Link>
          </>
        }
      />

      {error && <ErrorState message={error} />}
      {!data && !error && <CardListSkeleton count={6} />}

      {data && (
        <>
          {data.receivedProposals > 0 && (
            <Link
              href="/proposals"
              className="alert-info mb-6 flex items-center justify-between gap-3 hover:no-underline"
            >
              <span>
                Vous avez reçu <strong>{data.receivedProposals}</strong> proposition
                {data.receivedProposals > 1 ? 's' : ''} d'aide.
              </span>
              <span className="inline-flex items-center gap-1 font-medium">
                Consulter <Icon name="arrowRight" className="h-4 w-4" />
              </span>
            </Link>
          )}

          <DashboardStats data={data} />

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="card p-5" aria-labelledby="dr">
              <div className="mb-3 flex items-center justify-between">
                <h2 id="dr" className="text-lg font-semibold">
                  Mes dernières demandes
                </h2>
                <Link href="/requests?mine=true" className="link text-sm">
                  Tout voir
                </Link>
              </div>
              {data.recentRequests.length === 0 ? (
                <EmptyState
                  title="Aucune demande"
                  description="Publiez votre première demande d'aide."
                  action={{ label: 'Publier une demande', href: '/requests/new' }}
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {data.recentRequests.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/requests/${r.id}`}
                        className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 text-slate-800 hover:bg-slate-50 hover:no-underline"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{r.title}</span>
                          <span className="text-xs text-slate-500">{formatDate(r.createdAt)}</span>
                        </span>
                        <StatusBadge status={r.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card p-5" aria-labelledby="dp">
              <div className="mb-3 flex items-center justify-between">
                <h2 id="dp" className="text-lg font-semibold">
                  Mes dernières propositions
                </h2>
                <Link href="/proposals" className="link text-sm">
                  Tout voir
                </Link>
              </div>
              {data.recentProposals.length === 0 ? (
                <EmptyState
                  title="Aucune proposition"
                  description="Parcourez les demandes pour aider un étudiant."
                  action={{ label: 'Parcourir les demandes', href: '/requests' }}
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {data.recentProposals.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/requests/${p.request.id}`}
                        className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 text-slate-800 hover:bg-slate-50 hover:no-underline"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{p.request.title}</span>
                          <span className="text-xs text-slate-500">{formatDate(p.createdAt)}</span>
                        </span>
                        <StatusBadge status={p.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </AppShell>
  );
}
