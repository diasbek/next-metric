-- Metric CMS — additional storage buckets used by leads + contacts files
-- Depends on: public.is_admin() from metric_prefixed_schema

-- Lead form attachments (PDF / Office / text / images).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lead-attachments',
  'lead-attachments',
  true,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',
    'application/rtf',
    'text/plain',
    'text/rtf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists lead_attachments_public_read on storage.objects;
create policy lead_attachments_public_read
  on storage.objects
  for select
  using (bucket_id = 'lead-attachments');

drop policy if exists lead_attachments_admin_all on storage.objects;
create policy lead_attachments_admin_all
  on storage.objects
  for all
  using (bucket_id = 'lead-attachments' and public.is_admin())
  with check (bucket_id = 'lead-attachments' and public.is_admin());

-- Public site documents (presentation / brief PDFs).
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
