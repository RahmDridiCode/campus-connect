'use client';

import { HelpRequest } from '@/types/requests';
import Link from 'next/link';

interface RequestCardProps {
  request: HelpRequest;
}

export const RequestCard = ({ request }: RequestCardProps) => {
  const levelColors = {
    BEGINNER: 'bg-green-100 text-green-800',
    INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
    ADVANCED: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    OPEN: 'bg-blue-100 text-blue-800',
    HELP_ACCEPTED: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
  };

  const statusLabels = {
    OPEN: 'Ouverte',
    HELP_ACCEPTED: 'Aide acceptée',
    COMPLETED: 'Terminée',
  };

  return (
    <Link href={`/requests/${request.id}`}>
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border border-gray-200">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-gray-800 flex-1">{request.title}</h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              statusColors[request.status]
            }`}
          >
            {statusLabels[request.status]}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{request.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-gray-100 px-3 py-1 rounded text-sm">📚 {request.subject}</span>
          <span
            className={`px-3 py-1 rounded text-xs font-semibold ${
              levelColors[request.requiredLevel]
            }`}
          >
            {request.requiredLevel === 'BEGINNER'
              ? 'Débutant'
              : request.requiredLevel === 'INTERMEDIATE'
                ? 'Intermédiaire'
                : 'Avancé'}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>👤 {request.author?.fullName}</span>
          <span>💬 {request._count?.proposals || 0} propositions</span>
        </div>
      </div>
    </Link>
  );
};
