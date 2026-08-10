-- METRIC CMS — fresh-project schema (metric_ content prefix)
-- Locales: en | de
-- Auth / audit: unprefixed (admin_users, is_admin, admin_audit_log)
-- Idempotent: IF NOT EXISTS / DROP POLICY IF EXISTS / ON CONFLICT

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Auth helpers (UNPREFIXED)
-- ---------------------------------------------------------------------------

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  role text not null default 'editor' check (role in ('owner', 'editor')),
  display_name text not null default '',
  job_title text not null default '',
  avatar_url text not null default '',
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

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity text,
  entity_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_idx
  on public.admin_audit_log (created_at desc);

-- ---------------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------------

create table if not exists public.metric_projects (
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

create table if not exists public.metric_project_translations (
  project_id uuid not null references public.metric_projects (id) on delete cascade,
  locale text not null check (locale in ('en', 'de')),
  title text not null default '',
  description text not null default '',
  tags text[] not null default '{}',
  case_year text,
  case_task text,
  case_solution text,
  meta_title text not null default '',
  meta_description text not null default '',
  keywords text not null default '',
  og_image text not null default '',
  primary key (project_id, locale)
);

create table if not exists public.metric_project_blocks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.metric_projects (id) on delete cascade,
  type text not null check (type in ('gallery', 'before_after', 'youtube')),
  sort_order int not null default 0,
  youtube_url text,
  created_at timestamptz not null default now()
);

create index if not exists metric_project_blocks_project_idx
  on public.metric_project_blocks (project_id, sort_order);

create table if not exists public.metric_project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.metric_projects (id) on delete cascade,
  block_id uuid references public.metric_project_blocks (id) on delete cascade,
  kind text not null check (kind in ('hero', 'gallery', 'before', 'after', 'cover')),
  url text not null,
  sort_order int not null default 0,
  alt text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists metric_project_media_project_idx
  on public.metric_project_media (project_id, kind, sort_order);

create index if not exists metric_project_media_block_idx
  on public.metric_project_media (block_id, sort_order);

create unique index if not exists metric_project_media_one_before_per_block
  on public.metric_project_media (block_id)
  where kind = 'before' and block_id is not null;

create unique index if not exists metric_project_media_one_after_per_block
  on public.metric_project_media (block_id)
  where kind = 'after' and block_id is not null;

-- ---------------------------------------------------------------------------
-- Services / FAQ / process / benefits
-- ---------------------------------------------------------------------------

