-- Ensure project-level OG + indexability columns exist on metric_projects
-- (already present in production; keep repo migrations in sync).

alter table public.metric_projects
  add column if not exists og_image text not null default '';

alter table public.metric_projects
  add column if not exists seo_indexable boolean not null default true;

comment on column public.metric_projects.og_image is
  'Optional case OG image URL (falls back to cover / dynamic OG)';
comment on column public.metric_projects.seo_indexable is
  'When false, /works/[slug] is noindex and omitted from sitemap';
