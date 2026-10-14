'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { LoadingState } from './UI';

interface AppShellProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

// Mise en page commune : Navbar + contenu + Footer.
// Redirige vers /auth/login si la page est privée et que l'utilisateur n'est pas connecté.
export const AppShell = ({
  children,
  requireAuth = false,
  requireAdmin = false,
}: AppShellProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if ((requireAuth || requireAdmin) && !user) {
      router.push('/auth/login');
    }
  }, [isLoading, user, requireAuth, requireAdmin, router]);

  const blocked = (requireAuth || requireAdmin) && (isLoading || !user);
  const forbidden = requireAdmin && user && user.role !== 'ADMIN';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="container py-8 flex-1">
        {blocked ? (
          <LoadingState />
        ) : forbidden ? (
          <p className="text-red-700">Accès réservé aux administrateurs.</p>
        ) : (
          children
        )}
      </main>
      <Footer />
    </div>
  );
};
