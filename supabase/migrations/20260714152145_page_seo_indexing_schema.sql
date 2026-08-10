-- Page SEO: per-page indexing + JSON-LD schema controls
-- Used by page-based CMS (Home / Agency / Works / Services / Contacts)

alter table public.page_seo
  add column if not exists indexable boolean not null default true;

alter table public.page_seo
  add column if not exists schema_type text not null default 'WebPage';

alter table public.page_seo
  add column if not exists schema_extra jsonb not null default '{}'::jsonb;

alter table public.page_seo
  drop constraint if exists page_seo_schema_type_check;

alter table public.page_seo
  add constraint page_seo_schema_type_check
  check (
    schema_type in (
      'none',
      'WebPage',
      'FAQPage',
      'ItemList',
      'OfferCatalog',
      'LocalBusiness',
      'CreativeWork'
    )
  );

-- Sensible defaults per public page
update public.page_seo set schema_type = 'WebPage' where page_key = 'home' and schema_type = 'WebPage';
update public.page_seo set schema_type = 'FAQPage' where page_key = 'agency';
update public.page_seo set schema_type = 'ItemList' where page_key = 'works';
update public.page_seo set schema_type = 'OfferCatalog' where page_key = 'services';
update public.page_seo set schema_type = 'LocalBusiness' where page_key = 'contacts';

-- Case pages: allow noindex per project
alter table public.projects
  add column if not exists seo_indexable boolean not null default true;

comment on column public.page_seo.indexable is 'When false, robots noindex for this page (still blocked site-wide off production hosts).';
comment on column public.page_seo.schema_type is 'JSON-LD schema builder key for public pages.';
comment on column public.page_seo.schema_extra is 'Optional overrides for schema fields (name, etc.).';
comment on column public.projects.seo_indexable is 'When false, case page /works/[slug] is noindex.';
