import type { Metadata } from 'next';
import { AuthProvider } from '@/hooks/useAuth';
import './globals.css';

export const metadata: Metadata = {
  title: "CampusConnect - Plateforme d'entraide étudiante",
  description:
    "Plateforme pour publier des demandes d'aide, proposer ses compétences et évaluer les séances de révision",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
