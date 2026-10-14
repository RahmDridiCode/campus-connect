'use client';

import { useRequests } from '@/hooks/useRequests';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RequestCard } from '@/components/RequestCard';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/hooks/useAuth';
import { HelpRequestFilters } from '@/types/requests';

export default function RequestsPage() {
  const { requests, pagination, isLoading, fetchRequests } = useRequests();
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState<HelpRequestFilters>({
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    fetchRequests(filters);
  }, [filters, fetchRequests]);

  return (
    <AppShell>
      <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold">Demandes d'aide</h1>
        <Link
          href="/requests/new"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Nouvelle demande
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">🔍 Filtres</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Matière</label>
            <input
              type="text"
              placeholder="Ex: Java"
              value={filters.subject || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  subject: e.target.value || undefined,
                  page: 1,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Niveau</label>
            <select
              value={filters.requiredLevel || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  requiredLevel: (e.target.value as any) || undefined,
                  page: 1,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="">Tous les niveaux</option>
              <option value="BEGINNER">Débutant</option>
              <option value="INTERMEDIATE">Intermédiaire</option>
              <option value="ADVANCED">Avancé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Statut</label>
            <select
              value={filters.status || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: (e.target.value as any) || undefined,
                  page: 1,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="">Tous les statuts</option>
              <option value="OPEN">Ouverte</option>
              <option value="HELP_ACCEPTED">Aide acceptée</option>
              <option value="COMPLETED">Terminée</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Recherche</label>
            <input
              type="text"
              placeholder="Titre ou description"
              value={filters.search || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  search: e.target.value || undefined,
                  page: 1,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          {isAuthenticated && (
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={filters.mine === 'true'}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      mine: e.target.checked ? 'true' : undefined,
                      page: 1,
                    })
                  }
                />
                Mes demandes uniquement
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-lg">⏳ Chargement...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Aucune demande trouvée</p>
          <Link href="/requests/new" className="mt-4 inline-block text-blue-600 hover:underline">
            Créer une demande →
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-6 mb-8">
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setFilters({ ...filters, page })}
                  className={`px-3 py-2 rounded ${
                    page === pagination.page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
