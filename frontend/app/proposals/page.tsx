'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { ProposalCard } from '@/components/ProposalCard';
import {
  CardListSkeleton,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeader,
  Toast,
} from '@/components/UI';
import { Icon } from '@/components/Icons';
import { useMyProposals } from '@/hooks/useMyProposals';

export default function ProposalsPage() {
  const { sent, received, loading, error, decide: decideProposal } = useMyProposals();
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ id: string; action: 'accept' | 'reject' } | null>(null);

  const decide = async (id: string, action: 'accept' | 'reject') => {
    setBusy(true);
    if (await decideProposal(id, action)) {
      setToast(action === 'accept' ? 'Proposition acceptée' : 'Proposition refusée');
    }
    setBusy(false);
  };

  const list = tab === 'received' ? received : sent;
  const pendingReceived = received.filter((p) => p.status === 'PENDING').length;

  return (
    <AppShell requireAuth>
      <PageHeader
        title="Mes propositions"
        description="Suivez les propositions reçues sur vos demandes et celles que vous avez envoyées."
      />
      {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}

      <div
        className="mb-5 inline-flex rounded-lg bg-slate-200/70 p-1"
        role="tablist"
        aria-label="Type de propositions"
      >
        {(['received', 'sent'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`min-h-[40px] rounded-md px-4 text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t === 'received' ? `Reçues (${received.length})` : `Envoyées (${sent.length})`}
          </button>
        ))}
      </div>

      {tab === 'received' && pendingReceived > 0 && (
        <p className="alert-info mb-4">
          {pendingReceived} proposition{pendingReceived > 1 ? 's' : ''} en attente de votre
          décision.
        </p>
      )}

      {error && <ErrorState message={error} />}
      {loading ? (
        <CardListSkeleton count={2} />
      ) : list.length === 0 ? (
        <div className="card">
          <EmptyState
            title="Aucune proposition"
            description={
              tab === 'received'
                ? "Personne n'a encore proposé son aide."
                : "Vous n'avez pas encore proposé votre aide."
            }
            action={
              tab === 'sent'
                ? { label: 'Parcourir les demandes', href: '/requests' }
                : { label: 'Voir mes demandes', href: '/requests?mine=true' }
            }
          />
        </div>
      ) : (
        <div className="grid gap-4">
          {list.map((p) => (
            <div key={p.id}>
              <ProposalCard
                proposal={p}
                canDecide={tab === 'received'}
                busy={busy}
                onAccept={(pid) => setConfirm({ id: pid, action: 'accept' })}
                onReject={(pid) => setConfirm({ id: pid, action: 'reject' })}
              />
              <Link
                href={`/requests/${p.requestId}`}
                className="link mt-1.5 inline-flex items-center gap-1 px-1 text-sm"
              >
                Voir la demande <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        isOpen={confirm !== null}
        title={
          confirm?.action === 'accept'
            ? 'Accepter cette proposition ?'
            : 'Refuser cette proposition ?'
        }
        message={
          confirm?.action === 'accept'
            ? 'La demande passera à « Aide acceptée » et les autres propositions en attente seront refusées.'
            : 'Le proposant sera informé du refus.'
        }
        confirmLabel={confirm?.action === 'accept' ? 'Accepter' : 'Refuser'}
        tone={confirm?.action === 'accept' ? 'primary' : 'danger'}
        isLoading={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          if (!confirm) return;
          await decide(confirm.id, confirm.action);
          setConfirm(null);
        }}
      />
    </AppShell>
  );
}
