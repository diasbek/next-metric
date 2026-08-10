-- Home page section titles (Why us block on /)

create table if not exists public.home_translations (
  locale text primary key check (locale in ('ru', 'uz', 'en')),
  why_us_title_line_1 text not null default '',
  why_us_title_line_2 text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.home_translations enable row level security;

drop policy if exists home_translations_public_select on public.home_translations;
create policy home_translations_public_select on public.home_translations
  for select using (true);

drop policy if exists home_translations_admin_all on public.home_translations;
create policy home_translations_admin_all on public.home_translations
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.home_translations (locale, why_us_title_line_1, why_us_title_line_2)
values
  ('ru', 'Почему', 'выбирают нас'),
  ('uz', 'Nega bizni', 'tanlashadi'),
  ('en', 'Why choose', 'us')
on conflict (locale) do nothing;
