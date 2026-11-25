import Link from 'next/link';
import { ReactNode } from 'react';
import { Icon } from './Icons';

// Mise en page des pages connexion / inscription : panneau de présentation + formulaire
export const AuthLayout = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    <aside className="hidden flex-col justify-between bg-brand-700 p-12 text-white lg:flex">
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-bold text-white hover:no-underline"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
          <Icon name="users" />
        </span>
        CampusConnect
      </Link>
      <div>
        <h2 className="text-3xl font-bold leading-tight text-white">
          Apprenez ensemble, réussissez ensemble.
        </h2>
        <ul className="mt-6 space-y-3 text-brand-100">
          {[
            "Publiez une demande d'aide en quelques minutes",
            'Proposez vos compétences aux autres étudiants',
            'Évaluez les séances et construisez votre réputation',
          ].map((t) => (
            <li key={t} className="flex items-start gap-3">
              <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-brand-200" />
              {t}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-sm text-brand-200">© {new Date().getFullYear()} CampusConnect</p>
    </aside>

    <main className="flex items-center justify-center bg-slate-50 px-4 py-10 sm:px-8">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center gap-2 text-lg font-bold text-slate-900 hover:no-underline lg:hidden"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Icon name="users" className="h-5 w-5" />
          </span>
          CampusConnect
        </Link>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mb-8 mt-2 text-sm text-slate-600">{subtitle}</p>
        <div className="card p-6 sm:p-8">{children}</div>
      </div>
    </main>
  </div>
);
