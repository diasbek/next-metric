-- Case constructor: ordered content blocks + per-locale SEO + OG override.

-- ---------------------------------------------------------------------------
-- project_blocks
-- ---------------------------------------------------------------------------
create table if not exists public.project_blocks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  type text not null check (type in ('gallery', 'before_after', 'youtube')),
  sort_order int not null default 0,
  youtube_url text,
  created_at timestamptz not null default now()
);

create index if not exists project_blocks_project_idx
  on public.project_blocks (project_id, sort_order);

alter table public.project_blocks enable row level security;

drop policy if exists project_blocks_public_select on public.project_blocks;
create policy project_blocks_public_select on public.project_blocks for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.status = 'published'
    )
  );

drop policy if exists project_blocks_admin_all on public.project_blocks;
create policy project_blocks_admin_all on public.project_blocks for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Attach media to blocks
-- ---------------------------------------------------------------------------
alter table public.project_media
  add column if not exists block_id uuid references public.project_blocks (id) on delete cascade;

create index if not exists project_media_block_idx
  on public.project_media (block_id, sort_order);

-- Replace per-project before/after uniqueness with per-block
drop index if exists public.project_media_one_before_per_project;
drop index if exists public.project_media_one_after_per_project;

create unique index if not exists project_media_one_before_per_block
  on public.project_media (block_id)
  where kind = 'before' and block_id is not null;

create unique index if not exists project_media_one_after_per_block
  on public.project_media (block_id)
  where kind = 'after' and block_id is not null;

-- ---------------------------------------------------------------------------
-- Backfill blocks from existing media
-- ---------------------------------------------------------------------------
-- before_after: one block per project that has before and/or after
insert into public.project_blocks (project_id, type, sort_order)
select distinct pm.project_id, 'before_after', 0
from public.project_media pm
where pm.kind in ('before', 'after')
  and not exists (
    select 1 from public.project_blocks b
    where b.project_id = pm.project_id and b.type = 'before_after'
  );

update public.project_media pm
set block_id = b.id
from public.project_blocks b
where b.project_id = pm.project_id
  and b.type = 'before_after'
  and pm.kind in ('before', 'after')
  and pm.block_id is null;

-- gallery: one block per project that has gallery images
insert into public.project_blocks (project_id, type, sort_order)
select distinct pm.project_id, 'gallery', 1
from public.project_media pm
where pm.kind = 'gallery'
  and not exists (
    select 1 from public.project_blocks b
    where b.project_id = pm.project_id and b.type = 'gallery'
  );

update public.project_media pm
set block_id = b.id
from public.project_blocks b
where b.project_id = pm.project_id
  and b.type = 'gallery'
  and pm.kind = 'gallery'
  and pm.block_id is null;

-- ---------------------------------------------------------------------------
-- SEO fields
-- ---------------------------------------------------------------------------
alter table public.project_translations
  add column if not exists meta_title text not null default '',
  add column if not exists meta_description text not null default '',
  add column if not exists keywords text not null default '';

alter table public.projects
  add column if not exists og_image text not null default '',
  add column if not exists seo_indexable boolean not null default true;

comment on column public.project_translations.meta_title is
  'SEO title override; empty falls back to title.';
comment on column public.project_translations.meta_description is
  'SEO description override; empty falls back to description.';
comment on column public.project_translations.keywords is
  'Comma-separated keywords for meta keywords.';
comment on column public.projects.og_image is
  'Optional OG image override; empty uses dynamic /og route.';
comment on column public.projects.seo_indexable is
  'When false, case page is noindex.';
