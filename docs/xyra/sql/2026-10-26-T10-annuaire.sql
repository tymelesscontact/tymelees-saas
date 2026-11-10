-- Xyra — T10 : tables de l'Annuaire / Réseau (reseau_contacts, reseau_deals)
-- À exécuter UNIQUEMENT sur Supabase TEST (dqnqssezkvfbizkbaeeu), dans SQL Editor.
-- Script purement additif : crée les 2 tables si elles n'existent pas, ne touche à rien d'autre.
-- Colonnes déduites du code réel : app/api/annuaire/route.ts et app/modules/PageAnnuaire.tsx.
-- L'application lit/écrit avec la clé serveur (service role) et filtre toujours par tenant_id ;
-- RLS est activée SANS politique : aucun accès direct depuis le navigateur (clé anon / utilisateur).

create table if not exists public.reseau_contacts (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  nom         text not null,
  type        text,
  secteur     text,
  pays        text,
  ville       text,
  continent   text,
  tel         text,
  email       text,
  bio         text,
  created_at  timestamptz not null default now()
);
create index if not exists reseau_contacts_tenant_idx on public.reseau_contacts (tenant_id);

create table if not exists public.reseau_deals (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references public.tenants(id) on delete cascade,
  reseau_contact_id   uuid references public.reseau_contacts(id) on delete set null,
  club_membre_id      uuid,
  initiateur          text,
  notes               text,
  statut              text not null default 'demande_mise_en_relation'
                      check (statut in ('demande_mise_en_relation', 'valide', 'conclu')),
  valeur              numeric(12,2),
  commission_pct      numeric(5,2),
  commission_montant  numeric(12,2),
  commission_statut   text,
  created_at          timestamptz not null default now()
);
create index if not exists reseau_deals_tenant_idx on public.reseau_deals (tenant_id);
create index if not exists reseau_deals_contact_idx on public.reseau_deals (reseau_contact_id);

alter table public.reseau_contacts enable row level security;
alter table public.reseau_deals    enable row level security;

-- Vérification (doit renvoyer 2 lignes, rls = true) :
select relname as table_name, relrowsecurity as rls
from pg_class where relname in ('reseau_contacts', 'reseau_deals');
