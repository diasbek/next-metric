-- Admin profile fields for future public author block / CMS byline.

alter table public.admin_users
  add column if not exists display_name text not null default '',
  add column if not exists job_title text not null default '',
  add column if not exists bio text not null default '',
  add column if not exists avatar_url text not null default '';

comment on column public.admin_users.display_name is
  'Public display name for author/byline blocks.';
comment on column public.admin_users.job_title is
  'Role / position shown with the author (e.g. Art director).';
comment on column public.admin_users.bio is
  'Short bio for author cards.';
comment on column public.admin_users.avatar_url is
  'Avatar image public URL (media bucket).';
