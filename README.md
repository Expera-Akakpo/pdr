# Pont des Deux Rives — ProGen Bénin
**Site web officiel & Plateforme d'Administration dédiée au programme de volontariat international**

Ce projet comprend :
1. Le **site public** du programme « Pont des Deux Rives » de l'ONG **ProGen Bénin** (n°2022/3357/DEP-LIT/SG/SAG-Assoc).
2. Une **console d'administration privée et invisible** permettant à l'équipe de gérer l'intégralité des contenus sans toucher au code.
3. Une base de données **Neon Serverless PostgreSQL** dédiée avec API Express REST.

---

## 1. Démarrage et exécution

```bash
# Installation des dépendances
npm install

# Démarrage en développement (Express API + Vite sur le port 3000)
npm run dev

# Construction et production
npm run build
npm run start
```

---

## 2. Console d'Administration Privée

### A. Accès direct via #admin_pdr
La console d'administration est accessible directement sans configuration complexe ni clé secrète :
- **Via le hash d'URL :** Ajoutez simplement **`#admin_pdr`** à la fin de l'URL du site (ex: `http://localhost:3000/#admin_pdr` ou `https://votresite.com/#admin_pdr`).
- **Via l'URL directe :** **`http://localhost:3000/admin_pdr`**
- **Via le pied de page :** Un clic discret sur le copyright en bas de page redirige directement vers l'espace administrateur.

### B. Compte administrateur initial
Un compte administrateur a été configuré via le script `seed-admin.ts` :
- **E-mail :** `admin@progenbenin.org`
- **Mot de passe initial :** `ProGenAdmin2026!`

⚠️ **Important :** Dès votre première connexion, rendez-vous dans le menu **« Paramètres »** (ou via le bouton de profil) pour modifier votre mot de passe administrateur.

Pour recréer ou réinitialiser le compte administrateur via le terminal :
```bash
npx tsx seed-admin.ts
```

### C. Gestion des rôles
La console gère deux niveaux d'accès :
- **`admin`** : Accès complet (réalisations, circuits, programme, témoignages, partenaires, statistiques, candidatures d'inscription, messages de contact, abonnés, médiathèque, paramètres et gestion des comptes utilisateurs).
- **`editeur`** : Accès restreint à l'édition des contenus (pas d'accès aux messages de contact ni à la gestion des utilisateurs).

---

## 3. Schéma de Base de Données Neon

Deux scripts SQL idempotents sont fournis :
1. **`schema.sql`** : tables publiques (`pilars`, `program_weeks`, `circuits`, `realisations`, `testimonials`, `inscriptions`, `contact_messages`, `stats`, `newsletter_subscribers`).
2. **`schema-admin.sql`** : tables de gestion (`admin_users`, `sessions`, `settings`, `activity_log`, `media_library` et colonnes `published`, `internal_note`, etc.).

Pour exécuter les schémas dans la console Neon SQL Editor :
- Copiez et exécutez d'abord `schema.sql`, puis `schema-admin.sql`.

---

## 4. Gestion des Médias et Stockage

Le service de stockage de fichiers est isolé dans **`src/server/storage.ts`**.

### Stockage actuel (par défaut) :
- Les fichiers sont enregistrés localement dans `/public/uploads/` et servis immédiatement en statique sous `/uploads/...`.
- Formats acceptés : JPG, PNG, WEBP, PDF, MP4 (taille maximale : 50 Mo).

### Basculer vers un stockage cloud (S3 / Cloudinary / Supabase) :
Ouvrez `src/server/storage.ts` et remplacez simplement le contenu de la fonction `saveFile(file)` par l'appel à votre bucket ou SDK de choix. L'interface retourne l'URL publique qui sera stockée dans `media_library`.

---

## 5. Comment ajouter un nouveau module d'administration

Pour ajouter un nouveau module dans la console en suivant le modèle existant :
1. **Base de données :** Créez votre table dans Neon avec triggers `updated_at`.
2. **API Backend :** Ajoutez vos routes CRUD dans `src/server/adminRoutes.ts` protégées par `requireAuth` et `logActivity`.
3. **Frontend :**
   - Créez vos composants dans `src/admin/pages/votre-module/`.
   - Ajoutez le lien dans `visibleNav` dans `src/admin/layout/AdminLayout.tsx`.
   - Déclarez la route dans `src/App.tsx` sous le préfixe `${ADMIN_BASE_PATH}`.

---

## 6. Endpoints API d'Administration

- `POST /api/auth/login` : Connexion admin (rate-limiting : 5 tentatives / 15 min).
- `POST /api/auth/logout` : Déconnexion sécurisée.
- `GET  /api/auth/me` : Données de session de l'administrateur connecté.
- `POST /api/auth/change-password` : Modification sécurisée du mot de passe.
- `GET  /api/admin/dashboard` : Indicateurs clés et 10 dernières activités.
- `GET / POST / PUT / DELETE /api/admin/realisations` : CRUD réalisations.
- `GET / POST / PUT / DELETE /api/admin/circuits` : CRUD circuits touristiques.
- `GET / PUT /api/admin/program-weeks` : Édition du chronogramme des 4 semaines.
- `GET / PUT /api/admin/pilars` : Édition des 3 piliers du programme.
- `GET / POST / PUT / DELETE /api/admin/testimonials` : CRUD témoignages.
- `GET / POST / PUT / DELETE /api/admin/partners` : CRUD partenaires.
- `GET / PUT /api/admin/stats` : Édition des indicateurs d'accueil.
- `GET / PUT /api/admin/inscriptions` (+ `/export`) : Suivi des candidatures et export CSV.
- `GET / PUT /api/admin/contact-messages` (+ `/export`) : Traitement des messages et export CSV.
- `GET / PUT /api/admin/newsletter` (+ `/export`) : Gestion des abonnés.
- `GET / POST / PUT / DELETE /api/admin/users` : Gestion des comptes admin.
- `GET / POST / DELETE /api/admin/media` : Médiathèque et téléversement multipart.
- `GET / PUT /api/admin/settings` : Paramètres globaux du site.

---

## 7. Déploiement sur Vercel

Le projet est configuré pour un déploiement full-stack sur Vercel grâce à :
- **`vercel.json`** : Redirige les requêtes `/api/*` vers la Serverless Function Vercel et les autres chemins vers `index.html`.
- **`api/index.ts`** : Point d'entrée Serverless Function qui exécute l'API Express connectée à Neon PostgreSQL.

### Configuration Vercel :
1. Sur votre tableau de bord Vercel (**Project Settings > Environment Variables**), ajoutez la variable :
   - `DATABASE_URL` : L'URL de connexion Neon PostgreSQL (identique à celle du fichier `.env`).
   - `JWT_SECRET` : Clé secrète pour les tokens de session admin.
2. Redéployez votre projet (un nouveau push sur GitHub déclenchera le déploiement automatique).

