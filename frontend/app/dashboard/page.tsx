'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/AppShell';
import { DashboardStats } from '@/components/DashboardStats';
import { ErrorState, LoadingState, StatusBadge, EmptyState } from '@/components/UI';
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
      <h1 className="text-3xl font-bold mb-6">Bonjour, {user?.fullName}</h1>

      {error && <ErrorState message={error} />}
      {!data && !error && <LoadingState />}

      {data && (
        <>
          <DashboardStats data={data} />

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <section className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold">Mes dernières demandes</h2>
                <Link href="/requests/new" className="text-sm">
                  + Nouvelle
                </Link>
              </div>
              {data.recentRequests.length === 0 ? (
                <EmptyState
                  title="Aucune demande"
                  description="Publiez votre première demande d'aide."
                />
              ) : (
                <ul className="divide-y">
                  {data.recentRequests.map((r) => (
                    <li key={r.id} className="py-2 flex justify-between gap-2">
                      <Link href={`/requests/${r.id}`}>{r.title}</Link>
                      <StatusBadge status={r.status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold">Mes dernières propositions</h2>
                <Link href="/proposals" className="text-sm">
                  Tout voir
                </Link>
              </div>
              {data.recentProposals.length === 0 ? (
                <EmptyState
                  title="Aucune proposition"
                  description="Parcourez les demandes pour aider un étudiant."
                />
              ) : (
                <ul className="divide-y">
                  {data.recentProposals.map((p) => (
                    <li key={p.id} className="py-2 flex justify-between gap-2">
                      <Link href={`/requests/${p.request.id}`}>{p.request.title}</Link>
                      <StatusBadge status={p.status} />
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
