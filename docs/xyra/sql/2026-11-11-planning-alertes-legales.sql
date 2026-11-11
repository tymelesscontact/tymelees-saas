-- Xyra — durée prévue des missions, nécessaire aux alertes légales de planning.
-- Script additif : à exécuter d'abord sur Supabase TEST, puis sur PROD après validation.

alter table public.missions add column if not exists duree text;

-- Vérification (doit renvoyer une ligne) :
select column_name, data_type from information_schema.columns
where table_schema = 'public' and table_name = 'missions' and column_name = 'duree';
