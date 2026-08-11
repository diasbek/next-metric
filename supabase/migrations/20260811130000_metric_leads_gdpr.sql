-- GDPR hardening for metric_leads + metric-lead-attachments:
--   1. Record consent timestamp on new inquiries.
--   2. Rename attachment_url -> attachment_path (bucket becomes private,
--      so the column can no longer hold a working public URL — it now
--      stores the storage object path; the app mints short-lived signed
--      URLs on demand for admins).
--   3. Flip metric-lead-attachments to a private bucket and drop the
--      anonymous public-read policy (uploads still allowed anonymously;
--      reads are admin-only via the service role / signed URLs).

alter table public.metric_leads
  add column if not exists consent_at timestamptz;

alter table public.metric_leads
  rename column attachment_url to attachment_path;

update storage.buckets
set public = false
where id = 'metric-lead-attachments';

drop policy if exists metric_lead_attachments_public_read on storage.objects;
