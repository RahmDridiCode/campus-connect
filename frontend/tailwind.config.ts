import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

// Design tokens centralisés : changer `brand` change toute l'application.
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  corePlugins: { container: false }, // `.container` est défini dans globals.css
  theme: {
    extend: {
      colors: {
        brand: colors.indigo,
        accent: colors.amber,
        primary: colors.indigo[600],
        secondary: colors.slate[500],
        success: colors.emerald[500],
        warning: colors.amber[500],
        danger: colors.rose[500],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        pop: '0 10px 30px -10px rgb(15 23 42 / 0.25)',
      },
    },
  },
  plugins: [],
};
export default config;
