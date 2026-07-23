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
3. **Redirect URLs** : ajoutez (les deux, en local ET en production) :
   - `http://localhost:3000/auth/confirm`
   - `https://VOTRE-DOMAINE-VERCEL.vercel.app/auth/confirm`

   ⚠️ C'est bien `/auth/confirm` qu'il faut whitelister ici (pas `/auth/callback`) — c'est la
   page qui reçoit les liens d'invitation/réinitialisation générés par Supabase.

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
   - **Redirect URLs** → ajoutez `https://VOTRE-URL.vercel.app/auth/confirm`

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

## 6. Nouveau : page Entretiens (planification RH)

Si votre projet Supabase existait déjà, exécutez aussi `supabase/migration-add-interviews.sql`
dans le SQL Editor (une seule fois).

La page **Entretiens** (`/admin/interviews`) est l'espace dédié pour gérer tout le cycle
d'entretien, du premier contact jusqu'à la décision finale :
- **Ajouter un candidat** : pour une personne qui vient directement à un rendez-vous sans être
  passée par le test en ligne au préalable (elle pourra le passer sur place, en salle d'attente,
  avant l'entretien). Un compte est créé et vous pouvez planifier son rendez-vous dans la foulée.
- **À planifier** : tous les candidats sans entretien programmé — qu'ils aient déjà complété le
  test ou non (le statut de leur test est affiché sur chaque ligne). Un bouton « Planifier »
  ouvre un mini-formulaire (date/heure, lieu, reçu par).
- **Entretiens à venir** : liste triée par date. Pour chaque entretien : reporter la date,
  marquer le candidat absent, annuler, ou **marquer comme terminé** — ce qui ouvre le choix de
  décision (Recruter / Revoir en 2e entretien / Ne pas retenir) avec une note libre. Cette
  décision met aussi automatiquement à jour le statut du candidat partout ailleurs dans l'app.
- **Historique** : tous les entretiens passés, annulés ou avec absence, avec leur décision.

Un candidat marqué « à revoir » repasse automatiquement dans la colonne « à planifier » pour
programmer un second entretien.

## 7. Nouveau : dashboard analytics, mises à jour en direct, questions IA

Si votre projet Supabase existait déjà avant cette mise à jour, ouvrez **SQL Editor** dans
Supabase et exécutez le contenu de `supabase/migration-add-ai-brief.sql` (une seule fois).

**Dashboard analytics** (`/admin`) : répartition du pipeline par statut, recommandations
(recommandé/à creuser/à risque), score moyen par compétence sur l'ensemble des candidats,
distribution des scores, meilleurs profils. Tout se met à jour automatiquement toutes les
quelques secondes (indicateur "EN DIRECT" en haut à droite) — pas besoin de rafraîchir la page.

**Questions d'entretien plus précises** : chaque point faible détecté renvoie maintenant à
l'affirmation exacte à laquelle le candidat a répondu, pas juste à la compétence générale.

**Questions personnalisées par IA (optionnel)** : sur la fiche de chaque candidat, un bouton
« Générer avec l'IA » envoie les réponses exactes du candidat à l'API Anthropic (Claude) et
renvoie une courte synthèse + 5 questions d'entretien sur mesure, construites à partir de ce
que ce candidat précis a répondu. Pour l'activer :
1. Créez une clé sur [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Ajoutez `ANTHROPIC_API_KEY` dans les variables d'environnement Vercel (Settings → Environment
   Variables), puis redéployez.
3. Sans cette clé, le reste de l'application fonctionne normalement — le bouton affiche
   simplement un message expliquant comment l'activer.

Cette fonctionnalité utilise votre propre clé API Anthropic et engendre donc un coût minime par
génération (quelques centimes), facturé sur votre compte Anthropic — pas sur Claude.ai.

## 9. Nouveau : présentation EDICOM après le test (gratuit, sans outil externe)

Une fois le test terminé, le candidat voit maintenant une courte présentation animée (~30
secondes, 5 écrans qui s'enchaînent tout seuls) qui explique qui est EDICOM/Télécontact, ce que
fait l'entreprise, ce qu'implique le poste de commercial terrain, et pourquoi la rejoindre —
avant le message final "installez-vous, le recruteur arrive".

C'est entièrement construit en code (animations CSS), donc **aucun coût, aucun compte
supplémentaire** — contrairement à un vrai fichier vidéo généré par IA qui nécessiterait un
abonnement à un service tiers payant. Le contenu (textes, chiffres, arguments) se modifie
directement dans `app/test/done/Presentation.tsx` si vous voulez l'ajuster.

## 11. Nouveau : dossier de candidature complet + mises en situation ouvertes

Si votre projet Supabase existait déjà, exécutez aussi
`supabase/migration-add-application-info.sql` dans le SQL Editor (une seule fois).

Le test candidat comporte maintenant, dans l'ordre :
1. **Informations personnelles** — coordonnées, ville, âge, situation familiale, permis,
   véhicule, disponibilité, salaire souhaité, date d'embauche possible.
2. **Parcours professionnel** — dernier poste, entreprise, durée, raison de départ, plus belle
   réussite commerciale, plus gros échec commercial et ce qu'il/elle en a appris.
3. **Motivation** — pourquoi rejoindre EDICOM, ce qui le/la motive.
4. Le questionnaire comportemental et les mises en situation à choix multiple (inchangés).
5. **La présentation EDICOM** (déplacée ici — au milieu du test, plus à la fin).
6. **Mise en situation orale chronométrée** — "Présentez Télécontact.ma à un dirigeant
   d'entreprise" avec un chronomètre indicatif d'une minute (non bloquant).
7. **Question finale** — "Pourquoi devrions-nous vous recruter plutôt qu'un autre candidat ?"

Toutes ces réponses apparaissent maintenant sur la fiche de chaque candidat dans l'admin, et
sont aussi transmises à l'IA si vous utilisez "Générer avec l'IA" — les questions d'entretien
suggérées tiennent désormais compte du parcours et de la motivation, pas seulement du
questionnaire de personnalité.

## 13. Nouveau : réponses visibles en direct, pas seulement à la fin

Si votre projet Supabase existait déjà, exécutez aussi
`supabase/migration-add-live-progress.sql` dans le SQL Editor (une seule fois).

Avant, rien n'était enregistré tant que le candidat n'avait pas terminé tout le test. Désormais,
**chaque section est sauvegardée dès qu'elle est validée** : informations personnelles, parcours,
motivation, chaque réponse du questionnaire comportemental, chaque mise en situation, et le pitch
chronométré. Résultat : sur la fiche du candidat, vous voyez ses réponses apparaître au fur et à
mesure qu'il/elle avance dans le test — avec un badge « Test en cours de remplissage » tant que ce
n'est pas terminé — au lieu d'attendre la toute fin. Le score global, lui, n'est calculé qu'une
fois le test entièrement soumis (il n'aurait pas de sens sur des réponses partielles).

## 15. Nouveau : mises à jour instantanées sur la fiche candidat (sans polling)

Si votre projet Supabase existait déjà, exécutez aussi `supabase/migration-add-realtime.sql`
dans le SQL Editor (une seule fois).

Auparavant, la fiche candidat se mettait à jour via un rafraîchissement automatique toutes les
quelques secondes. Désormais, elle est **directement connectée en temps réel** à la base de
données (Supabase Realtime) : dès qu'une nouvelle réponse est enregistrée, la page se met à jour
instantanément, sans délai — vous n'avez plus besoin d'actualiser ni d'attendre. Le badge
« EN DIRECT » à côté du nom du candidat clignote brièvement à chaque mise à jour reçue.

## 16. Développement local (optionnel)

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
