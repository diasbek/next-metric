-- Metric auth/audit separation from Timsol (unprefixed admin_*)
-- Timsol keeps: admin_users, admin_audit_log, is_admin()
-- Metric uses:  metric_admin_users, metric_admin_audit_log, metric_is_admin()

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Metric admin tables
-- ---------------------------------------------------------------------------

create table if not exists public.metric_admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  role text not null default 'editor' check (role in ('owner', 'editor')),
  display_name text not null default '',
  job_title text not null default '',
  avatar_url text not null default '',
  bio text not null default '',
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.metric_admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity text,
  entity_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists metric_admin_audit_log_created_idx
  on public.metric_admin_audit_log (created_at desc);

create or replace function public.metric_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.metric_admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.metric_is_admin() from public;
grant execute on function public.metric_is_admin() to anon, authenticated;

-- Seed Metric admins from shared admin_users (idempotent copy)
insert into public.metric_admin_users (
  user_id, email, role, display_name, job_title, avatar_url, created_at
)
select
  a.user_id,
  a.email,
  a.role,
  coalesce(a.display_name, ''),
  coalesce(a.job_title, ''),
  coalesce(a.avatar_url, ''),
  a.created_at
from public.admin_users a
on conflict (user_id) do nothing;

alter table public.metric_admin_users enable row level security;
alter table public.metric_admin_audit_log enable row level security;

drop policy if exists metric_admin_users_select on public.metric_admin_users;
create policy metric_admin_users_select on public.metric_admin_users for select
  using (public.metric_is_admin() or user_id = auth.uid());

drop policy if exists metric_admin_users_admin_all on public.metric_admin_users;
create policy metric_admin_users_admin_all on public.metric_admin_users for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_admin_audit_log_owner_select on public.metric_admin_audit_log;
create policy metric_admin_audit_log_owner_select on public.metric_admin_audit_log for select
  using (
    exists (
      select 1 from public.metric_admin_users a
      where a.user_id = auth.uid() and a.role = 'owner'
    )
  );

drop policy if exists metric_admin_audit_log_admin_insert on public.metric_admin_audit_log;
create policy metric_admin_audit_log_admin_insert on public.metric_admin_audit_log for insert
  with check (public.metric_is_admin());

-- ---------------------------------------------------------------------------
-- Point all metric_* RLS at metric_is_admin() (leave Timsol is_admin() alone)
-- ---------------------------------------------------------------------------

-- Explicit policy rewrites

-- projects
drop policy if exists metric_projects_public_select on public.metric_projects;
create policy metric_projects_public_select on public.metric_projects for select
  using (status = 'published' or public.metric_is_admin());
drop policy if exists metric_projects_admin_all on public.metric_projects;
create policy metric_projects_admin_all on public.metric_projects for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_project_translations_public_select on public.metric_project_translations;
create policy metric_project_translations_public_select on public.metric_project_translations for select
  using (
    public.metric_is_admin()
    or exists (select 1 from public.metric_projects p where p.id = project_id and p.status = 'published')
  );
drop policy if exists metric_project_translations_admin_all on public.metric_project_translations;
create policy metric_project_translations_admin_all on public.metric_project_translations for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_project_blocks_public_select on public.metric_project_blocks;
create policy metric_project_blocks_public_select on public.metric_project_blocks for select
  using (
    public.metric_is_admin()
    or exists (select 1 from public.metric_projects p where p.id = project_id and p.status = 'published')
  );
drop policy if exists metric_project_blocks_admin_all on public.metric_project_blocks;
create policy metric_project_blocks_admin_all on public.metric_project_blocks for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_project_media_public_select on public.metric_project_media;
create policy metric_project_media_public_select on public.metric_project_media for select
  using (
    public.metric_is_admin()
    or exists (select 1 from public.metric_projects p where p.id = project_id and p.status = 'published')
  );
drop policy if exists metric_project_media_admin_all on public.metric_project_media;
create policy metric_project_media_admin_all on public.metric_project_media for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

-- services / faq / process / benefits
drop policy if exists metric_services_public_select on public.metric_services;
create policy metric_services_public_select on public.metric_services for select
  using (status = 'published' or public.metric_is_admin());
drop policy if exists metric_services_admin_all on public.metric_services;
create policy metric_services_admin_all on public.metric_services for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_service_translations_public_select on public.metric_service_translations;
create policy metric_service_translations_public_select on public.metric_service_translations for select
  using (
    public.metric_is_admin()
    or exists (select 1 from public.metric_services s where s.id = service_id and s.status = 'published')
  );
drop policy if exists metric_service_translations_admin_all on public.metric_service_translations;
create policy metric_service_translations_admin_all on public.metric_service_translations for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_faq_public_select on public.metric_faq_items;
create policy metric_faq_public_select on public.metric_faq_items for select
  using (status = 'published' or public.metric_is_admin());
