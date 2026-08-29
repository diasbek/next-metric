-- Author avatar per case review (reuse ImageField avatar preset in admin).

alter table public.metric_project_reviews
  add column if not exists person_image text not null default '';

comment on column public.metric_project_reviews.person_image is
  'Author avatar URL for case reviews; falls back to project cover on the site.';
