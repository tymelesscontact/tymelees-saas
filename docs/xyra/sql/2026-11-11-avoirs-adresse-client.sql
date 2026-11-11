-- Xyra — Avoirs (annulation d'une facture) + adresse du client sur les factures
-- Script purement additif. À exécuter sur Supabase TEST (dqnqssezkvfbizkbaeeu), puis PROD.

alter table public.factures add column if not exists client_adresse text;
alter table public.factures add column if not exists type_document text not null default 'facture';
alter table public.factures add column if not exists facture_origine_id uuid references public.factures(id) on delete restrict;
create index if not exists factures_origine_idx on public.factures (facture_origine_id);
-- Numéro de facture/avoir unique par entreprise (aucun doublon possible)
create unique index if not exists factures_tenant_numero_uniq on public.factures (tenant_id, numero);

-- Vérification (doit renvoyer 3 lignes) :
select column_name from information_schema.columns
where table_name = 'factures' and column_name in ('client_adresse', 'type_document', 'facture_origine_id');
