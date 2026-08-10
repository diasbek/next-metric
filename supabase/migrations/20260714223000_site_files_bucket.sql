-- Public site documents (presentation / brief PDFs per locale).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-files',
  'site-files',
  true,
  52428800,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',
    'application/rtf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists site_files_public_read on storage.objects;
create policy site_files_public_read
  on storage.objects
  for select
  using (bucket_id = 'site-files');

drop policy if exists site_files_admin_all on storage.objects;
create policy site_files_admin_all
  on storage.objects
  for all
  using (bucket_id = 'site-files' and public.is_admin())
  with check (bucket_id = 'site-files' and public.is_admin());
