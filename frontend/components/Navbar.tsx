'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Icon } from './Icons';
import { Avatar } from './UI';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Referme le menu mobile à chaque changement de page
  useEffect(() => setOpen(false), [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const links = [
    { href: '/requests', label: 'Demandes' },
    ...(isAuthenticated
      ? [
          { href: '/dashboard', label: 'Tableau de bord' },
          { href: '/proposals', label: 'Propositions' },
          { href: '/profile', label: 'Profil' },
        ]
      : []),
    ...(user?.role === 'ADMIN' ? [{ href: '/admin/reports', label: 'Administration' }] : []),
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const linkClass = (href: string) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive(href)
        ? 'bg-brand-50 text-brand-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav
        className="container flex flex-wrap items-center justify-between py-3"
        aria-label="Navigation principale"
      >
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Icon name="users" className="h-5 w-5" />
          </span>
          <span>
            Campus<span className="text-brand-600">Connect</span>
          </span>
        </Link>

        <button
          type="button"
          className="btn-secondary px-2.5 md:hidden"
          aria-expanded={open}
          aria-controls="main-menu"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setOpen(!open)}
        >
          <Icon name={open ? 'close' : 'menu'} />
        </button>

        <ul
          id="main-menu"
          className={`${open ? 'mt-3 flex' : 'hidden'} w-full flex-col gap-1 md:mt-0 md:flex md:w-auto md:flex-row md:items-center md:gap-1`}
        >
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={linkClass(l.href)}
                aria-current={isActive(l.href) ? 'page' : undefined}
              >
                {l.label}
              </Link>
            </li>
          ))}
          {isAuthenticated ? (
            <li className="mt-2 flex items-center gap-3 border-t border-slate-200 pt-3 md:ml-3 md:mt-0 md:border-l md:border-t-0 md:pl-4 md:pt-0">
              <Avatar name={user?.fullName} />
              <span className="hidden max-w-[10rem] truncate text-sm font-medium text-slate-700 lg:block">
                {user?.fullName}
              </span>
              <button type="button" onClick={handleLogout} className="btn-secondary btn-sm">
                <Icon name="logout" className="h-4 w-4" />
                Déconnexion
              </button>
            </li>
          ) : (
            <li className="mt-2 flex items-center gap-2 md:ml-3 md:mt-0">
              <Link href="/auth/login" className="btn-ghost btn-sm">
                Connexion
              </Link>
              <Link href="/auth/register" className="btn-primary btn-sm">
                Inscription
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};
