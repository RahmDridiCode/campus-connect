# CampusConnect Backend

API Express.js pour la plateforme CampusConnect.

## 🏗️ Architecture

- **Controllers** : Gèrent les requêtes HTTP
- **Services** : Contiennent la logique métier
- **Repositories** : Accèdent à la base de données via Prisma
- **Middlewares** : Authentification, validation, gestion erreurs
- **Validators** : Schémas Zod pour validation des données
- **Config** : Configuration (DB, JWT, etc.)
- **Types** : Types TypeScript partagés

## 🚀 Installation & Démarrage

### Prérequis
- Node.js v18+
- PostgreSQL 14+

### Installation des dépendances
```powershell
npm install
```

### Configuration
Créer un fichier `.env` en copiant `.env.example` :
```powershell
Copy-Item .env.example .env
```

Configurer la variable `DATABASE_URL` pour PostgreSQL.

### Initialiser la base de données
```powershell
# Appliquer migrations
npm run prisma:push

# Ajouter données de démonstration
npm run prisma:seed

# Visualiser la base (optionnel)
npm run prisma:studio
```

### Démarrer le serveur en développement
```powershell
npm run dev
# Serveur démaré sur http://localhost:5000
```

## 📝 Routes API

### Authentification
- `POST /api/v1/auth/register` - Créer un compte
- `POST /api/v1/auth/login` - Se connecter
- `POST /api/v1/auth/logout` - Se déconnecter
- `GET /api/v1/auth/me` - Données utilisateur actuel

### Profil
- `GET /api/v1/users/me` - Profil actuel
- `PATCH /api/v1/users/me` - Modifier profil
- `GET /api/v1/users/:id` - Profil public

### Demandes d'Aide
- `GET /api/v1/requests` - Lister (filtres disponibles)
- `POST /api/v1/requests` - Créer
- `GET /api/v1/requests/:id` - Détail
- `PATCH /api/v1/requests/:id` - Modifier
- `POST /api/v1/requests/:id/complete` - Clôturer

### Propositions
- `POST /api/v1/requests/:id/proposals` - Proposer aide
- `GET /api/v1/requests/:id/proposals` - Lister propositions
- `PATCH /api/v1/proposals/:id/accept` - Accepter
- `PATCH /api/v1/proposals/:id/reject` - Refuser

### Évaluations
- `POST /api/v1/requests/:id/reviews` - Évaluer
- `GET /api/v1/requests/:id/reviews` - Lister évaluations

### Recommandations
- `GET /api/v1/requests/:id/recommendations` - Obtenir recommandations

### Admin (Signalements)
- `POST /api/v1/reports` - Signaler
- `GET /api/v1/admin/reports` - Lister (admin only)
- `PATCH /api/v1/admin/reports/:id` - Traiter (admin only)

## 🧪 Tests

```powershell
# Exécuter tous les tests
npm test

# Mode watch
npm test:watch

# Couverture
npm test -- --coverage
```

## 🔐 Sécurité

- Mots de passe hashés avec bcrypt
- JWT + HttpOnly Cookie
- Validation Zod côté serveur
- Middleware CORS restrictif
- Contrôle des permissions sur chaque endpoint

## 📦 Dépendances Principales

- **express** : Framework web
- **prisma** : ORM pour PostgreSQL
- **zod** : Validation de schémas
- **jsonwebtoken** : JWT authentication
- **bcrypt** : Hashage des mots de passe
- **cors** : Cross-Origin Resource Sharing

## 📚 Documentation

Voir [Plan de Réalisation](../plan.md) pour l'architecture générale.