drop policy if exists metric_faq_admin_all on public.metric_faq_items;
create policy metric_faq_admin_all on public.metric_faq_items for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_faq_translations_public_select on public.metric_faq_translations;
create policy metric_faq_translations_public_select on public.metric_faq_translations for select
  using (
    public.metric_is_admin()
    or exists (select 1 from public.metric_faq_items f where f.id = faq_id and f.status = 'published')
  );
drop policy if exists metric_faq_translations_admin_all on public.metric_faq_translations;
create policy metric_faq_translations_admin_all on public.metric_faq_translations for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_process_public_select on public.metric_process_steps;
create policy metric_process_public_select on public.metric_process_steps for select
  using (status = 'published' or public.metric_is_admin());
drop policy if exists metric_process_admin_all on public.metric_process_steps;
create policy metric_process_admin_all on public.metric_process_steps for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_process_translations_public_select on public.metric_process_step_translations;
create policy metric_process_translations_public_select on public.metric_process_step_translations for select
  using (
    public.metric_is_admin()
    or exists (select 1 from public.metric_process_steps s where s.id = step_id and s.status = 'published')
  );
drop policy if exists metric_process_translations_admin_all on public.metric_process_step_translations;
create policy metric_process_translations_admin_all on public.metric_process_step_translations for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_benefits_public_select on public.metric_benefits;
create policy metric_benefits_public_select on public.metric_benefits for select
  using (status = 'published' or public.metric_is_admin());
drop policy if exists metric_benefits_admin_all on public.metric_benefits;
create policy metric_benefits_admin_all on public.metric_benefits for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_benefit_translations_public_select on public.metric_benefit_translations;
create policy metric_benefit_translations_public_select on public.metric_benefit_translations for select
  using (
    public.metric_is_admin()
    or exists (select 1 from public.metric_benefits b where b.id = benefit_id and b.status = 'published')
  );
drop policy if exists metric_benefit_translations_admin_all on public.metric_benefit_translations;
create policy metric_benefit_translations_admin_all on public.metric_benefit_translations for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

-- team / testimonials
drop policy if exists metric_team_public_select on public.metric_team_members;
create policy metric_team_public_select on public.metric_team_members for select
  using (status = 'published' or public.metric_is_admin());
drop policy if exists metric_team_admin_all on public.metric_team_members;
create policy metric_team_admin_all on public.metric_team_members for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_team_translations_public_select on public.metric_team_member_translations;
create policy metric_team_translations_public_select on public.metric_team_member_translations for select
  using (
    public.metric_is_admin()
    or exists (select 1 from public.metric_team_members m where m.id = member_id and m.status = 'published')
  );
drop policy if exists metric_team_translations_admin_all on public.metric_team_member_translations;
create policy metric_team_translations_admin_all on public.metric_team_member_translations for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_testimonials_public_select on public.metric_testimonials;
create policy metric_testimonials_public_select on public.metric_testimonials for select
  using (status = 'published' or public.metric_is_admin());
drop policy if exists metric_testimonials_admin_all on public.metric_testimonials;
create policy metric_testimonials_admin_all on public.metric_testimonials for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_testimonial_translations_public_select on public.metric_testimonial_translations;
create policy metric_testimonial_translations_public_select on public.metric_testimonial_translations for select
  using (
    public.metric_is_admin()
    or exists (select 1 from public.metric_testimonials t where t.id = testimonial_id and t.status = 'published')
  );
drop policy if exists metric_testimonial_translations_admin_all on public.metric_testimonial_translations;
create policy metric_testimonial_translations_admin_all on public.metric_testimonial_translations for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

-- agency / home / seo / settings / leads
drop policy if exists metric_agency_content_public_select on public.metric_agency_content;
create policy metric_agency_content_public_select on public.metric_agency_content for select using (true);
drop policy if exists metric_agency_content_admin_all on public.metric_agency_content;
create policy metric_agency_content_admin_all on public.metric_agency_content for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_agency_translations_public_select on public.metric_agency_translations;
create policy metric_agency_translations_public_select on public.metric_agency_translations for select using (true);
drop policy if exists metric_agency_translations_admin_all on public.metric_agency_translations;
create policy metric_agency_translations_admin_all on public.metric_agency_translations for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_home_public_select on public.metric_home;
create policy metric_home_public_select on public.metric_home for select
  using (status = 'published' or public.metric_is_admin());
drop policy if exists metric_home_admin_all on public.metric_home;
create policy metric_home_admin_all on public.metric_home for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_home_translations_public_select on public.metric_home_translations;
create policy metric_home_translations_public_select on public.metric_home_translations for select
  using (
    public.metric_is_admin()
    or exists (select 1 from public.metric_home h where h.id = 1 and h.status = 'published')
  );
