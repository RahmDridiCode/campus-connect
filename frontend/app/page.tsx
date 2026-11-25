'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/AppShell';
import { RequestCard } from '@/components/RequestCard';
import { CardListSkeleton, EmptyState } from '@/components/UI';
import { Icon, IconName } from '@/components/Icons';
import { HelpRequest } from '@/types/requests';

const features: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'book',
    title: "Demandez de l'aide",
    text: 'Décrivez votre difficulté, la matière et vos disponibilités. Les autres étudiants vous répondent.',
  },
  {
    icon: 'users',
    title: 'Partagez vos compétences',
    text: "Proposez votre aide, échangez avec l'auteur de la demande et organisez la séance.",
  },
  {
    icon: 'star',
    title: 'Évaluez les séances',
    text: 'Après chaque séance terminée, laissez une note et un avis pour valoriser les aidants.',
  },
];

const steps = [
  'Créez votre compte et complétez votre profil',
  'Publiez une demande ou proposez votre aide',
  'Acceptez une proposition, réalisez la séance, puis évaluez-vous',
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [recent, setRecent] = useState<HelpRequest[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  // Vraies données : les 3 dernières demandes ouvertes et le nombre total publié
  useEffect(() => {
    api
      .get('/requests', { params: { limit: 3, status: 'OPEN' } })
      .then((res) => {
        setRecent(res.data.data);
        setTotal(res.data.pagination?.total ?? null);
      })
      .catch(() => setRecent([]));
  }, []);

  return (
    <AppShell>
      {/* Hero */}
      <section className="card mb-12 px-4 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            <Icon name="sparkles" className="h-3.5 w-3.5" />
            Plateforme d'entraide entre étudiants
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            {isAuthenticated
              ? `Bonjour ${user?.fullName?.split(' ')[0]} 👋`
              : 'Ensemble, on révise mieux.'}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Publiez vos demandes d'aide, proposez vos compétences, organisez des séances de révision
            et évaluez-les, le tout sur CampusConnect.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="btn-primary btn-lg">
                  Mon tableau de bord
                </Link>
                <Link href="/requests/new" className="btn-secondary btn-lg">
                  Publier une demande
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/register" className="btn-primary btn-lg">
                  Créer un compte
                </Link>
                <Link href="/requests" className="btn-secondary btn-lg">
                  Parcourir les demandes
                </Link>
              </>
            )}
          </div>
          {total !== null && (
            <p className="mt-6 text-sm text-slate-500">
              <strong className="text-slate-800">{total}</strong> demande{total > 1 ? 's' : ''}{' '}
              ouverte{total > 1 ? 's' : ''} en ce moment
            </p>
          )}
        </div>
      </section>

      {/* Avantages */}
      <section aria-labelledby="avantages" className="mb-16">
        <h2 id="avantages" className="sr-only">
          Pourquoi CampusConnect
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon name={f.icon} />
              </span>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demandes récentes */}
      <section aria-labelledby="recentes" className="mb-16">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 id="recentes" className="text-2xl font-bold">
              Demandes récentes
            </h2>
            <p className="text-sm text-slate-600">Des étudiants ont besoin de votre aide.</p>
          </div>
          <Link href="/requests" className="link inline-flex items-center gap-1 text-sm">
            Tout voir <Icon name="arrowRight" className="h-4 w-4" />
          </Link>
        </div>
        {recent === null ? (
          <CardListSkeleton />
        ) : recent.length === 0 ? (
          <div className="card">
            <EmptyState
              title="Aucune demande ouverte"
              description="Soyez le premier à publier une demande d'aide."
              action={{ label: 'Publier une demande', href: '/requests/new' }}
            />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recent.map((r) => (
              <RequestCard key={r.id} request={r} />
            ))}
          </div>
        )}
      </section>

      {/* Comment ça marche */}
      <section aria-labelledby="etapes" className="card mb-4 p-6 sm:p-10">
        <h2 id="etapes" className="text-2xl font-bold">
          Comment ça marche ?
        </h2>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="text-sm text-slate-700">{s}</p>
            </li>
          ))}
        </ol>
      </section>
    </AppShell>
  );
}
