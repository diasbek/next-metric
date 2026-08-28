-- Align migrations with production: case card fields on project translations.

alter table public.metric_project_translations
  add column if not exists author text not null default '';

alter table public.metric_project_translations
  add column if not exists role text not null default '';

alter table public.metric_project_translations
  add column if not exists quote text not null default '';