create table if not exists public.metric_services (
  id uuid primary key default gen_random_uuid(),
  service_key text not null unique,
  sort_order int not null default 0,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.metric_service_translations (
  service_id uuid not null references public.metric_services (id) on delete cascade,
  locale text not null check (locale in ('en', 'de')),
  title text not null default '',
  short_description text not null default '',
  full_description text not null default '',
  price text not null default '',
  duration text not null default '',
  primary key (service_id, locale)
);

create table if not exists public.metric_faq_items (
  id uuid primary key default gen_random_uuid(),
  sort_order int not null default 0,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.metric_faq_translations (
  faq_id uuid not null references public.metric_faq_items (id) on delete cascade,
  locale text not null check (locale in ('en', 'de')),
  question text not null default '',
  answer text not null default '',
  primary key (faq_id, locale)
);

create table if not exists public.metric_process_steps (
  id uuid primary key default gen_random_uuid(),
  step_number text not null default '',
  sort_order int not null default 0,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.metric_process_step_translations (
  step_id uuid not null references public.metric_process_steps (id) on delete cascade,
  locale text not null check (locale in ('en', 'de')),
  title text not null default '',
  description text not null default '',
  primary key (step_id, locale)
);

create table if not exists public.metric_benefits (
  id uuid primary key default gen_random_uuid(),
  sort_order int not null default 0,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.metric_benefit_translations (
  benefit_id uuid not null references public.metric_benefits (id) on delete cascade,
  locale text not null check (locale in ('en', 'de')),
  label text not null default '',
  primary key (benefit_id, locale)
);

-- ---------------------------------------------------------------------------
-- Agency / team / testimonials
-- ---------------------------------------------------------------------------

create table if not exists public.metric_team_members (
  id uuid primary key default gen_random_uuid(),
  sort_order int not null default 0,
  image text not null default '',
  image_object_position text,
  is_director boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.metric_team_member_translations (
  member_id uuid not null references public.metric_team_members (id) on delete cascade,
  locale text not null check (locale in ('en', 'de')),
  name text not null default '',
  role text not null default '',
  primary key (member_id, locale)
);

create table if not exists public.metric_testimonials (
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

create table if not exists public.metric_testimonial_translations (
  testimonial_id uuid not null references public.metric_testimonials (id) on delete cascade,
  locale text not null check (locale in ('en', 'de')),
  role text not null default '',
  quote text not null default '',
  primary key (testimonial_id, locale)
);

create table if not exists public.metric_agency_content (
  id int primary key default 1 check (id = 1),
  founded_year text not null default '2019',
  updated_at timestamptz not null default now()
);

create table if not exists public.metric_agency_translations (
  locale text primary key check (locale in ('en', 'de')),
  title text not null default '',
  title_line_1 text not null default '',
  title_line_2 text not null default '',
  paragraphs text[] not null default '{}',
  stats jsonb not null default '[]'::jsonb
);

-- ---------------------------------------------------------------------------
-- Homepage JSONB (payload mirrors getMetricHome() sections)
-- ---------------------------------------------------------------------------

create table if not exists public.metric_home (
  id int primary key default 1 check (id = 1),
  status text not null default 'published' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);

create table if not exists public.metric_home_translations (
  locale text primary key check (locale in ('en', 'de')),
  payload jsonb not null default '{}'::jsonb,
  why_us_title_line_1 text not null default '',
  why_us_title_line_2 text not null default '',
  updated_at timestamptz not null default now()
);

comment on column public.metric_home_translations.payload is
  'Homepage sections JSON mirroring getMetricHome(): hero, trust, categories, caseStudies, services, workflow, faq, nav, footer (why-us folded into payload when needed).';

-- ---------------------------------------------------------------------------
-- Site settings / SEO / leads
-- ---------------------------------------------------------------------------

create table if not exists public.metric_page_seo (
  locale text not null check (locale in ('en', 'de')),
  page_key text not null,
  title text not null default '',
  description text not null default '',
  og_image text,
  keywords text not null default '',
  noindex boolean not null default false,
  primary key (locale, page_key)
);

create table if not exists public.metric_site_settings (
  id int primary key default 1 check (id = 1),
  phone text not null default '',
  email text not null default '',
  telegram_url text not null default '',
  instagram_url text not null default '',
  linkedin_url text not null default '',
  x_url text not null default '',
  facebook_url text not null default '',
  presentation_url text not null default '',
  brief_url text not null default '',
  address_lines text[] not null default '{}',
  telegram_bot_token text not null default '',
  telegram_chat_ids text[] not null default '{}',
  telegram_notify_enabled boolean not null default false,
  telegram_webhook_secret text not null default '',
  captcha_provider text not null default 'none'
    check (captcha_provider in ('none', 'honeypot', 'turnstile', 'hcaptcha')),
  captcha_site_key text not null default '',
  captcha_secret_key text not null default '',
  yandex_metrika_id text not null default '',
  yandex_webmaster_verification text not null default '',
  google_analytics_id text not null default '',
  google_tag_manager_id text not null default '',
  google_site_verification text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.metric_site_settings_translations (
  locale text primary key check (locale in ('en', 'de')),
  address_lines text[] not null default '{}',
  presentation_url text not null default '',
  brief_url text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.metric_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  message text not null default '',
  attachment_url text,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  locale text check (locale is null or locale in ('en', 'de')),
  created_at timestamptz not null default now()
);

create index if not exists metric_leads_status_created_idx
  on public.metric_leads (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Singleton seed rows (safe upserts)
-- ---------------------------------------------------------------------------

insert into public.metric_home (id, status)
values (1, 'published')
on conflict (id) do nothing;

insert into public.metric_agency_content (id)
values (1)
on conflict (id) do nothing;

insert into public.metric_site_settings (id)
values (1)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

drop trigger if exists metric_projects_updated_at on public.metric_projects;
create trigger metric_projects_updated_at
  before update on public.metric_projects
  for each row execute function public.set_updated_at();

drop trigger if exists metric_services_updated_at on public.metric_services;
create trigger metric_services_updated_at
  before update on public.metric_services
  for each row execute function public.set_updated_at();

drop trigger if exists metric_faq_items_updated_at on public.metric_faq_items;
create trigger metric_faq_items_updated_at
  before update on public.metric_faq_items
  for each row execute function public.set_updated_at();

drop trigger if exists metric_process_steps_updated_at on public.metric_process_steps;
create trigger metric_process_steps_updated_at
  before update on public.metric_process_steps
  for each row execute function public.set_updated_at();

drop trigger if exists metric_benefits_updated_at on public.metric_benefits;
create trigger metric_benefits_updated_at
  before update on public.metric_benefits
  for each row execute function public.set_updated_at();

drop trigger if exists metric_team_members_updated_at on public.metric_team_members;
create trigger metric_team_members_updated_at
  before update on public.metric_team_members
  for each row execute function public.set_updated_at();

drop trigger if exists metric_testimonials_updated_at on public.metric_testimonials;
create trigger metric_testimonials_updated_at
  before update on public.metric_testimonials
  for each row execute function public.set_updated_at();

drop trigger if exists metric_agency_content_updated_at on public.metric_agency_content;
create trigger metric_agency_content_updated_at
  before update on public.metric_agency_content
  for each row execute function public.set_updated_at();

drop trigger if exists metric_home_updated_at on public.metric_home;
create trigger metric_home_updated_at
  before update on public.metric_home
  for each row execute function public.set_updated_at();

drop trigger if exists metric_home_translations_updated_at on public.metric_home_translations;
create trigger metric_home_translations_updated_at
  before update on public.metric_home_translations
  for each row execute function public.set_updated_at();

drop trigger if exists metric_site_settings_updated_at on public.metric_site_settings;
create trigger metric_site_settings_updated_at
  before update on public.metric_site_settings
  for each row execute function public.set_updated_at();

drop trigger if exists metric_site_settings_translations_updated_at
  on public.metric_site_settings_translations;
create trigger metric_site_settings_translations_updated_at
  before update on public.metric_site_settings_translations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.admin_users enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.metric_projects enable row level security;
alter table public.metric_project_translations enable row level security;
alter table public.metric_project_blocks enable row level security;
alter table public.metric_project_media enable row level security;
alter table public.metric_services enable row level security;
alter table public.metric_service_translations enable row level security;
alter table public.metric_faq_items enable row level security;
alter table public.metric_faq_translations enable row level security;
alter table public.metric_process_steps enable row level security;
alter table public.metric_process_step_translations enable row level security;
alter table public.metric_benefits enable row level security;
alter table public.metric_benefit_translations enable row level security;
alter table public.metric_team_members enable row level security;
alter table public.metric_team_member_translations enable row level security;
alter table public.metric_testimonials enable row level security;
alter table public.metric_testimonial_translations enable row level security;
alter table public.metric_agency_content enable row level security;
alter table public.metric_agency_translations enable row level security;
alter table public.metric_home enable row level security;
alter table public.metric_home_translations enable row level security;
alter table public.metric_page_seo enable row level security;
alter table public.metric_site_settings enable row level security;
alter table public.metric_site_settings_translations enable row level security;
alter table public.metric_leads enable row level security;

-- admin_users
drop policy if exists admin_users_select on public.admin_users;
create policy admin_users_select on public.admin_users for select
  using (public.is_admin() or user_id = auth.uid());

-- Writes gated by is_admin() (security definer) to avoid RLS recursion on admin_users.
drop policy if exists admin_users_admin_all on public.admin_users;
create policy admin_users_admin_all on public.admin_users for all
  using (public.is_admin()) with check (public.is_admin());

-- admin_audit_log
drop policy if exists admin_audit_log_owner_select on public.admin_audit_log;
create policy admin_audit_log_owner_select on public.admin_audit_log for select
  using (
    exists (
      select 1 from public.admin_users a
      where a.user_id = auth.uid() and a.role = 'owner'
    )
  );

drop policy if exists admin_audit_log_admin_insert on public.admin_audit_log;
create policy admin_audit_log_admin_insert on public.admin_audit_log for insert
  with check (public.is_admin());

-- metric_projects
drop policy if exists metric_projects_public_select on public.metric_projects;
create policy metric_projects_public_select on public.metric_projects for select
  using (status = 'published' or public.is_admin());

drop policy if exists metric_projects_admin_all on public.metric_projects;
create policy metric_projects_admin_all on public.metric_projects for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists metric_project_translations_public_select on public.metric_project_translations;
create policy metric_project_translations_public_select on public.metric_project_translations for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.metric_projects p
      where p.id = project_id and p.status = 'published'
    )
  );

drop policy if exists metric_project_translations_admin_all on public.metric_project_translations;
create policy metric_project_translations_admin_all on public.metric_project_translations for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists metric_project_blocks_public_select on public.metric_project_blocks;
create policy metric_project_blocks_public_select on public.metric_project_blocks for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.metric_projects p
      where p.id = project_id and p.status = 'published'
    )
  );

drop policy if exists metric_project_blocks_admin_all on public.metric_project_blocks;
create policy metric_project_blocks_admin_all on public.metric_project_blocks for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists metric_project_media_public_select on public.metric_project_media;
create policy metric_project_media_public_select on public.metric_project_media for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.metric_projects p
      where p.id = project_id and p.status = 'published'
    )
  );

drop policy if exists metric_project_media_admin_all on public.metric_project_media;
create policy metric_project_media_admin_all on public.metric_project_media for all
  using (public.is_admin()) with check (public.is_admin());

-- services
drop policy if exists metric_services_public_select on public.metric_services;
create policy metric_services_public_select on public.metric_services for select
  using (status = 'published' or public.is_admin());

drop policy if exists metric_services_admin_all on public.metric_services;
create policy metric_services_admin_all on public.metric_services for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists metric_service_translations_public_select on public.metric_service_translations;
create policy metric_service_translations_public_select on public.metric_service_translations for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.metric_services s
      where s.id = service_id and s.status = 'published'
    )
  );

