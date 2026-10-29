# YNJ Campus – Yallah Na9raw Jmi3 (يلا نقراو جميع)

Plateforme de **tutorat entre pairs** de l'Université Cadi Ayyad (UCA), réalisée pour l'**EduHack UCA** par Moussabe Tajerramt et Lamyaa Berry.

Les étudiants de **master et doctorat** aident les étudiants de **licence** de leur filière, en visio sur **Google Meet**, et déposent des cours, exercices et examens classés par filière (licences fondamentales et licences en éducation).

## Fonctionnalités
- Inscription avec email universitaire `@uca.ma` (contrôlé aussi côté serveur)
- Bibliothèque de ressources par filière et par semestre ; seuls les comptes master/doctorat peuvent publier
- Tuteurs (master et doctorat, approuvés automatiquement à l'inscription) : présentation, matières et **heures de disponibilité chaque semaine**
- Demande de séance de 30 minutes dans une plage disponible ; le tuteur confirme ou refuse
- À la confirmation : un **Google Meet** est créé et l'invitation part par email au tuteur et à l'étudiant
- Badges selon les séances terminées et les ressources publiées

## Installation (Supabase + GitHub Pages)
1. Créer un projet sur https://supabase.com. Dans `SQL Editor`, exécuter **dans l'ordre** : `supabase/schema.sql`, `supabase/migration_v2.sql`, puis (si votre base existait déjà avant ce changement) `supabase/migration_v3.sql`.
2. `Project Settings → API` : copier l'URL et la clé `anon` dans `config.js` (la clé `anon` est publique, la sécurité vient des règles RLS). Ne jamais publier la clé `service_role`.
3. `Authentication → Sign In / Providers → Email` : activé, avec « Confirm email » **désactivé** (pas de confirmation par email).
4. Déployer le site : pousser le dépôt sur GitHub, puis `Settings → Pages → Source : GitHub Actions` (le workflow `.github/workflows/pages.yml` publie à chaque push).
5. `Authentication → URL Configuration` : mettre l'adresse du site dans *Site URL*.

## Statut tuteur
Tout compte **master ou doctorat** est approuvé automatiquement à l'inscription, sans confirmation d'email. Le niveau est déclaré par l'utilisateur : en cas d'abus, retirez le statut avec `supabase/admin.sql` (`tutor_status = 'rejected'`), ce qui masque le compte de la liste des tuteurs et l'empêche de publier.

## Google Meet (fonction `create-meet`)
Les liens Meet sont créés par une Edge Function qui utilise l'API Google Agenda. Les emails du tuteur et de l'étudiant sont lus côté serveur et ne sont jamais exposés au navigateur.
1. Créer un compte Google dédié à la plateforme (par exemple `ynj.campus@gmail.com`) : c'est l'organisateur des événements.
2. https://console.cloud.google.com : créer un projet, activer **Google Calendar API**, configurer l'écran de consentement OAuth et **le publier** (« En production »), sinon le jeton expire au bout de 7 jours. Créer des identifiants *ID client OAuth*, type « Application Web », avec l'URI de redirection `https://developers.google.com/oauthplayground`.
3. https://developers.google.com/oauthplayground : roue dentée, cocher « Use your own OAuth credentials », saisir l'ID et le secret ; autoriser le scope `https://www.googleapis.com/auth/calendar.events` avec le compte organisateur ; échanger le code et copier le **Refresh token**.
4. Supabase, `Edge Functions → Deploy a new function`, nom `create-meet` : coller `supabase/functions/create-meet/index.ts`.
5. `Edge Functions → Secrets` : ajouter `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`.

## Fichiers
`index.html` (design), `app.js` (application), `config.js` (clés Supabase), `assets/` (logo), `supabase/` (SQL et fonction).
