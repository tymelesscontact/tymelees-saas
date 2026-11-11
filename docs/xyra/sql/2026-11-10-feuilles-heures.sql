-- Xyra — Feuilles d'heures mensuelles signées + email de l'expert-comptable
-- Script purement additif. À exécuter sur Supabase TEST (dqnqssezkvfbizkbaeeu), puis PROD.
-- RLS activée sans politique : accès uniquement par le serveur (clé service), filtré par tenant_id.

create table if not exists public.feuilles_heures (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references public.tenants(id) on delete cascade,
  employe_id           uuid not null references public.equipe(id) on delete cascade,
  mois                 text not null check (mois ~ '^[0-9]{4}-[0-9]{2}$'),
  total_minutes        integer not null default 0,
  minutes_au_dela      integer not null default 0,
  detail               jsonb not null default '{}'::jsonb,
  empreinte            text,
  signee_le            timestamptz,
  signee_ip            text,
  validee_le           timestamptz,
  validee_par          uuid,
  envoyee_cabinet_le   timestamptz,
  created_at           timestamptz not null default now(),
  unique (tenant_id, employe_id, mois)
);
create index if not exists feuilles_heures_tenant_mois_idx on public.feuilles_heures (tenant_id, mois);
alter table public.feuilles_heures enable row level security;

alter table public.tenants add column if not exists email_comptable text;

-- Vérification (1 ligne feuilles_heures / rls = true, puis 1 ligne email_comptable) :
select relname as table_name, relrowsecurity as rls from pg_class where relname = 'feuilles_heures';
select column_name from information_schema.columns where table_name = 'tenants' and column_name = 'email_comptable';