drop policy if exists metric_home_translations_admin_all on public.metric_home_translations;
create policy metric_home_translations_admin_all on public.metric_home_translations for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_page_seo_public_select on public.metric_page_seo;
create policy metric_page_seo_public_select on public.metric_page_seo for select using (true);
drop policy if exists metric_page_seo_admin_all on public.metric_page_seo;
create policy metric_page_seo_admin_all on public.metric_page_seo for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_site_settings_public_select on public.metric_site_settings;
create policy metric_site_settings_public_select on public.metric_site_settings for select using (true);
drop policy if exists metric_site_settings_admin_all on public.metric_site_settings;
create policy metric_site_settings_admin_all on public.metric_site_settings for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_site_settings_translations_public_select on public.metric_site_settings_translations;
create policy metric_site_settings_translations_public_select on public.metric_site_settings_translations for select using (true);
drop policy if exists metric_site_settings_translations_admin_all on public.metric_site_settings_translations;
create policy metric_site_settings_translations_admin_all on public.metric_site_settings_translations for all
  using (public.metric_is_admin()) with check (public.metric_is_admin());

drop policy if exists metric_leads_anon_insert on public.metric_leads;
create policy metric_leads_anon_insert on public.metric_leads for insert with check (true);
drop policy if exists metric_leads_admin_select on public.metric_leads;
create policy metric_leads_admin_select on public.metric_leads for select using (public.metric_is_admin());
drop policy if exists metric_leads_admin_update on public.metric_leads;
create policy metric_leads_admin_update on public.metric_leads for update
  using (public.metric_is_admin()) with check (public.metric_is_admin());
drop policy if exists metric_leads_admin_delete on public.metric_leads;
create policy metric_leads_admin_delete on public.metric_leads for delete using (public.metric_is_admin());

-- ---------------------------------------------------------------------------
-- Storage: Metric-only buckets (do not share Timsol lead-attachments / site-files)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'metric-media', 'metric-media', true, 10485760,
  array['image/jpeg','image/png','image/webp','image/gif','image/avif','image/svg+xml']
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
  with check (bucket_id = 'metric-media' and public.metric_is_admin());
drop policy if exists metric_media_admin_update on storage.objects;
create policy metric_media_admin_update on storage.objects for update
  using (bucket_id = 'metric-media' and public.metric_is_admin())
  with check (bucket_id = 'metric-media' and public.metric_is_admin());
drop policy if exists metric_media_admin_delete on storage.objects;
create policy metric_media_admin_delete on storage.objects for delete
  using (bucket_id = 'metric-media' and public.metric_is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'metric-lead-attachments', 'metric-lead-attachments', true, 10485760,
  array[
    'application/pdf','application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text','application/rtf',
    'text/plain','text/rtf','image/jpeg','image/png','image/webp','image/gif'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists metric_lead_attachments_public_read on storage.objects;
create policy metric_lead_attachments_public_read on storage.objects for select
  using (bucket_id = 'metric-lead-attachments');
drop policy if exists metric_lead_attachments_anon_insert on storage.objects;
create policy metric_lead_attachments_anon_insert on storage.objects for insert
  with check (bucket_id = 'metric-lead-attachments');
drop policy if exists metric_lead_attachments_admin_all on storage.objects;
create policy metric_lead_attachments_admin_all on storage.objects for all
  using (bucket_id = 'metric-lead-attachments' and public.metric_is_admin())
  with check (bucket_id = 'metric-lead-attachments' and public.metric_is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'metric-site-files', 'metric-site-files', true, 52428800,
  array[
    'application/pdf','application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text','application/rtf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain','image/jpeg','image/png','image/webp'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists metric_site_files_public_read on storage.objects;
create policy metric_site_files_public_read on storage.objects for select
  using (bucket_id = 'metric-site-files');
drop policy if exists metric_site_files_admin_all on storage.objects;
create policy metric_site_files_admin_all on storage.objects for all
  using (bucket_id = 'metric-site-files' and public.metric_is_admin())
  with check (bucket_id = 'metric-site-files' and public.metric_is_admin());

-- Drop Metric policies that previously gated shared Timsol buckets via is_admin()
drop policy if exists lead_attachments_admin_all on storage.objects;
drop policy if exists site_files_admin_all on storage.objects;
-- Recreate Timsol-oriented admin policies if Timsol is_admin still needed
-- (safe: only if is_admin exists)
do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'is_admin'
  ) then
    execute $p$
      create policy lead_attachments_admin_all on storage.objects for all
        using (bucket_id = 'lead-attachments' and public.is_admin())
        with check (bucket_id = 'lead-attachments' and public.is_admin())
    $p$;
    execute $p$
      create policy site_files_admin_all on storage.objects for all
        using (bucket_id = 'site-files' and public.is_admin())
        with check (bucket_id = 'site-files' and public.is_admin())
    $p$;
  end if;
exception when duplicate_object then
  null;
end $$;