drop policy if exists metric_service_translations_admin_all on public.metric_service_translations;
create policy metric_service_translations_admin_all on public.metric_service_translations for all
  using (public.is_admin()) with check (public.is_admin());

-- faq
drop policy if exists metric_faq_public_select on public.metric_faq_items;
create policy metric_faq_public_select on public.metric_faq_items for select
  using (status = 'published' or public.is_admin());

drop policy if exists metric_faq_admin_all on public.metric_faq_items;
create policy metric_faq_admin_all on public.metric_faq_items for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists metric_faq_translations_public_select on public.metric_faq_translations;
create policy metric_faq_translations_public_select on public.metric_faq_translations for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.metric_faq_items f
      where f.id = faq_id and f.status = 'published'
    )
  );

drop policy if exists metric_faq_translations_admin_all on public.metric_faq_translations;
create policy metric_faq_translations_admin_all on public.metric_faq_translations for all
  using (public.is_admin()) with check (public.is_admin());

-- process
drop policy if exists metric_process_public_select on public.metric_process_steps;
create policy metric_process_public_select on public.metric_process_steps for select
  using (status = 'published' or public.is_admin());

drop policy if exists metric_process_admin_all on public.metric_process_steps;
create policy metric_process_admin_all on public.metric_process_steps for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists metric_process_translations_public_select
  on public.metric_process_step_translations;
