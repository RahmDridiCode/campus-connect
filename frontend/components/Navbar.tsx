'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const linkClass = 'block px-3 py-2 text-gray-700 hover:text-blue-700';

  return (
    <header className="bg-white shadow-sm">
      <nav
        className="container flex flex-wrap items-center justify-between py-4"
        aria-label="Navigation principale"
      >
        <Link href="/" className="text-2xl font-bold text-blue-700">
          CampusConnect
        </Link>

        <button
          type="button"
          className="md:hidden border rounded px-3 py-1"
          aria-expanded={open}
          aria-controls="main-menu"
          onClick={() => setOpen(!open)}
        >
          Menu
        </button>

        <ul
          id="main-menu"
          className={`${open ? 'block' : 'hidden'} w-full md:flex md:w-auto md:items-center md:gap-2`}
        >
          <li>
            <Link href="/requests" className={linkClass}>
              Demandes
            </Link>
          </li>
          {isAuthenticated ? (
            <>
              <li>
                <Link href="/dashboard" className={linkClass}>
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link href="/proposals" className={linkClass}>
                  Propositions
                </Link>
              </li>
              <li>
                <Link href="/profile" className={linkClass}>
                  Profil
                </Link>
              </li>
              {user?.role === 'ADMIN' && (
                <li>
                  <Link href="/admin/reports" className={linkClass}>
                    Administration
                  </Link>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Déconnexion
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/auth/login" className={linkClass}>
                  Connexion
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Inscription
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};
