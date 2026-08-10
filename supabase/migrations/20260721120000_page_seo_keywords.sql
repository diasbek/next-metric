-- Per-page meta keywords for CMS SEO settings
alter table public.page_seo
  add column if not exists keywords text not null default '';
