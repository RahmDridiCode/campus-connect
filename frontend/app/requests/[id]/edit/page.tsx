'use client';

import { useParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { RequestForm, RequestFormPayload } from '@/components/RequestForm';
import { ErrorState, LoadingState, PageHeader } from '@/components/UI';
import { useRequestDetail } from '@/hooks/useRequestDetail';
import { useRequestForm } from '@/hooks/useRequestForm';

export default function EditRequestPage() {
  const { id } = useParams<{ id: string }>();
  const { request, error } = useRequestDetail(id, false);
  const { update: save } = useRequestForm();

  const update = (data: RequestFormPayload) => save(id, data);

  return (
    <AppShell requireAuth>
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Modifier la demande" />
        <div className="card p-5 sm:p-8">
          {error ? (
            <ErrorState message={error} />
          ) : !request ? (
            <LoadingState />
          ) : (
            <RequestForm initial={request} submitLabel="Enregistrer" onSubmit={update} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
