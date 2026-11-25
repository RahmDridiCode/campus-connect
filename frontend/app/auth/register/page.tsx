'use client';

import { AuthLayout } from '@/components/AuthLayout';
import { RegisterForm } from '@/components/AuthForms';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Rejoignez la communauté d'entraide de votre campus."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
