-- YNJ Campus – schéma Supabase. À exécuter une fois dans « SQL Editor ».

-- 1. Filières (modifiable ensuite dans Table Editor)
create table public.specialties (
  id text primary key,
  name text not null,
  cursus text not null check (cursus in ('fondamentale','education')),
  establishment text not null
);

-- 2. Profils (1 ligne par compte). Le niveau est déclaré à l'inscription,
--    mais seul tutor_status = 'approved' donne le droit d'ajouter des ressources.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  level text not null default 'licence' check (level in ('licence','master','doctorat')),
  specialty_id text references public.specialties(id),
  tutor_status text not null default 'none' check (tutor_status in ('none','pending','approved','rejected')),
  created_at timestamptz not null default now()
);

-- 3. Ressources pédagogiques
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  specialty_id text not null references public.specialties(id) on delete cascade,
  kind text not null check (kind in ('cours','exercice','examen')),
  semester smallint check (semester between 1 and 6),
  title text not null check (char_length(title) between 3 and 120),
  description text check (char_length(description) <= 300),
  year smallint,
  url text check (url ~* '^https?://'),
  file_path text,
  author_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (url is not null or file_path is not null)
);
create index on public.resources (specialty_id, kind, semester);

-- 4. Sécurité côté serveur : emails universitaires uniquement
create function public.check_uca_email() returns trigger language plpgsql as $$
begin
  if new.email !~* '@([a-z0-9-]+\.)*uca\.(ac\.)?ma$' then
    raise exception 'Un email universitaire (@uca.ma) est requis';
  end if;
  return new;
end $$;
create trigger trg_check_uca_email before insert on auth.users
  for each row execute function public.check_uca_email();

-- 5. Création automatique du profil à l'inscription
create function public.handle_new_user() returns trigger
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
    case when lv = 'licence' then 'none' else 'pending' end
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. Qui peut ajouter des ressources : master/doctorat ET statut approuvé
create function public.is_approved_tutor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles
    where id = auth.uid() and tutor_status = 'approved' and level in ('master','doctorat'));
$$;

-- 7. Row Level Security
alter table public.specialties enable row level security;
alter table public.profiles    enable row level security;
alter table public.resources   enable row level security;

create policy spec_read on public.specialties for select to anon, authenticated using (true);

create policy prof_read on public.profiles for select to authenticated using (true);
create policy prof_upd  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from anon, authenticated;
grant update (full_name, specialty_id) on public.profiles to authenticated; -- ni level ni tutor_status

create policy res_read on public.resources for select to authenticated using (true);
create policy res_ins  on public.resources for insert to authenticated
  with check (author_id = auth.uid() and public.is_approved_tutor());
create policy res_upd  on public.resources for update to authenticated
  using (author_id = auth.uid() and public.is_approved_tutor())
  with check (author_id = auth.uid() and public.is_approved_tutor());
create policy res_del  on public.resources for delete to authenticated using (author_id = auth.uid());

-- 8. Stockage des fichiers (PDF, images…), 10 Mo max
insert into storage.buckets (id, name, public, file_size_limit)
values ('resources', 'resources', false, 10485760) on conflict (id) do nothing;
create policy files_read on storage.objects for select to authenticated using (bucket_id = 'resources');
create policy files_ins  on storage.objects for insert to authenticated
  with check (bucket_id = 'resources' and public.is_approved_tutor());
create policy files_del  on storage.objects for delete to authenticated
  using (bucket_id = 'resources' and owner_id = auth.uid()::text);

-- 9. Filières de départ. À VÉRIFIER avec l'offre officielle (preins.uca.ma / fiches uca.ma) :
--    les intitulés évoluent avec la nouvelle accréditation 2026-2027.
insert into public.specialties (id, name, cursus, establishment) values
 ('ens-primaire','Enseignement primaire','education','ENS Marrakech'),
 ('ens-maths','Enseignement secondaire – Mathématiques','education','ENS Marrakech'),
 ('ens-svt','Enseignement secondaire – Sciences de la vie et de la Terre','education','ENS Marrakech'),
 ('ens-pc','Enseignement secondaire – Sciences physiques et chimie','education','ENS Marrakech'),
 ('ens-info','Enseignement secondaire – Informatique','education','ENS Marrakech'),
 ('ens-francais','Enseignement secondaire – Français','education','ENS Marrakech'),
 ('ens-anglais','Enseignement secondaire – Anglais','education','ENS Marrakech'),
 ('ens-arabe','Enseignement secondaire – Arabe','education','ENS Marrakech'),
 ('ens-eps','Enseignement secondaire – Éducation physique et sportive','education','ENS Marrakech'),
 ('fssm-smp','Sciences de la matière physique (SMP)','fondamentale','FSSM Marrakech'),
 ('fssm-smc','Sciences de la matière chimie (SMC)','fondamentale','FSSM Marrakech'),
 ('fssm-smi','Sciences mathématiques et informatique (SMI)','fondamentale','FSSM Marrakech'),
 ('fssm-sma','Sciences mathématiques et applications (SMA)','fondamentale','FSSM Marrakech'),
 ('fssm-svi','Sciences de la vie','fondamentale','FSSM Marrakech'),
 ('fssm-stu','Sciences de la Terre et de l''Univers','fondamentale','FSSM Marrakech'),
 ('fsjes-seg','Sciences économiques et gestion','fondamentale','FSJES Marrakech'),
 ('fsjes-droit-fr','Droit (français)','fondamentale','FSJES Marrakech'),
 ('fsjes-droit-ar','Droit (arabe)','fondamentale','FSJES Marrakech'),
 ('fsjes-finance','Finance et banque','fondamentale','FSJES Marrakech'),
 ('flsh-arabe','Études arabes','fondamentale','FLSH Marrakech'),
 ('flsh-anglais','Études anglaises','fondamentale','FLSH Marrakech'),
 ('flsh-francais','Études françaises','fondamentale','FLSH Marrakech'),
 ('flsh-histoire','Histoire','fondamentale','FLSH Marrakech'),
 ('flsh-geo','Géographie','fondamentale','FLSH Marrakech'),
 ('flsh-socio','Sociologie','fondamentale','FLSH Marrakech'),
 ('flsh-islam','Études islamiques','fondamentale','FLSH Marrakech'),
 ('flam-arabe','Études arabes','fondamentale','FLAM Marrakech (Langue arabe)'),
 ('fps-smi','Sciences mathématiques et informatique','fondamentale','FP Safi'),
 ('fps-sma','Sciences mathématiques et applications','fondamentale','FP Safi'),
 ('fps-smp','Sciences de la matière physique','fondamentale','FP Safi'),
 ('fps-smc','Sciences de la matière chimie','fondamentale','FP Safi'),
 ('fps-svt','Sciences de la vie','fondamentale','FP Safi'),
 ('fps-geo','Géographie','fondamentale','FP Safi'),
 ('fps-arabe','Études arabes','fondamentale','FP Safi'),
 ('fps-francais','Études françaises','fondamentale','FP Safi'),
 ('fps-seg','Sciences économiques et gestion','fondamentale','FP Safi'),
 ('fps-droit-public','Droit public','fondamentale','FP Safi'),
 ('fps-juridique-ar','Études juridiques et politiques (arabe)','fondamentale','FP Safi');
