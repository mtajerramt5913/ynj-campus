-- YNJ Campus, étape 2 : profils de tuteurs, disponibilités, séances en ligne (Google Meet).
-- À exécuter UNE fois dans le SQL Editor, après schema.sql.

alter table public.profiles
  add column bio text check (char_length(bio) <= 500),
  add column subjects text check (char_length(subjects) <= 200);
grant update (bio, subjects) on public.profiles to authenticated;

-- Heures où un tuteur est disponible, chaque semaine (0 = dimanche … 6 = samedi)
create table public.availabilities (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);
alter table public.availabilities enable row level security;
create policy av_read on public.availabilities for select to authenticated using (true);
create policy av_ins  on public.availabilities for insert to authenticated
  with check (tutor_id = auth.uid() and public.is_approved_tutor());
create policy av_del  on public.availabilities for delete to authenticated using (tutor_id = auth.uid());

-- Séances : toujours en ligne. Le lien Meet est écrit uniquement par la fonction create-meet.
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null check (char_length(subject) between 3 and 120),
  question text not null check (char_length(question) between 10 and 300),
  scheduled_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','confirmed','refused','cancelled','done')),
  meet_url text,
  created_at timestamptz not null default now(),
  check (student_id <> tutor_id)
);
-- Un créneau ne peut être demandé qu'une fois tant qu'il est en attente ou confirmé
create unique index appointments_slot on public.appointments (tutor_id, scheduled_at)
  where status in ('pending','confirmed');
alter table public.appointments enable row level security;

create policy apt_read on public.appointments for select to authenticated
  using (student_id = auth.uid() or tutor_id = auth.uid());
create policy apt_ins on public.appointments for insert to authenticated
  with check (student_id = auth.uid() and status = 'pending' and meet_url is null and scheduled_at > now()
    and exists (select 1 from public.profiles t where t.id = tutor_id and t.tutor_status = 'approved' and t.level in ('master','doctorat')));
revoke update on public.appointments from anon, authenticated;
grant update (status) on public.appointments to authenticated;
create policy apt_upd on public.appointments for update to authenticated
  using (status in ('pending','confirmed') and (tutor_id = auth.uid() or student_id = auth.uid()))
  with check ((tutor_id = auth.uid() and status in ('refused','done')) or (student_id = auth.uid() and status = 'cancelled'));
-- « confirmed » n'est posé que par la fonction create-meet (clé serveur), jamais par le navigateur.

create function public.check_done() returns trigger language plpgsql as $$
begin
  if new.status = 'done' and old.status <> 'confirmed' then
    raise exception 'Seule une séance confirmée peut être terminée';
  end if;
  return new;
end $$;
create trigger trg_check_done before update on public.appointments
  for each row execute function public.check_done();
