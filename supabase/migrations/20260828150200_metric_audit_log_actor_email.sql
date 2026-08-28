-- Fix audit log columns to match what the app needs to write/read.

alter table public.metric_admin_audit_log
  add column if not exists actor_email text not null default '';

create index if not exists metric_admin_audit_log_action_created_idx
  on public.metric_admin_audit_log (action, created_at desc);
