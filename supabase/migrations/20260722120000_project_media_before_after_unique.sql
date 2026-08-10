-- Ensure at most one before and one after image per project.
-- Collapse duplicates first (keep newest by sort_order, then id).

with ranked as (
  select
    id,
    row_number() over (
      partition by project_id, kind
      order by sort_order desc, id desc
    ) as rn
  from public.project_media
  where kind in ('before', 'after')
)
delete from public.project_media
where id in (select id from ranked where rn > 1);

create unique index if not exists project_media_one_before_per_project
  on public.project_media (project_id)
  where kind = 'before';

create unique index if not exists project_media_one_after_per_project
  on public.project_media (project_id)
  where kind = 'after';

comment on index public.project_media_one_before_per_project is
  'Before/after compare is a single pair — one before image per project.';
comment on index public.project_media_one_after_per_project is
  'Before/after compare is a single pair — one after image per project.';
