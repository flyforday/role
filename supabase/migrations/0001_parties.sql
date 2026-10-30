-- Veillée : schéma multijoueur (Supabase, offre gratuite).
-- À exécuter une fois dans l'éditeur SQL du projet Supabase (ou via `supabase db push`).
-- Sécurité : la clé "anon" est publique ; tout repose sur les règles RLS ci-dessous.
--   * seuls les membres d'une partie la voient ;
--   * seul l'hôte modifie l'état du jeu (son navigateur est l'arbitre) ;
--   * chaque joueur ne peut déclarer que ses propres actions.

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  host_name text not null default '',
  title text not null default 'Partie',
  invite_code text not null unique default substr(md5(random()::text || clock_timestamp()::text), 1, 10),
  state jsonb not null,
  undo_stack jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_members (
  game_id uuid not null references public.games (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null default '',
  role text not null default 'joueur' check (role in ('hote', 'joueur')),
  joined_at timestamptz not null default now(),
  primary key (game_id, user_id)
);

create table if not exists public.actions (
  id bigint generated always as identity primary key,
  game_id uuid not null references public.games (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('action', 'attack', 'xcard', 'character')),
  payload jsonb not null,
  status text not null default 'en_attente' check (status in ('en_attente', 'resolue', 'rejetee')),
  created_at timestamptz not null default now()
);

create index if not exists actions_game_status_idx on public.actions (game_id, status);
create index if not exists members_user_idx on public.game_members (user_id);

-- Fonctions utilitaires (security definer pour éviter la récursion des politiques RLS).
create or replace function public.is_member(gid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.game_members where game_id = gid and user_id = auth.uid());
$$;

create or replace function public.is_host(gid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.games where id = gid and host_id = auth.uid());
$$;

-- L'hôte devient automatiquement membre de sa partie.
create or replace function public.add_host_member() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.game_members (game_id, user_id, display_name, role)
  values (new.id, new.host_id, new.host_name, 'hote')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists games_add_host on public.games;
create trigger games_add_host after insert on public.games
for each row execute function public.add_host_member();

-- Rejoindre une partie avec le code d'invitation.
create or replace function public.join_game(code text, name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  gid uuid;
begin
  if auth.uid() is null then
    raise exception 'Connexion requise';
  end if;
  select id into gid from public.games where invite_code = code;
  if gid is null then
    raise exception 'Code d''invitation inconnu';
  end if;
  if (select count(*) from public.game_members where game_id = gid) >= 8
     and not public.is_member(gid) then
    raise exception 'La table est complète (8 joueurs maximum)';
  end if;
  insert into public.game_members (game_id, user_id, display_name, role)
  values (gid, auth.uid(), left(coalesce(name, ''), 40), 'joueur')
  on conflict (game_id, user_id) do update set display_name = excluded.display_name;
  return gid;
end;
$$;

alter table public.games enable row level security;
alter table public.game_members enable row level security;
alter table public.actions enable row level security;

drop policy if exists "membres lisent la partie" on public.games;
create policy "membres lisent la partie" on public.games for select using (public.is_member(id) or host_id = auth.uid());
drop policy if exists "créer sa partie" on public.games;
create policy "créer sa partie" on public.games for insert with check (host_id = auth.uid());
drop policy if exists "hôte modifie" on public.games;
create policy "hôte modifie" on public.games for update using (host_id = auth.uid()) with check (host_id = auth.uid());
drop policy if exists "hôte supprime" on public.games;
create policy "hôte supprime" on public.games for delete using (host_id = auth.uid());

drop policy if exists "membres voient la table" on public.game_members;
create policy "membres voient la table" on public.game_members for select using (public.is_member(game_id));
drop policy if exists "quitter ou exclure" on public.game_members;
create policy "quitter ou exclure" on public.game_members for delete using (user_id = auth.uid() or public.is_host(game_id));

drop policy if exists "membres lisent les actions" on public.actions;
create policy "membres lisent les actions" on public.actions for select using (public.is_member(game_id));
drop policy if exists "déclarer ses actions" on public.actions;
create policy "déclarer ses actions" on public.actions for insert with check (user_id = auth.uid() and public.is_member(game_id) and status = 'en_attente');
drop policy if exists "hôte résout" on public.actions;
create policy "hôte résout" on public.actions for update using (public.is_host(game_id));

-- Temps réel.
do $$
begin
  begin
    alter publication supabase_realtime add table public.games;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.actions;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.game_members;
  exception when duplicate_object then null;
  end;
end $$;

-- Nettoyage : les actions résolues de plus de 7 jours ne servent plus (à lancer de temps en temps).
-- delete from public.actions where status <> 'en_attente' and created_at < now() - interval '7 days';
