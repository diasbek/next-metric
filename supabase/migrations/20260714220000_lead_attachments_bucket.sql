-- Lead form attachments (PDF / Office / text / images).
-- Uploads go through the service-role API; public read so admins/Telegram can open links.

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

-- Inserts/updates only via service role (API). No anon upload policy.
drop policy if exists lead_attachments_admin_all on storage.objects;
create policy lead_attachments_admin_all
  on storage.objects
  for all
  using (bucket_id = 'lead-attachments' and public.is_admin())
  with check (bucket_id = 'lead-attachments' and public.is_admin());
