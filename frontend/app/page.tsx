'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md p-4">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">CampusConnect</h1>
          <div className="space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-600">Bienvenue, {user?.fullName}</span>
                <Link
                  href="/dashboard"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Tableau de bord
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-blue-600 hover:underline">
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-800 mb-6">Bienvenue sur CampusConnect</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          La plateforme d'entraide entre étudiants. Publiez des demandes d'aide, proposez vos
          compétences et évaluez vos séances de révision.
        </p>

        {!isAuthenticated && (
          <div className="space-x-4">
            <Link
              href="/auth/register"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
            >
              S'inscrire maintenant
            </Link>
            <Link
              href="/auth/login"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg border-2 border-blue-600 hover:bg-blue-50 inline-block"
            >
              Se connecter
            </Link>
          </div>
        )}

        {isAuthenticated && (
          <Link
            href="/dashboard"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-block"
          >
            Accéder au tableau de bord
          </Link>
        )}
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="container">
          <h3 className="text-3xl font-bold text-center mb-12">Fonctionnalités</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg">
              <h4 className="text-xl font-semibold mb-4">📝 Demandes</h4>
              <p className="text-gray-600">Publiez des demandes d'aide sur n'importe quel sujet</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h4 className="text-xl font-semibold mb-4">🤝 Propositions</h4>
              <p className="text-gray-600">Proposez votre aide à d'autres étudiants</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h4 className="text-xl font-semibold mb-4">⭐ Évaluations</h4>
              <p className="text-gray-600">Évaluez vos séances et construisez votre réputation</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
