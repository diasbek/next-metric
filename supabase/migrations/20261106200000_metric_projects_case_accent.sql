-- Optional per-case accent colour for public case chrome (concept site `acc`).
alter table public.metric_projects
  add column if not exists case_accent text not null default '';
