'use client';

import { Proposal } from '@/types/app';
import { formatDate } from '@/lib/format';
import { Avatar, Button, StatusBadge } from './UI';
import { Icon } from './Icons';

interface Props {
  proposal: Proposal;
  // Boutons Accepter / Refuser : affichés seulement à l'auteur de la demande
  canDecide?: boolean;
  busy?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

// Une bordure colorée à gauche rend le statut visible d'un coup d'œil
const accent: Record<string, string> = {
  PENDING: 'border-l-amber-400',
  ACCEPTED: 'border-l-emerald-500',
  REJECTED: 'border-l-rose-400 opacity-80',
};

export const ProposalCard = ({ proposal, canDecide, busy, onAccept, onReject }: Props) => (
  <article className={`card border-l-4 p-4 sm:p-5 ${accent[proposal.status] ?? ''}`}>
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <Avatar name={proposal.proposer?.fullName} />
        <div>
          <h3 className="font-semibold text-slate-900">
            {proposal.proposer?.fullName ?? 'Étudiant'}
          </h3>
          {proposal.request && (
            <p className="text-sm text-slate-600">Demande : {proposal.request.title}</p>
          )}
        </div>
      </div>
      <StatusBadge status={proposal.status} />
    </div>

    <p className="whitespace-pre-line text-sm text-slate-700">{proposal.message}</p>

    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
      <span className="inline-flex items-center gap-1">
        <Icon name="calendar" className="h-3.5 w-3.5" />
        {proposal.availabilities.join(', ')}
      </span>
      <span className="inline-flex items-center gap-1">
        <Icon name="clock" className="h-3.5 w-3.5" />
        {formatDate(proposal.createdAt)}
      </span>
    </div>

    {canDecide && proposal.status === 'PENDING' && (
      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <Button variant="success" size="sm" disabled={busy} onClick={() => onAccept?.(proposal.id)}>
          <Icon name="check" className="h-4 w-4" />
          Accepter
        </Button>
        <Button
          variant="danger-outline"
          size="sm"
          disabled={busy}
          onClick={() => onReject?.(proposal.id)}
        >
          Refuser
        </Button>
      </div>
    )}
  </article>
);
