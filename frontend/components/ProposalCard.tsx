'use client';

import { Proposal } from '@/types/app';
import { StatusBadge } from './UI';

interface Props {
  proposal: Proposal;
  // Boutons Accepter / Refuser : affichés seulement à l'auteur de la demande
  canDecide?: boolean;
  busy?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

export const ProposalCard = ({ proposal, canDecide, busy, onAccept, onReject }: Props) => (
  <article className="bg-white border rounded-lg p-4 shadow-sm">
    <div className="flex justify-between items-start gap-2 mb-2">
      <div>
        <h3 className="font-semibold">{proposal.proposer?.fullName ?? 'Étudiant'}</h3>
        {proposal.request && (
          <p className="text-sm text-gray-600">Demande : {proposal.request.title}</p>
        )}
      </div>
      <StatusBadge status={proposal.status} />
    </div>
    <p className="text-gray-700 mb-2">{proposal.message}</p>
    <p className="text-sm text-gray-500">Disponibilités : {proposal.availabilities.join(', ')}</p>

    {canDecide && proposal.status === 'PENDING' && (
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => onAccept?.(proposal.id)}
          className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
        >
          Accepter
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onReject?.(proposal.id)}
          className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
        >
          Refuser
        </button>
      </div>
    )}
  </article>
);
