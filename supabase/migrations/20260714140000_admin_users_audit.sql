-- Admin user metadata + audit log for CMS multi-user
alter table public.admin_users
  add column if not exists invited_by uuid references auth.users (id) on delete set null,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists last_login_at timestamptz;

drop trigger if exists admin_users_updated_at on public.admin_users;
create trigger admin_users_updated_at
  before update on public.admin_users
  for each row execute function public.set_updated_at();

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  actor_email text not null default '',
  action text not null,
  entity_type text,
  entity_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_idx
  on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;

drop policy if exists admin_audit_log_owner_select on public.admin_audit_log;
create policy admin_audit_log_owner_select on public.admin_audit_log for select
  using (
    exists (
      select 1 from public.admin_users a
      where a.user_id = auth.uid() and a.role = 'owner'
    )
  );
