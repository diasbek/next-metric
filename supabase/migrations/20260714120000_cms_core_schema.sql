-- METRIC CMS — core schema
-- Safe to re-run on a fresh Supabase project (idempotent where possible).
-- Locales: ru | uz | en

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Auth helpers
-- ---------------------------------------------------------------------------

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  role text not null default 'editor' check (role in ('owner', 'editor')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------------

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published')),
  sort_order int not null default 0,
  sphere text not null default '',
  featured boolean not null default false,
  cover_image text not null default '',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_translations (
  project_id uuid not null references public.projects (id) on delete cascade,
  locale text not null check (locale in ('ru', 'uz', 'en')),
  title text not null default '',
  description text not null default '',
  tags text[] not null default '{}',
  case_year text,
  case_task text,
  case_solution text,
  primary key (project_id, locale)
);

create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  kind text not null check (kind in ('hero', 'gallery', 'before', 'after', 'cover')),
  url text not null,
  sort_order int not null default 0,
  alt text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists project_media_project_idx
  on public.project_media (project_id, kind, sort_order);

-- ---------------------------------------------------------------------------
-- Services / FAQ / process / benefits
-- ---------------------------------------------------------------------------

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  service_key text not null unique,
  sort_order int not null default 0,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_translations (
  service_id uuid not null references public.services (id) on delete cascade,
  locale text not null check (locale in ('ru', 'uz', 'en')),
  title text not null default '',
  short_description text not null default '',
  full_description text not null default '',
  price text not null default '',
  duration text not null default '',
  primary key (service_id, locale)
);

create table if not exists public.faq_items (
  id uuid primary key default gen_random_uuid(),
  sort_order int not null default 0,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faq_translations (
  faq_id uuid not null references public.faq_items (id) on delete cascade,
  locale text not null check (locale in ('ru', 'uz', 'en')),
  question text not null default '',
  answer text not null default '',
  primary key (faq_id, locale)
);

create table if not exists public.process_steps (
  id uuid primary key default gen_random_uuid(),
  step_number text not null default '',
  sort_order int not null default 0,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.process_step_translations (
  step_id uuid not null references public.process_steps (id) on delete cascade,
  locale text not null check (locale in ('ru', 'uz', 'en')),
  title text not null default '',
  description text not null default '',
  primary key (step_id, locale)
);

create table if not exists public.benefits (
  id uuid primary key default gen_random_uuid(),
  sort_order int not null default 0,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.benefit_translations (
  benefit_id uuid not null references public.benefits (id) on delete cascade,
  locale text not null check (locale in ('ru', 'uz', 'en')),
  label text not null default '',
  primary key (benefit_id, locale)
);

-- ---------------------------------------------------------------------------
-- Agency / team / testimonials
-- ---------------------------------------------------------------------------

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  sort_order int not null default 0,
  image text not null default '',
  image_object_position text,
  is_director boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_member_translations (
  member_id uuid not null references public.team_members (id) on delete cascade,
  locale text not null check (locale in ('ru', 'uz', 'en')),
  name text not null default '',
  role text not null default '',
  primary key (member_id, locale)
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  sort_order int not null default 0,
  person_image text not null default '',
  person_object_position text,
  logo_image text not null default '',
  logo_rounded text check (logo_rounded is null or logo_rounded in ('full', 'lg')),
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonial_translations (
  testimonial_id uuid not null references public.testimonials (id) on delete cascade,
  locale text not null check (locale in ('ru', 'uz', 'en')),
  role text not null default '',
  quote text not null default '',
  primary key (testimonial_id, locale)
);

create table if not exists public.agency_content (
  id int primary key default 1 check (id = 1),
  founded_year text not null default '2019',
  updated_at timestamptz not null default now()
);

create table if not exists public.agency_translations (
  locale text primary key check (locale in ('ru', 'uz', 'en')),
  title text not null default '',
  title_line_1 text not null default '',
  title_line_2 text not null default '',
  paragraphs text[] not null default '{}',
  stats jsonb not null default '[]'::jsonb
);

-- ---------------------------------------------------------------------------
-- Site settings / SEO / leads
-- ---------------------------------------------------------------------------

create table if not exists public.page_seo (
  locale text not null check (locale in ('ru', 'uz', 'en')),
  page_key text not null,
  title text not null default '',
  description text not null default '',
  og_image text,
  primary key (locale, page_key)
);

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  phone text not null default '',
  email text not null default '',
  telegram_url text not null default '',
  instagram_url text not null default '',
  presentation_url text not null default '',
  brief_url text not null default '',
  address_lines text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  message text not null default '',
  attachment_url text,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  locale text,
  created_at timestamptz not null default now()
);

create index if not exists leads_status_created_idx
  on public.leads (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists services_updated_at on public.services;
create trigger services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.admin_users enable row level security;
alter table public.projects enable row level security;
alter table public.project_translations enable row level security;
alter table public.project_media enable row level security;
alter table public.services enable row level security;
alter table public.service_translations enable row level security;
alter table public.faq_items enable row level security;
alter table public.faq_translations enable row level security;
alter table public.process_steps enable row level security;
alter table public.process_step_translations enable row level security;
alter table public.benefits enable row level security;
alter table public.benefit_translations enable row level security;
alter table public.team_members enable row level security;
alter table public.team_member_translations enable row level security;
alter table public.testimonials enable row level security;
alter table public.testimonial_translations enable row level security;
alter table public.agency_content enable row level security;
alter table public.agency_translations enable row level security;
alter table public.page_seo enable row level security;
alter table public.site_settings enable row level security;
alter table public.leads enable row level security;

drop policy if exists admin_users_select on public.admin_users;
create policy admin_users_select on public.admin_users for select
  using (public.is_admin() or user_id = auth.uid());

drop policy if exists projects_public_select on public.projects;
create policy projects_public_select on public.projects for select
  using (status = 'published' or public.is_admin());

drop policy if exists project_translations_public_select on public.project_translations;
create policy project_translations_public_select on public.project_translations for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.status = 'published'
    )
  );

drop policy if exists project_media_public_select on public.project_media;
create policy project_media_public_select on public.project_media for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.status = 'published'
    )
  );

drop policy if exists projects_admin_all on public.projects;
create policy projects_admin_all on public.projects for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists project_translations_admin_all on public.project_translations;
create policy project_translations_admin_all on public.project_translations for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists project_media_admin_all on public.project_media;
create policy project_media_admin_all on public.project_media for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists services_public_select on public.services;
create policy services_public_select on public.services for select
  using (status = 'published' or public.is_admin());
drop policy if exists services_admin_all on public.services;
create policy services_admin_all on public.services for all
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists service_translations_public_select on public.service_translations;
create policy service_translations_public_select on public.service_translations for select
  using (
    public.is_admin()
    or exists (select 1 from public.services s where s.id = service_id and s.status = 'published')
  );
drop policy if exists service_translations_admin_all on public.service_translations;
create policy service_translations_admin_all on public.service_translations for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists faq_public_select on public.faq_items;
create policy faq_public_select on public.faq_items for select
  using (status = 'published' or public.is_admin());
drop policy if exists faq_admin_all on public.faq_items;
create policy faq_admin_all on public.faq_items for all
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists faq_translations_public_select on public.faq_translations;
create policy faq_translations_public_select on public.faq_translations for select
  using (
    public.is_admin()
    or exists (select 1 from public.faq_items f where f.id = faq_id and f.status = 'published')
  );
drop policy if exists faq_translations_admin_all on public.faq_translations;
create policy faq_translations_admin_all on public.faq_translations for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists process_public_select on public.process_steps;
create policy process_public_select on public.process_steps for select
  using (status = 'published' or public.is_admin());
drop policy if exists process_admin_all on public.process_steps;
create policy process_admin_all on public.process_steps for all
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists process_translations_public_select on public.process_step_translations;
create policy process_translations_public_select on public.process_step_translations for select
  using (
    public.is_admin()
    or exists (select 1 from public.process_steps s where s.id = step_id and s.status = 'published')
  );
drop policy if exists process_translations_admin_all on public.process_step_translations;
create policy process_translations_admin_all on public.process_step_translations for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists benefits_public_select on public.benefits;
create policy benefits_public_select on public.benefits for select
  using (status = 'published' or public.is_admin());
drop policy if exists benefits_admin_all on public.benefits;
create policy benefits_admin_all on public.benefits for all
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists benefit_translations_public_select on public.benefit_translations;
create policy benefit_translations_public_select on public.benefit_translations for select
  using (
    public.is_admin()
    or exists (select 1 from public.benefits b where b.id = benefit_id and b.status = 'published')
  );
drop policy if exists benefit_translations_admin_all on public.benefit_translations;
create policy benefit_translations_admin_all on public.benefit_translations for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists team_public_select on public.team_members;
create policy team_public_select on public.team_members for select
  using (status = 'published' or public.is_admin());
drop policy if exists team_admin_all on public.team_members;
create policy team_admin_all on public.team_members for all
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists team_translations_public_select on public.team_member_translations;
create policy team_translations_public_select on public.team_member_translations for select
  using (
    public.is_admin()
    or exists (select 1 from public.team_members m where m.id = member_id and m.status = 'published')
  );
drop policy if exists team_translations_admin_all on public.team_member_translations;
create policy team_translations_admin_all on public.team_member_translations for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists testimonials_public_select on public.testimonials;
create policy testimonials_public_select on public.testimonials for select
  using (status = 'published' or public.is_admin());
drop policy if exists testimonials_admin_all on public.testimonials;
create policy testimonials_admin_all on public.testimonials for all
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists testimonial_translations_public_select on public.testimonial_translations;
create policy testimonial_translations_public_select on public.testimonial_translations for select
  using (
    public.is_admin()
    or exists (select 1 from public.testimonials t where t.id = testimonial_id and t.status = 'published')
  );
drop policy if exists testimonial_translations_admin_all on public.testimonial_translations;
create policy testimonial_translations_admin_all on public.testimonial_translations for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists agency_content_public_select on public.agency_content;
create policy agency_content_public_select on public.agency_content for select using (true);
drop policy if exists agency_content_admin_all on public.agency_content;
create policy agency_content_admin_all on public.agency_content for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists agency_translations_public_select on public.agency_translations;
create policy agency_translations_public_select on public.agency_translations for select using (true);
drop policy if exists agency_translations_admin_all on public.agency_translations;
create policy agency_translations_admin_all on public.agency_translations for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists page_seo_public_select on public.page_seo;
create policy page_seo_public_select on public.page_seo for select using (true);
drop policy if exists page_seo_admin_all on public.page_seo;
create policy page_seo_admin_all on public.page_seo for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists site_settings_public_select on public.site_settings;
create policy site_settings_public_select on public.site_settings for select using (true);
drop policy if exists site_settings_admin_all on public.site_settings;
create policy site_settings_admin_all on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists leads_anon_insert on public.leads;
create policy leads_anon_insert on public.leads for insert
  with check (true);
drop policy if exists leads_admin_select on public.leads;
create policy leads_admin_select on public.leads for select
  using (public.is_admin());
drop policy if exists leads_admin_update on public.leads;
create policy leads_admin_update on public.leads for update
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists leads_admin_delete on public.leads;
create policy leads_admin_delete on public.leads for delete
  using (public.is_admin());
