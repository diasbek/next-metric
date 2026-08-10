-- Switch CMS locales from (ru, uz, en) to (en, de).

do $$
declare
  r record;
begin
  for r in
    select c.conname, c.conrelid::regclass as tbl
    from pg_constraint c
    where c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%locale%ru%uz%en%'
  loop
    execute format('alter table %s drop constraint %I', r.tbl, r.conname);
  end loop;
end $$;

-- Remap legacy rows
update project_translations set locale = 'en' where locale = 'ru';
update project_translations set locale = 'de' where locale in ('uz');
-- Drop leftover uz if any after remap conflicts — handled per-table below via delete

-- Prefer keeping EN; remove old uz/ru orphans where EN already exists after remap
-- (simple approach: delete remaining non en/de)
do $$
declare
  t text;
begin
  foreach t in array array[
    'project_translations',
    'service_translations',
    'faq_translations',
    'process_step_translations',
    'benefit_translations',
    'team_member_translations',
    'testimonial_translations',
    'agency_translations',
    'home_translations',
    'page_seo',
    'site_settings_translations'
  ]
  loop
    if to_regclass(t) is not null then
      execute format('update %I set locale = ''en'' where locale = ''ru''', t);
      execute format('update %I set locale = ''de'' where locale = ''uz''', t);
      execute format('delete from %I where locale not in (''en'', ''de'')', t);
      begin
        execute format(
          'alter table %I add constraint %I check (locale in (''en'', ''de''))',
          t,
          t || '_locale_check'
        );
      exception when duplicate_object then
        null;
      end;
    end if;
  end loop;
end $$;