create policy metric_process_translations_public_select
  on public.metric_process_step_translations for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.metric_process_steps s
      where s.id = step_id and s.status = 'published'
    )
  );

drop policy if exists metric_process_translations_admin_all
  on public.metric_process_step_translations;
create policy metric_process_translations_admin_all
  on public.metric_process_step_translations for all
  using (public.is_admin()) with check (public.is_admin());

-- benefits
drop policy if exists metric_benefits_public_select on public.metric_benefits;
create policy metric_benefits_public_select on public.metric_benefits for select
  using (status = 'published' or public.is_admin());

drop policy if exists metric_benefits_admin_all on public.metric_benefits;
create policy metric_benefits_admin_all on public.metric_benefits for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists metric_benefit_translations_public_select
  on public.metric_benefit_translations;
create policy metric_benefit_translations_public_select
  on public.metric_benefit_translations for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.metric_benefits b
      where b.id = benefit_id and b.status = 'published'
    )
  );

drop policy if exists metric_benefit_translations_admin_all
  on public.metric_benefit_translations;
create policy metric_benefit_translations_admin_all
  on public.metric_benefit_translations for all
  using (public.is_admin()) with check (public.is_admin());

-- team
drop policy if exists metric_team_public_select on public.metric_team_members;
create policy metric_team_public_select on public.metric_team_members for select
  using (status = 'published' or public.is_admin());

drop policy if exists metric_team_admin_all on public.metric_team_members;
create policy metric_team_admin_all on public.metric_team_members for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists metric_team_translations_public_select
  on public.metric_team_member_translations;
create policy metric_team_translations_public_select
  on public.metric_team_member_translations for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.metric_team_members m
      where m.id = member_id and m.status = 'published'
    )
  );

drop policy if exists metric_team_translations_admin_all
  on public.metric_team_member_translations;
create policy metric_team_translations_admin_all
  on public.metric_team_member_translations for all
  using (public.is_admin()) with check (public.is_admin());

-- testimonials
drop policy if exists metric_testimonials_public_select on public.metric_testimonials;
create policy metric_testimonials_public_select on public.metric_testimonials for select
  using (status = 'published' or public.is_admin());

