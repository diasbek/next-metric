-- Localized contact content (address + downloadable files).
-- Global identity fields (phone, email, social URLs) stay on site_settings.

create table if not exists public.site_settings_translations (
  locale text primary key check (locale in ('ru', 'uz', 'en')),
  address_lines text[] not null default '{}',
  presentation_url text not null default '',
  brief_url text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.site_settings_translations enable row level security;

drop policy if exists site_settings_translations_public_select on public.site_settings_translations;
create policy site_settings_translations_public_select
  on public.site_settings_translations
  for select
  using (true);

drop policy if exists site_settings_translations_admin_all on public.site_settings_translations;
create policy site_settings_translations_admin_all
  on public.site_settings_translations
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Backfill from existing global site_settings + static EN/UZ addresses.
insert into public.site_settings_translations (locale, address_lines, presentation_url, brief_url)
select
  'ru',
  coalesce(s.address_lines, '{}'::text[]),
  coalesce(s.presentation_url, ''),
  coalesce(s.brief_url, '')
from public.site_settings s
where s.id = 1
on conflict (locale) do update set
  address_lines = excluded.address_lines,
  presentation_url = excluded.presentation_url,
  brief_url = excluded.brief_url,
  updated_at = now();

insert into public.site_settings_translations (locale, address_lines, presentation_url, brief_url)
values
  (
    'uz',
    array[
      'O''zbekiston, Toshkent,',
      'Mirzo Ulug''bek tumani,',
      'Asaka 3'
    ],
    coalesce((select presentation_url from public.site_settings where id = 1), ''),
    coalesce((select brief_url from public.site_settings where id = 1), '')
  ),
  (
    'en',
    array[
      'Uzbekistan, Tashkent,',
      'Mirzo Ulugbek district,',
      'Asaka 3'
    ],
    coalesce((select presentation_url from public.site_settings where id = 1), ''),
    coalesce((select brief_url from public.site_settings where id = 1), '')
  )
on conflict (locale) do nothing;
