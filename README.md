# YNJ Campus – Yallah Na9raw Jmi3 (يلا نقراو جميع)

Plateforme de **tutorat entre pairs** de l'Université Cadi Ayyad (UCA) – projet pour l'**EduHack UCA**.

Elle relie les étudiants en **licence**, qui ont besoin d'éclaircissements sur des points non compris, aux étudiants en **master ou doctorat** de la même filière, désireux de les aider.

## Problème
Beaucoup d'étudiants en licence restent bloqués sur un chapitre sans savoir à qui demander de l'aide. Les étudiants avancés, eux, n'ont pas de cadre pour partager leurs connaissances ni être reconnus pour leur engagement.

## Solution
- Inscription avec email universitaire `@uca.ma` (étudiant ou tuteur)
- Recherche de tuteurs par matière et disponibilité
- Demande de rendez-vous (en ligne ou en bibliothèque FSSM) avec la question précisée
- Tableau de bord tuteur : confirmer ou refuser, gérer son agenda
- Séance en visioconférence, puis retour des deux participants
- Badges et niveaux pour reconnaître l'engagement des tuteurs bénévoles

## Prototype
Site statique (`index.html` + `db.js`) qui reproduit les 12 écrans de la maquette, plus une section **Ressources** (cours, exercices, examens) par filière. Les comptes, les rôles, les filières et les ressources sont stockés dans une vraie base **Supabase** (PostgreSQL). Les rendez-vous, la liste des tuteurs et les badges restent pour l'instant simulés dans le navigateur.

## Base de données (Supabase, gratuit)
1. Créer un projet sur https://supabase.com.
2. `SQL Editor` : coller et exécuter `supabase/schema.sql` (tables, sécurité RLS, stockage, filières de départ).
3. `Project Settings → API` : copier l'URL et la clé `anon` dans `config.js`. Cette clé est publique par conception, la sécurité repose sur les règles RLS.
4. `Authentication → Providers → Email` : activer, et décider si la confirmation par email est obligatoire.
5. Ouvrir le site (Pages ou `python3 -m http.server`) et créer un compte.

### Qui peut ajouter des ressources ?
Uniquement les comptes `master` ou `doctorat` dont le statut est `approved`. Cette règle est appliquée par la base (RLS), pas seulement par l'interface.
- À l'inscription, un compte master/doctorat passe en `pending`. Un compte licence ne peut jamais publier.
- Un utilisateur ne peut pas modifier lui-même son niveau ni son statut.
- Vous validez un tuteur après avoir vérifié son statut (carte étudiante, attestation) :
```sql
update public.profiles set tutor_status = 'approved'
where id = (select id from auth.users where email = 'prenom.nom@uca.ma');
```

### Filières
La liste de départ est dans `schema.sql` (9 licences d'éducation de l'ENS Marrakech + licences fondamentales de la FSSM, FSJES, FLSH, FLAM et FP Safi). Elle est à **vérifier et compléter** avec l'offre officielle : ajoutez ou corrigez les lignes dans `Table Editor → specialties`, le site les prend en compte sans modification du code.

Essayer en local sans base : ouvrir `index.html` (la page Ressources demandera la configuration).

## Déployer sur GitHub Pages
1. Créer un dépôt GitHub et y envoyer ces fichiers (branche `main`).
2. `Settings → Pages → Source : GitHub Actions`.
3. Le workflow `.github/workflows/pages.yml` publie le site à chaque push :
   `https://<utilisateur>.github.io/<depot>/`

## Prochaines étapes
- Backend et authentification (Supabase ou Firebase) restreints au domaine `@uca.ma`
- Visioconférence intégrée (Jitsi, déjà accessible depuis l'écran de séance)
- Notifications email et rappels de rendez-vous
- Statistiques d'impact pour l'université

## Équipe
Moussabe Tajerramt · Lamyaa Berry
