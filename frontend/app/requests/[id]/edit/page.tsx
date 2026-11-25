'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AppShell } from '@/components/AppShell';
import { RequestForm, RequestFormPayload } from '@/components/RequestForm';
import { ErrorState, LoadingState, PageHeader } from '@/components/UI';
import { HelpRequest } from '@/types/requests';
import { errorMessage } from '@/types/app';

export default function EditRequestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get(`/requests/${id}`)
      .then((res) => setRequest(res.data.data))
      .catch((err) => setError(errorMessage(err, 'Demande introuvable')));
  }, [id]);

  const update = async (data: RequestFormPayload) => {
    try {
      await api.patch(`/requests/${id}`, data);
      router.push(`/requests/${id}`);
    } catch (err) {
      throw new Error(errorMessage(err));
    }
  };

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
