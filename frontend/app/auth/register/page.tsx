'use client';

import { RegisterForm } from '@/components/AuthForms';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">CampusConnect</h1>
        <h2 className="text-xl font-semibold text-center mb-6 text-gray-600">S'inscrire</h2>
        <RegisterForm />
      </div>
    </div>
  );
}
