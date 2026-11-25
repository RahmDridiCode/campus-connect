'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AccessDenied, LoadingState } from './UI';

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
    <div className="flex min-h-screen flex-col bg-slate-50">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Aller au contenu
      </a>
      <Navbar />
      <main id="contenu" className="container flex-1 py-8">
        {blocked ? <LoadingState /> : forbidden ? <AccessDenied /> : children}
      </main>
      <Footer />
    </div>
  );
};
