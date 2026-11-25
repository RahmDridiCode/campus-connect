'use client';

import { Suspense } from 'react';
import { AuthLayout } from '@/components/AuthLayout';
import { LoginForm } from '@/components/AuthForms';

export default function LoginPage() {
  return (
    <AuthLayout title="Bon retour !" subtitle="Connectez-vous pour accéder à votre espace.">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
