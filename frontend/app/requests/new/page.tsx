'use client';

import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AppShell } from '@/components/AppShell';
import { RequestForm, RequestFormPayload } from '@/components/RequestForm';
import { PageHeader } from '@/components/UI';
import { errorMessage } from '@/types/app';

export default function NewRequestPage() {
  const router = useRouter();

  const create = async (data: RequestFormPayload) => {
    try {
      const res = await api.post('/requests', data);
      router.push(`/requests/${res.data.data.id}`);
    } catch (err) {
      throw new Error(errorMessage(err));
    }
  };

  return (
    <AppShell requireAuth>
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title="Nouvelle demande d'aide"
          description="Décrivez votre besoin pour que les autres étudiants puissent vous aider."
        />
        <div className="card p-5 sm:p-8">
          <RequestForm submitLabel="Publier la demande" onSubmit={create} />
        </div>
      </div>
    </AppShell>
  );
}
