-- Ordered client reviews per Metric case (multi-review).

create table if not exists public.metric_project_reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.metric_projects (id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists metric_project_reviews_project_idx
  on public.metric_project_reviews (project_id, sort_order);

create table if not exists public.metric_project_review_translations (
  review_id uuid not null references public.metric_project_reviews (id) on delete cascade,
  locale text not null check (locale in ('en', 'de')),
  author text not null default '',
  role text not null default '',
  quote text not null default '',
  primary key (review_id, locale)
);

drop trigger if exists metric_project_reviews_updated_at on public.metric_project_reviews;
create trigger metric_project_reviews_updated_at
  before update on public.metric_project_reviews
  for each row execute function public.set_updated_at();

alter table public.metric_project_reviews enable row level security;
alter table public.metric_project_review_translations enable row level security;

drop policy if exists metric_project_reviews_public_select on public.metric_project_reviews;
create policy metric_project_reviews_public_select on public.metric_project_reviews for select
  using (
    public.metric_is_admin()
    or exists (
      select 1 from public.metric_projects p
      where p.id = project_id and p.status = 'published'
    )
  );

drop policy if exists metric_project_reviews_admin_all on public.metric_project_reviews;
create policy metric_project_reviews_admin_all on public.metric_project_reviews for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_project_review_translations_public_select
  on public.metric_project_review_translations;
create policy metric_project_review_translations_public_select
  on public.metric_project_review_translations for select
  using (
    public.metric_is_admin()
    or exists (
      select 1
      from public.metric_project_reviews r
      join public.metric_projects p on p.id = r.project_id
      where r.id = review_id and p.status = 'published'
    )
  );

drop policy if exists metric_project_review_translations_admin_all
  on public.metric_project_review_translations;
create policy metric_project_review_translations_admin_all
  on public.metric_project_review_translations for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

-- Backfill one review per project that already has quote/author/role copy.
insert into public.metric_project_reviews (project_id, sort_order)
select p.id, 0
from public.metric_projects p
where exists (
  select 1
  from public.metric_project_translations t
  where t.project_id = p.id
    and (
      nullif(btrim(coalesce(t.author, '')), '') is not null
      or nullif(btrim(coalesce(t.role, '')), '') is not null
      or nullif(btrim(coalesce(t.quote, '')), '') is not null
    )
)
and not exists (
  select 1 from public.metric_project_reviews r where r.project_id = p.id
);

insert into public.metric_project_review_translations (review_id, locale, author, role, quote)
select r.id, t.locale, coalesce(t.author, ''), coalesce(t.role, ''), coalesce(t.quote, '')
from public.metric_project_reviews r
join public.metric_project_translations t on t.project_id = r.project_id
on conflict (review_id, locale) do update
  set
    author = excluded.author,
    role = excluded.role,
    quote = excluded.quote;
