# CampusConnect

Plateforme d'entraide entre étudiants : publier une demande d'aide, proposer ses compétences, organiser une séance de révision, puis évaluer la séance terminée.

## Architecture

```
campus-connect/
├── frontend/   Next.js 14 (App Router) + React + TypeScript + Tailwind  → http://localhost:3000
├── backend/    Express + TypeScript + Prisma + Zod                       → http://localhost:5000/api/v1
│   ├── prisma/         schema.prisma, migrations, seed.ts
│   └── src/            routes → controllers → services → repositories
├── docker-compose.yml  PostgreSQL 15
└── package.json        workspaces npm (frontend + backend)
```

- **Frontend** : affiche les pages et appelle l'API (cookie HttpOnly envoyé automatiquement). Aucun secret, aucun accès direct à la base.
- **Backend** : valide (Zod), contrôle les permissions et applique les règles métier. Couches : *route* (URL) → *controller* (HTTP) → *service* (règles métier) → *repository* (Prisma).
- **Base** : PostgreSQL via Prisma, migrations versionnées dans `backend/prisma/migrations`.

## Prérequis

Node.js 18+, Docker Desktop.

## Installation et lancement (Windows PowerShell)

```powershell
# 1. Dépendances (à la racine)
npm install

# 2. Base PostgreSQL
docker-compose up -d

# 3. Variables d'environnement
copy backend\.env.example backend\.env        # puis renseigner DATABASE_URL et JWT_SECRET
copy frontend\.env.example frontend\.env.local

# 4. Migrations + données de démonstration
cd backend
npx prisma migrate deploy
npx prisma db seed

# 5. Backend (terminal 1)
npm run dev

# 6. Frontend (terminal 2)
cd ..\frontend
npm run dev
```

`DATABASE_URL` (Docker Compose) : `postgresql://campus_user:campus_password_secure@localhost:5432/campus_connect`

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | admin@example.com | admin123 |
| Étudiant (Ahmed Dridi) | student1@example.com | student123 |
| Étudiante (Fatima Zahra) | student2@example.com | student123 |
| Étudiant (Mohamed Ben Ali) | student3@example.com | student123 |
| Étudiante (Aisha Khan) | student4@example.com | student123 |

## Fonctionnalités

- Inscription, connexion, déconnexion, profil (compétences, disponibilités).
- Demandes d'aide : création, modification (si `OPEN`), suppression, recherche et filtres (matière, niveau, statut, « mes demandes »).
- Propositions : envoyer, accepter, refuser ; vue « envoyées / reçues ».
- Terminer la séance, puis évaluations (note 1–5 + commentaire).
- Tableau de bord avec statistiques calculées en base.
- Signalements et administration (masquer une publication).
- Recommandation d'étudiants avec score expliqué.

## Règles métier

- Statuts d'une demande : `OPEN` → `HELP_ACCEPTED` → `COMPLETED`.
- On ne peut pas proposer son aide à sa propre demande ; une seule proposition par étudiant et par demande.
- Seul l'auteur accepte/refuse. L'acceptation est **atomique** (transaction) : la demande passe à `HELP_ACCEPTED` et les autres propositions en attente sont refusées automatiquement.
- Terminer la séance : l'auteur **ou** l'étudiant dont la proposition est acceptée, uniquement si `HELP_ACCEPTED`.
- Évaluation : seulement si `COMPLETED`, par un participant, vers l'autre participant, une seule fois.
- Une demande terminée n'est plus modifiable.
- Signalement : on ne signale pas sa propre demande ; seul l'admin les traite : « Masquer et traiter » (demande cachée, signalement REVIEWED) ou « Rejeter » (signalement DISMISSED, demande inchangée). Une demande masquée est introuvable (404) pour les étudiants mais conservée en base.
- Recommandation (100 pts) : matière/compétences 40, niveau 20, disponibilités communes 20, évaluations 20. Réservée à l'auteur ; aucune donnée privée (e-mail) n'est exposée.

## Sécurité

- Mots de passe hachés avec bcrypt ; rôle `ADMIN` impossible à l'inscription.
- JWT dans un cookie `HttpOnly`, `SameSite=Strict` (protège du CSRF et du vol par JavaScript).
- CORS limité à `FRONTEND_URL`, limitation à 10 échecs de connexion / 15 min.
- Validation Zod côté serveur sur toutes les entrées ; permissions vérifiées sur chaque route protégée.

## API (`/api/v1`)

| Méthode | Route | Accès |
|---|---|---|
| POST | `/auth/register` (crée le compte, ne connecte pas), `/auth/login` (pose le cookie), `/auth/logout` | public / connecté |
| GET | `/auth/me` | connecté |
| GET, PATCH | `/users/me` | connecté |
| GET | `/requests` (`search, subject, requiredLevel, status, mine, page, limit`) | public |
| POST | `/requests` | connecté |
| GET | `/requests/:id` | public (masquée : admin seulement) |
| PATCH, DELETE | `/requests/:id` | auteur |
| POST, GET | `/requests/:id/proposals` | connecté (GET : auteur voit tout, proposant la sienne) |
| GET | `/proposals/mine` | connecté |
| PATCH | `/proposals/:id/accept`, `/proposals/:id/reject` | auteur de la demande |
| POST | `/requests/:id/complete` | auteur ou aidant accepté |
| POST, GET | `/requests/:id/reviews` | participant / connecté |
| GET | `/requests/:id/recommendations` | auteur |
| GET | `/dashboard` | connecté |
| POST | `/reports` | connecté |
| GET, PATCH | `/admin/reports`, `/admin/reports/:id` (corps `{action: 'HIDE'|'DISMISS'}`) | admin |

Erreurs : `{ "success": false, "message": "...", "errors": { champ: [...] } }` avec 400, 401, 403, 404, 409, 429.

## Tests et vérifications

```powershell
cd backend;  npx tsc --noEmit      # typage backend
cd backend;  npm test              # 18 tests d'intégration (base lancée + seed)
cd frontend; npm run build         # compilation frontend
```

## Limites connues

- Pas de vérification d'e-mail ni de réinitialisation de mot de passe.
- Disponibilités saisies en texte libre (comparaison par correspondance de texte).
- Pas de messagerie intégrée entre étudiants.
- Les suppressions de demandes sont définitives (pas de suppression logique), sauf le masquage admin.
