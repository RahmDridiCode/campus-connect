import Link from 'next/link';

export const Footer = () => (
  <footer className="mt-16 border-t border-slate-200 bg-white">
    <div className="container flex flex-col items-center justify-between gap-3 py-6 text-sm text-slate-500 sm:flex-row">
      <p>
        © {new Date().getFullYear()}{' '}
        <span className="font-medium text-slate-700">CampusConnect</span> — L'entraide entre
        étudiants
      </p>
      <ul className="flex gap-4">
        <li>
          <Link href="/requests" className="hover:text-brand-700">
            Demandes
          </Link>
        </li>
        <li>
          <Link href="/auth/register" className="hover:text-brand-700">
            Rejoindre
          </Link>
        </li>
      </ul>
    </div>
  </footer>
);
