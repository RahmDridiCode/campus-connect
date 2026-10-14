'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { AppShell } from '@/components/AppShell';
import { ProposalCard } from '@/components/ProposalCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/UI';
import { Proposal, errorMessage } from '@/types/app';

export default function ProposalsPage() {
  const [sent, setSent] = useState<Proposal[]>([]);
  const [received, setReceived] = useState<Proposal[]>([]);
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
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
    load();
  }, [load]);

  const decide = async (id: string, action: 'accept' | 'reject') => {
    setBusy(true);
    try {
      await api.patch(`/proposals/${id}/${action}`);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const list = tab === 'received' ? received : sent;

  return (
    <AppShell requireAuth>
      <h1 className="text-2xl font-bold mb-4">Mes propositions</h1>
      <div className="flex gap-2 mb-4" role="tablist">
        {(['received', 'sent'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded ${tab === t ? 'bg-blue-600 text-white' : 'bg-white border'}`}
          >
            {t === 'received' ? `Reçues (${received.length})` : `Envoyées (${sent.length})`}
          </button>
        ))}
      </div>

      {error && <ErrorState message={error} />}
      {loading ? (
        <LoadingState />
      ) : list.length === 0 ? (
        <EmptyState
          title="Aucune proposition"
          description={
            tab === 'received'
              ? "Personne n'a encore proposé son aide."
              : "Vous n'avez pas encore proposé votre aide."
          }
        />
      ) : (
        <div className="grid gap-3">
          {list.map((p) => (
            <div key={p.id}>
              <ProposalCard
                proposal={p}
                canDecide={tab === 'received'}
                busy={busy}
                onAccept={(pid) => decide(pid, 'accept')}
                onReject={(pid) => decide(pid, 'reject')}
              />
              <Link href={`/requests/${p.requestId}`} className="text-sm">
                Voir la demande →
              </Link>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
