import { DashboardData } from '@/types/app';

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="bg-white rounded-lg shadow p-4 text-center">
    <p className="text-3xl font-bold text-blue-700">{value}</p>
    <p className="text-sm text-gray-600 mt-1">{label}</p>
  </div>
);

// Indicateurs calculés côté serveur à partir de la base de données
export const DashboardStats = ({ data }: { data: DashboardData }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    <Stat label="Demandes publiées" value={data.totalRequests} />
    <Stat label="Demandes ouvertes" value={data.openRequests} />
    <Stat label="Propositions envoyées" value={data.totalProposals} />
    <Stat label="Propositions reçues" value={data.receivedProposals} />
    <Stat label="Séances réalisées" value={data.completedRequests} />
    <Stat
      label={`Évaluations reçues (${data.totalReviews})`}
      value={data.averageRating ? `${data.averageRating.toFixed(1)} / 5` : '-'}
    />
  </div>
);
