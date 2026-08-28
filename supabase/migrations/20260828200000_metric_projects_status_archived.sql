-- Allow archiving Metric case studies (off the public site, kept in admin).
alter table public.metric_projects drop constraint if exists metric_projects_status_check;
alter table public.metric_projects
  add constraint metric_projects_status_check
  check (status in ('draft', 'published', 'archived'));
