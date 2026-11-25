'use client';

import Link from 'next/link';
import { HelpRequest } from '@/types/requests';
import { formatDate, levelLabels } from '@/lib/format';
import { Avatar, StatusBadge } from './UI';
import { Icon } from './Icons';

const levelStyles: Record<string, string> = {
  BEGINNER: 'bg-emerald-50 text-emerald-700',
  INTERMEDIATE: 'bg-amber-50 text-amber-800',
  ADVANCED: 'bg-rose-50 text-rose-700',
};

export const RequestCard = ({ request }: { request: HelpRequest }) => (
  <Link
    href={`/requests/${request.id}`}
    className="card card-hover flex h-full flex-col p-5 hover:no-underline"
  >
    <div className="mb-3 flex items-start justify-between gap-3">
      <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
        <Icon name="book" className="h-3.5 w-3.5" />
        {request.subject}
      </span>
      <StatusBadge status={request.status} />
    </div>

    <h3 className="line-clamp-2 text-base font-semibold text-slate-900">{request.title}</h3>
    <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-slate-600">{request.description}</p>

    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span
        className={`rounded-md px-2 py-1 text-xs font-medium ${levelStyles[request.requiredLevel]}`}
      >
        {levelLabels[request.requiredLevel]}
      </span>
      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
        <Icon name="chat" className="h-3.5 w-3.5" />
        {request._count?.proposals ?? 0} proposition
        {(request._count?.proposals ?? 0) > 1 ? 's' : ''}
      </span>
    </div>

    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
      <span className="flex items-center gap-2">
        <Avatar name={request.author?.fullName} className="h-6 w-6 text-[10px]" />
        {request.author?.fullName}
      </span>
      <time dateTime={request.createdAt}>{formatDate(request.createdAt)}</time>
    </div>
  </Link>
);