drop policy if exists metric_testimonials_admin_all on public.metric_testimonials;
create policy metric_testimonials_admin_all on public.metric_testimonials for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists metric_testimonial_translations_public_select
  on public.metric_testimonial_translations;
create policy metric_testimonial_translations_public_select
  on public.metric_testimonial_translations for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.metric_testimonials t
      where t.id = testimonial_id and t.status = 'published'
    )
  );

drop policy if exists metric_testimonial_translations_admin_all
  on public.metric_testimonial_translations;
create policy metric_testimonial_translations_admin_all
  on public.metric_testimonial_translations for all
  using (public.is_admin()) with check (public.is_admin());

-- agency (public read)
drop policy if exists metric_agency_content_public_select on public.metric_agency_content;
create policy metric_agency_content_public_select on public.metric_agency_content
  for select using (true);

drop policy if exists metric_agency_content_admin_all on public.metric_agency_content;
create policy metric_agency_content_admin_all on public.metric_agency_content for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists metric_agency_translations_public_select on public.metric_agency_translations;
create policy metric_agency_translations_public_select on public.metric_agency_translations
  for select using (true);

drop policy if exists metric_agency_translations_admin_all on public.metric_agency_translations;
create policy metric_agency_translations_admin_all on public.metric_agency_translations for all
  using (public.is_admin()) with check (public.is_admin());

-- homepage (published or admin)
drop policy if exists metric_home_public_select on public.metric_home;
create policy metric_home_public_select on public.metric_home for select
  using (status = 'published' or public.is_admin());

drop policy if exists metric_home_admin_all on public.metric_home;
create policy metric_home_admin_all on public.metric_home for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists metric_home_translations_public_select on public.metric_home_translations;
create policy metric_home_translations_public_select on public.metric_home_translations for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.metric_home h
      where h.id = 1 and h.status = 'published'
    )
  );

drop policy if exists metric_home_translations_admin_all on public.metric_home_translations;
create policy metric_home_translations_admin_all on public.metric_home_translations for all
  using (public.is_admin()) with check (public.is_admin());

-- page seo / site settings (public read)
drop policy if exists metric_page_seo_public_select on public.metric_page_seo;
create policy metric_page_seo_public_select on public.metric_page_seo
  for select using (true);

drop policy if exists metric_page_seo_admin_all on public.metric_page_seo;
create policy metric_page_seo_admin_all on public.metric_page_seo for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists metric_site_settings_public_select on public.metric_site_settings;
create policy metric_site_settings_public_select on public.metric_site_settings
  for select using (true);

drop policy if exists metric_site_settings_admin_all on public.metric_site_settings;
create policy metric_site_settings_admin_all on public.metric_site_settings for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists metric_site_settings_translations_public_select
  on public.metric_site_settings_translations;
create policy metric_site_settings_translations_public_select
  on public.metric_site_settings_translations for select using (true);

drop policy if exists metric_site_settings_translations_admin_all
  on public.metric_site_settings_translations;
create policy metric_site_settings_translations_admin_all
  on public.metric_site_settings_translations for all
  using (public.is_admin()) with check (public.is_admin());

-- leads
drop policy if exists metric_leads_anon_insert on public.metric_leads;
create policy metric_leads_anon_insert on public.metric_leads for insert
  with check (true);

drop policy if exists metric_leads_admin_select on public.metric_leads;
create policy metric_leads_admin_select on public.metric_leads for select
  using (public.is_admin());

drop policy if exists metric_leads_admin_update on public.metric_leads;
create policy metric_leads_admin_update on public.metric_leads for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists metric_leads_admin_delete on public.metric_leads;
create policy metric_leads_admin_delete on public.metric_leads for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: metric-media bucket (public read, admin write)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'metric-media',
  'metric-media',
  true,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
    'image/svg+xml'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists metric_media_public_read on storage.objects;
create policy metric_media_public_read on storage.objects for select
  using (bucket_id = 'metric-media');

drop policy if exists metric_media_admin_insert on storage.objects;
create policy metric_media_admin_insert on storage.objects for insert
  with check (bucket_id = 'metric-media' and public.is_admin());

drop policy if exists metric_media_admin_update on storage.objects;
create policy metric_media_admin_update on storage.objects for update
  using (bucket_id = 'metric-media' and public.is_admin())
  with check (bucket_id = 'metric-media' and public.is_admin());

drop policy if exists metric_media_admin_delete on storage.objects;
create policy metric_media_admin_delete on storage.objects for delete
  using (bucket_id = 'metric-media' and public.is_admin());
