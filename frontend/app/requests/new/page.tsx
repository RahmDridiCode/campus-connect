'use client';

import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AppShell } from '@/components/AppShell';
import { RequestForm, RequestFormPayload } from '@/components/RequestForm';
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
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Nouvelle demande d'aide</h1>
        <RequestForm submitLabel="Publier la demande" onSubmit={create} />
      </div>
    </AppShell>
  );
}
