import React from 'react';

// Petites icônes SVG (style trait) : évite d'ajouter une dépendance.
const paths: Record<string, string> = {
  search: 'M21 21l-4.3-4.3M17 11a6 6 0 11-12 0 6 6 0 0112 0z',
  plus: 'M12 5v14M5 12h14',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M5 13l4 4L19 7',
  book: 'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5zm2 14h13',
  users:
    'M17 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M10 10a4 4 0 100-8 4 4 0 000 8zM21 20v-2a4 4 0 00-3-3.9M16 2.1a4 4 0 010 7.8',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  chat: 'M21 12a8 8 0 01-11.6 7.1L3 21l1.9-5.4A8 8 0 1121 12z',
  star: 'M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9L12 3z',
  clock: 'M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  calendar: 'M8 3v3M16 3v3M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z',
  logout: 'M15 17l5-5-5-5M20 12H9M12 21H5a1 1 0 01-1-1V4a1 1 0 011-1h7',
  alert:
    'M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z',
  lock: 'M7 11V8a5 5 0 0110 0v3M6 11h12a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1v-8a1 1 0 011-1z',
  arrowLeft: 'M19 12H5m6-6l-6 6 6 6',
  arrowRight: 'M5 12h14m-6-6l6 6-6 6',
  inbox: 'M3 13l3-8h12l3 8M3 13v6a1 1 0 001 1h16a1 1 0 001-1v-6M3 13h5l1 3h6l1-3h5',
  sparkles: 'M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z',
  flag: 'M5 21V4m0 0h11l-2 4 2 4H5',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z',
};

export type IconName = keyof typeof paths;

export const Icon: React.FC<{ name: IconName; className?: string; filled?: boolean }> = ({
  name,
  className = 'h-5 w-5',
  filled = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d={paths[name]} />
  </svg>
);
