-- Xyra — Biens (logements) avec QR code de pointage
-- Script purement additif : crée la table "biens" et ajoute "bien_id" aux missions.
-- À exécuter d'abord sur Supabase TEST (dqnqssezkvfbizkbaeeu), puis sur PROD.
-- L'application lit/écrit avec la clé serveur et filtre toujours par tenant_id ;
-- RLS activée SANS politique : aucun accès direct depuis le navigateur (les codes d'accès restent côté serveur).

create table if not exists public.biens (
  id                      uuid primary key default gen_random_uuid(),
  tenant_id               uuid not null references public.tenants(id) on delete cascade,
  client_id               uuid,
  client_nom              text,
  nom                     text not null,
  type_bien               text,
  adresse                 text,
  etage_porte             text,
  code_acces              text,
  code_boite_cles         text,
  emplacement_boite_cles  text,
  wifi                    text,
  consignes               text,
  infos                   text,
  qr_token                text not null unique default replace(gen_random_uuid()::text, '-', ''),
  actif                   boolean not null default true,
  created_at              timestamptz not null default now()
);
create index if not exists biens_tenant_idx on public.biens (tenant_id);

alter table public.missions add column if not exists bien_id uuid references public.biens(id) on delete set null;
create index if not exists missions_bien_idx on public.missions (bien_id);

alter table public.biens enable row level security;

-- Vérification (doit renvoyer 1 ligne biens / rls = true, puis 1 ligne bien_id) :
select relname as table_name, relrowsecurity as rls from pg_class where relname = 'biens';
select column_name from information_schema.columns where table_name = 'missions' and column_name = 'bien_id';
