'use client';

import { AppShell } from '@/components/AppShell';
import { RequestForm } from '@/components/RequestForm';
import { PageHeader } from '@/components/UI';
import { useRequestForm } from '@/hooks/useRequestForm';

export default function NewRequestPage() {
  const { create } = useRequestForm();

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
