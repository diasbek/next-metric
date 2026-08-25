-- Intrinsic dimensions for case gallery images (Storage / CMS masters).
alter table public.metric_project_media
  add column if not exists width integer,
  add column if not exists height integer;

comment on column public.metric_project_media.width is
  'Intrinsic pixel width after optimize/upload';
comment on column public.metric_project_media.height is
  'Intrinsic pixel height after optimize/upload';
