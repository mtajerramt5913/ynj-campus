-- YNJ Campus : vérification des tuteurs. À lancer dans le SQL Editor (accès administrateur).

-- 1. Voir les comptes master / doctorat en attente de vérification
select p.id, p.full_name, u.email, p.level, p.created_at
from public.profiles p join auth.users u on u.id = p.id
where p.tutor_status = 'pending' order by p.created_at;

-- 2. VÉRIFIER un tuteur (après avoir contrôlé son attestation d'inscription en master/doctorat)
update public.profiles set tutor_status = 'approved'
where id = (select id from auth.users where email = 'prenom.nom@uca.ma')
  and level in ('master','doctorat');

-- 3. ANNULER la vérification (le compte reste, mais ne peut plus publier ni recevoir de demandes)
--    'rejected' = refusé ; remplacez par 'pending' pour le remettre en attente.
update public.profiles set tutor_status = 'rejected'
where id = (select id from auth.users where email = 'prenom.nom@uca.ma');

-- 4. Nettoyage facultatif après une annulation
update public.appointments set status = 'cancelled'
where tutor_id = (select id from auth.users where email = 'prenom.nom@uca.ma') and status in ('pending','confirmed');
delete from public.availabilities
where tutor_id = (select id from auth.users where email = 'prenom.nom@uca.ma');
-- delete from public.resources where author_id = (select id from auth.users where email = 'prenom.nom@uca.ma');  -- supprime aussi ses ressources

-- 5. Un étudiant qui passe en master : changer son niveau puis le vérifier
-- update public.profiles set level = 'master', tutor_status = 'approved'
-- where id = (select id from auth.users where email = 'prenom.nom@uca.ma');
