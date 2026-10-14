# CampusConnect Frontend

Interface web Next.js pour la plateforme CampusConnect.

## 🏗️ Architecture

- **app/** : Pages et layouts (Next.js App Router)
- **components/** : Composants React réutilisables
- **hooks/** : Custom hooks (useAuth, useRequests, etc.)
- **lib/** : Utilitaires (API client, auth, helpers)
- **types/** : Types TypeScript
- **public/** : Assets statiques

## 🚀 Installation & Démarrage

### Prérequis
- Node.js v18+
- npm ou yarn

### Installation des dépendances
```powershell
npm install
```

### Configuration
Créer un fichier `.env.local` en copiant `.env.example` :
```powershell
Copy-Item .env.example .env.local
```

Configurer l'URL de l'API backend si nécessaire.

### Démarrer le serveur en développement
```powershell
npm run dev
# Accéder à http://localhost:3000
```

### Build pour production
```powershell
npm run build
npm start
```

## 📄 Pages Principales

- `/` - Accueil
- `/auth/register` - Inscription
- `/auth/login` - Connexion
- `/requests` - Lister les demandes d'aide
- `/requests/new` - Créer une demande
- `/requests/[id]` - Détail d'une demande
- `/requests/[id]/edit` - Modifier une demande
- `/dashboard` - Tableau de bord personnel
- `/profile` - Profil utilisateur
- `/admin/reports` - Gestion des signalements (admin only)

## 🧩 Composants Réutilisables

- `Navbar` - Barre de navigation
- `Footer` - Pied de page
- `RequestCard` - Affiche une demande
- `RequestForm` - Formulaire créer/modifier
- `ProposalCard` - Affiche une proposition
- `StatusBadge` - Badge de statut
- `RatingForm` - Formulaire d'évaluation
- `DashboardStats` - Statistiques tableau de bord
- `LoadingState` - État de chargement
- `ErrorState` - État d'erreur
- `EmptyState` - État vide
- `ConfirmDialog` - Confirmation action

## 🔐 Authentification

- Login/Logout gérés par hooks `useAuth()`
- JWT stocké en HttpOnly Cookie
- Routes privées protégées
- Redirection automatique si non authentifié

## 🎨 Styling

- Tailwind CSS pour le design
- Thème cohérent avec couleurs définies
- Responsive design (mobile, tablette, desktop)
- Accessibilité (labels, contrastes, navigation clavier)

## 📦 Dépendances Principales

- **next** : Framework React
- **react-hook-form** : Gestion des formulaires
- **zod** : Validation côté client
- **axios** : Client HTTP
- **tailwindcss** : Framework CSS

## 🧪 Tests (Optionnel)

Tests des composants avec Jest/React Testing Library à ajouter.

## 📚 Documentation

Voir [Plan de Réalisation](../plan.md) pour l'architecture générale.
