# EDICOM — Qualification commerciale B2B

Application complète (Next.js 14 + Supabase) pour qualifier les candidats commerciaux B2B
avant l'entretien : test candidat en ligne, scoring automatique côté serveur, et tableau
de bord recruteur en temps réel.

- **Candidat** : reçoit un lien, définit un mot de passe, passe le test (profil comportemental
  + mises en situation), ne voit jamais son score.
- **Admin (recruteur)** : invite les candidats, suit leur statut, consulte le détail de chaque
  résultat, ajoute des notes d'entretien, change le statut (entretien passé / recruté / non retenu),
  ajuste la pondération du scoring.

Tout le scoring est calculé **côté serveur** à partir des identifiants de réponse envoyés par le
candidat — jamais depuis des points transmis par le navigateur — donc un candidat ne peut pas lire
les bonnes réponses dans le code source ou l'onglet réseau.

---

## 0. Ce dont vous avez besoin

- Un compte [Supabase](https://supabase.com) (gratuit pour démarrer)
- Un compte [GitHub](https://github.com)
- Un compte [Vercel](https://vercel.com) (gratuit pour démarrer, se connecte avec GitHub)
- Node.js 18+ installé sur votre machine si vous voulez tester en local

---

## 1. Créer le projet Supabase

1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Choisissez un nom (ex. `edicom-qualif-b2b`), une région proche (Europe de l'Ouest), et un mot
   de passe de base de données (gardez-le de côté, pas besoin de le ressaisir ensuite).
3. Une fois le projet créé, allez dans **SQL Editor** (icône dans la barre latérale).
4. Ouvrez le fichier `supabase/schema.sql` de ce projet, copiez tout son contenu, collez-le dans
   l'éditeur SQL Supabase, puis cliquez **Run**. Cela crée toutes les tables, index et règles de
   sécurité (Row Level Security).
5. Allez dans **Project Settings → API**. Notez trois valeurs, vous en aurez besoin à l'étape 3 :
   - `Project URL` → deviendra `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → deviendra `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (cliquez "Reveal") → deviendra `SUPABASE_SERVICE_ROLE_KEY`
     ⚠️ Cette clé est secrète — ne la mettez jamais dans du code exposé au navigateur, ni sur GitHub
     en clair (le `.gitignore` de ce projet exclut déjà les fichiers `.env*`).

### Configurer les URLs de redirection (important pour les liens d'invitation)

1. Toujours dans Supabase : **Authentication → URL Configuration**.
2. **Site URL** : mettez votre URL de production (vous l'aurez après l'étape 4 — vous pourrez
   revenir la modifier). En attendant, mettez `http://localhost:3000`.
3. **Redirect URLs** : ajoutez :
   - `http://localhost:3000/auth/callback`
   - `https://VOTRE-DOMAINE-VERCEL.vercel.app/auth/callback` (à ajouter après le déploiement)

### Au sujet des emails d'invitation

Supabase peut envoyer l'email d'invitation automatiquement via son service SMTP intégré, mais
celui-ci est limité en volume et pas garanti en délivrabilité. **Ce n'est pas bloquant** : chaque
fois qu'un admin invite un candidat (ou clique "Renvoyer le lien"), l'app génère aussi un lien
direct copiable, à envoyer manuellement par WhatsApp, SMS ou email — la méthode la plus fiable en
pratique. Si vous voulez un envoi automatique fiable plus tard, configurez un SMTP personnalisé
dans **Project Settings → Auth → SMTP Settings** (ex. avec Resend, Postmark, ou votre propre
serveur mail professionnel).

---

## 2. Pousser le code sur GitHub

Dans un terminal, à la racine de ce projet :

```bash
cd edicom-app
git init
git add .
git commit -m "Initial commit — EDICOM qualification B2B"
```

Créez un nouveau dépôt vide sur [github.com/new](https://github.com/new) (ne cochez aucune case
d'initialisation), puis :

```bash
git remote add origin https://github.com/VOTRE-COMPTE/edicom-qualif-b2b.git
git branch -M main
git push -u origin main
```

---

## 3. Déployer sur Vercel

1. Allez sur [vercel.com/new](https://vercel.com/new), connectez votre compte GitHub, puis
   sélectionnez le dépôt que vous venez de créer.
2. Vercel détecte automatiquement Next.js — ne changez rien aux réglages de build.
3. Avant de cliquer "Deploy", ouvrez la section **Environment Variables** et ajoutez :

   | Nom | Valeur |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | l'URL de votre projet Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | la clé `anon public` |
   | `SUPABASE_SERVICE_ROLE_KEY` | la clé `service_role` |
   | `NEXT_PUBLIC_SITE_URL` | laissez `https://placeholder.vercel.app` pour l'instant |

4. Cliquez **Deploy**. Au bout de 1-2 minutes, Vercel vous donne une URL du type
   `https://edicom-qualif-b2b.vercel.app`.
5. Retournez dans **Vercel → Settings → Environment Variables**, modifiez `NEXT_PUBLIC_SITE_URL`
   avec cette vraie URL, puis **Deployments → ⋯ → Redeploy** pour appliquer le changement.
6. Retournez dans **Supabase → Authentication → URL Configuration** et mettez à jour :
   - **Site URL** → votre URL Vercel
   - **Redirect URLs** → ajoutez `https://VOTRE-URL.vercel.app/auth/callback`

---

## 4. Créer le premier compte administrateur

1. Ouvrez `https://VOTRE-URL.vercel.app/admin/setup`.
2. Cette page ne fonctionne qu'une seule fois (elle se bloque dès qu'un admin existe). Remplissez
   votre nom, votre email et un mot de passe.
3. Vous êtes automatiquement connecté et redirigé vers `/admin`.
4. Pour ajouter d'autres recruteurs plus tard, le plus simple est de créer leur compte directement
   dans **Supabase → Authentication → Users → Add user**, puis d'ajouter une ligne correspondante
   dans la table `profiles` avec `role = 'admin'` (onglet **Table Editor** de Supabase).

---

## 5. Utiliser l'application

**Inviter un candidat** (`/admin/invite`) : renseignez son nom et son email → un compte est créé
et un lien d'accès unique est généré → copiez-collez ce lien et envoyez-le par WhatsApp, SMS ou
email.

**Le candidat** ouvre le lien → choisit un mot de passe → passe le test (≈8 minutes) → voit un
simple écran de remerciement (jamais son score).

**Le recruteur** (`/admin`) voit le tableau de bord se mettre à jour dès qu'un candidat termine :
score global, détail par compétence, réponses aux mises en situation, et des questions d'entretien
suggérées automatiquement sur les points faibles détectés. Depuis la fiche candidat
(`/admin/candidates/[id]`), le recruteur peut aussi changer le statut (entretien passé / recruté /
non retenu), ajouter des notes internes, renvoyer un lien d'invitation, ou supprimer un candidat.

**Réglages** (`/admin/settings`) : ajustez la pondération comportemental/mises en situation et les
seuils de recommandation — les changements s'appliquent aux tests soumis après l'enregistrement.

---

## 6. Développement local (optionnel)

```bash
npm install
cp .env.example .env.local   # puis remplissez avec vos vraies valeurs Supabase
npm run dev
```

Ouvrez `http://localhost:3000`.

---

## Ce que couvre l'application

- Authentification par email/mot de passe (Supabase Auth), deux rôles : `admin` et `candidate`.
- Row Level Security activée sur toutes les tables ; les écritures sensibles passent par des
  Server Actions Next.js qui vérifient le rôle avant d'utiliser la clé `service_role`.
- Scoring calculé et vérifié côté serveur (impossible à truquer depuis le navigateur).
- Historique complet par candidat : réponses brutes conservées, notes d'entretien horodatées,
  changements de statut.
- Design entièrement responsive, clair et minimal, pensé pour une utilisation aussi bien sur
  tablette (côté candidat) que sur ordinateur (côté recruteur).

## Pistes d'évolution possibles

- Édition des questions (banque de questions actuellement dans `lib/scoring.ts`) directement
  depuis un écran admin plutôt que dans le code.
- Export CSV/Excel de la liste des candidats.
- Envoi d'email automatique via un fournisseur SMTP dédié (Resend, Postmark…) en plus du lien
  copiable déjà disponible.
- Plusieurs postes/tests différents (pas seulement "Commercial B2B").
