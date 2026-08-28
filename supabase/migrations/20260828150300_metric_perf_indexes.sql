-- Performance indexes for common admin/public list filters.

create index if not exists metric_projects_status_sort_idx
  on public.metric_projects (status, sort_order);

create index if not exists metric_projects_seo_indexable_idx
  on public.metric_projects (seo_indexable);

create index if not exists metric_services_status_sort_idx
  on public.metric_services (status, sort_order);

create index if not exists metric_faq_items_status_sort_idx
  on public.metric_faq_items (status, sort_order);

create index if not exists metric_team_members_status_sort_idx
  on public.metric_team_members (status, sort_order);

create index if not exists metric_testimonials_status_sort_idx
  on public.metric_testimonials (status, sort_order);
