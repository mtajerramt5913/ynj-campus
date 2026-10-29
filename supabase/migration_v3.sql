-- YNJ Campus, étape 3 : tout compte master / doctorat est approuvé automatiquement.
-- À exécuter une fois dans le SQL Editor si votre base existe déjà.

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare lv text := coalesce(new.raw_user_meta_data->>'level','licence');
begin
  if lv not in ('licence','master','doctorat') then lv := 'licence'; end if;
  insert into public.profiles (id, full_name, level, specialty_id, tutor_status)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name',''), 'Étudiant UCA'),
    lv,
    (select id from public.specialties where id = new.raw_user_meta_data->>'specialty_id'),
    case when lv = 'licence' then 'none' else 'approved' end
  );
  return new;
end $$;

-- Comptes master/doctorat déjà inscrits et encore en attente
update public.profiles set tutor_status = 'approved'
where level in ('master','doctorat') and tutor_status = 'pending';
