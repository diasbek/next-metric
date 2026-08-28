-- Taxonomy for works filters: By category / By type.
-- metric_tags + translations + project junction. Does not drop sphere/tags columns
-- (kept as denormalized cache for cards until app layer syncs from junction).

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.metric_tags (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('category', 'type')),
  slug text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, slug)
);

create index if not exists metric_tags_kind_sort_idx
  on public.metric_tags (kind, sort_order);

create table if not exists public.metric_tag_translations (
  tag_id uuid not null references public.metric_tags (id) on delete cascade,
  locale text not null check (locale in ('en', 'de')),
  label text not null default '',
  primary key (tag_id, locale)
);

create table if not exists public.metric_project_tags (
  project_id uuid not null references public.metric_projects (id) on delete cascade,
  tag_id uuid not null references public.metric_tags (id) on delete cascade,
  primary key (project_id, tag_id)
);

create index if not exists metric_project_tags_tag_idx
  on public.metric_project_tags (tag_id);

comment on table public.metric_tags is
  'Works filter taxonomy: category (By category) and type (By type)';
comment on column public.metric_tags.slug is
  'Stable filter/query value (English), unique per kind';
comment on table public.metric_project_tags is
  'M2M assignment of taxonomy tags to cases';

-- ---------------------------------------------------------------------------
-- Seed (from historic src/data/filters.ts)
-- ---------------------------------------------------------------------------

with seed (kind, slug, sort_order, label_en, label_de) as (
  values
    ('category', 'Agriculture', 10, 'Agriculture', 'Landwirtschaft'),
    ('category', 'Home', 20, 'Home', 'Home'),
    ('category', 'Beauty', 30, 'Beauty', 'Beauty'),
    ('category', 'Electronics', 40, 'Electronics', 'Elektronik'),
    ('type', 'Listing', 10, 'Listing', 'Listing'),
    ('type', 'Premium A+', 20, 'Premium A+', 'Premium A+'),
    ('type', 'Brand Store', 30, 'Brand Store', 'Brand Store')
),
ins as (
  insert into public.metric_tags (kind, slug, sort_order, is_active)
  select kind, slug, sort_order, true
  from seed
  on conflict (kind, slug) do update
    set sort_order = excluded.sort_order,
        is_active = true,
        updated_at = now()
  returning id, kind, slug
)
insert into public.metric_tag_translations (tag_id, locale, label)
select i.id, v.locale, v.label
from ins i
join seed s on s.kind = i.kind and s.slug = i.slug
cross join lateral (
  values
    ('en', s.label_en),
    ('de', s.label_de)
) as v(locale, label)
on conflict (tag_id, locale) do update
  set label = excluded.label;

-- ---------------------------------------------------------------------------
-- Backfill from metric_projects.sphere + metric_project_translations.tags
-- ---------------------------------------------------------------------------

-- Category from sphere (case-insensitive slug match)
insert into public.metric_project_tags (project_id, tag_id)
select distinct p.id, t.id
from public.metric_projects p
join public.metric_tags t
  on t.kind = 'category'
 and lower(t.slug) = lower(trim(p.sphere))
where trim(coalesce(p.sphere, '')) <> ''
on conflict do nothing;

-- Any matching tag slug found in translation.tags[]
insert into public.metric_project_tags (project_id, tag_id)
select distinct tr.project_id, t.id
from public.metric_project_translations tr
cross join lateral unnest(tr.tags) as tag_value(raw)
join public.metric_tags t
  on lower(t.slug) = lower(trim(tag_value.raw))
where trim(coalesce(tag_value.raw, '')) <> ''
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.metric_tags enable row level security;
alter table public.metric_tag_translations enable row level security;
alter table public.metric_project_tags enable row level security;

drop policy if exists metric_tags_public_select on public.metric_tags;
create policy metric_tags_public_select on public.metric_tags for select
  using (is_active = true or public.metric_is_admin());

drop policy if exists metric_tags_admin_all on public.metric_tags;
create policy metric_tags_admin_all on public.metric_tags for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_tag_translations_public_select on public.metric_tag_translations;
create policy metric_tag_translations_public_select on public.metric_tag_translations for select
  using (
    public.metric_is_admin()
    or exists (
      select 1 from public.metric_tags t
      where t.id = tag_id and t.is_active = true
    )
  );

drop policy if exists metric_tag_translations_admin_all on public.metric_tag_translations;
create policy metric_tag_translations_admin_all on public.metric_tag_translations for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_project_tags_public_select on public.metric_project_tags;
create policy metric_project_tags_public_select on public.metric_project_tags for select
  using (
    public.metric_is_admin()
    or exists (
      select 1 from public.metric_projects p
      where p.id = project_id and p.status = 'published'
    )
  );

drop policy if exists metric_project_tags_admin_all on public.metric_project_tags;
create policy metric_project_tags_admin_all on public.metric_project_tags for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

grant select on public.metric_tags to anon, authenticated;
grant select on public.metric_tag_translations to anon, authenticated;
grant select on public.metric_project_tags to anon, authenticated;
grant all on public.metric_tags to authenticated;
grant all on public.metric_tag_translations to authenticated;
grant all on public.metric_project_tags to authenticated;
