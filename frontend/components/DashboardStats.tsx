import { DashboardData } from '@/types/app';
import { Icon, IconName } from './Icons';

const Stat = ({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: IconName;
  hint?: string;
}) => (
  <div className="card flex items-center gap-4 p-4 sm:p-5">
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
      <Icon name={icon} className="h-5 w-5" />
    </span>
    <div className="min-w-0">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="truncate text-sm text-slate-600">{label}</p>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  </div>
);

// Indicateurs calculés côté serveur à partir de la base de données
export const DashboardStats = ({ data }: { data: DashboardData }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <Stat icon="book" label="Demandes publiées" value={data.totalRequests} />
    <Stat icon="inbox" label="Demandes ouvertes" value={data.openRequests} />
    <Stat icon="chat" label="Propositions envoyées" value={data.totalProposals} />
    <Stat icon="users" label="Propositions reçues" value={data.receivedProposals} />
    <Stat icon="check" label="Séances réalisées" value={data.completedRequests} />
    <Stat
      icon="star"
      label="Note moyenne"
      value={data.averageRating ? `${data.averageRating.toFixed(1)} / 5` : '-'}
      hint={`${data.totalReviews} évaluation${data.totalReviews > 1 ? 's' : ''} reçue${data.totalReviews > 1 ? 's' : ''}`}
    />
  </div>
);
