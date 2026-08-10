# Supabase (METRIC CMS)

Portable SQL for bootstrapping the Metric CMS on any Supabase project.

## Active project

| | |
|--|--|
| **Project ref** | `dksqshrlnmtabrsuyyoz` (Metric) |
| **URL pattern** | `https://dksqshrlnmtabrsuyyoz.supabase.co` |
| **Table prefix** | All CMS content tables use `metric_` (e.g. `metric_home`, `metric_leads`, `metric_projects`) |
| **Media bucket** | `metric-media` |

> **Note:** Project `ginhgueucvaqxhphplmy` was requested but is inaccessible from this workspace. Use the Metric project (`dksqshrlnmtabrsuyyoz`) for now. To point env at `ginhgueucvaqxhphplmy` later, update Supabase URL/keys and re-run the metric-prefixed migration + seed on that project.

Auth helpers (`admin_users`, `is_admin()`) stay unprefixed.

## Fresh install (new projects)

Apply **only** Metric-era migrations — do **not** run older unprefixed `20260714*` files on a fresh Metric project:

```text
supabase/migrations/20260810120000_metric_prefixed_schema.sql
supabase/migrations/20260810130000_metric_storage_buckets.sql
```

That creates `metric_*` tables, RLS, and buckets `metric-media`, `lead-attachments`, `site-files`.

### Apply methods

**A) Dashboard SQL Editor** — paste and run each Metric migration file in order.

**B) This repo already applied them** on project `dksqshrlnmtabrsuyyoz` via MCP.

**C) Bundle**

```bash
npm run db:migrations:bundle   # writes supabase/snapshots/full_schema.sql (Metric only)
```

**D) CLI**

```bash
npx supabase link --project-ref dksqshrlnmtabrsuyyoz
npx supabase db push
```


## Env keys

Copy into `.env.local` (see `.env.example`):

| Key | Purpose |
|-----|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dksqshrlnmtabrsuyyoz.supabase.co` |
| `SUPABASE_URL` | Same (server) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable / anon key |
| `SUPABASE_SECRET_KEY` | Service role (server / scripts only) |

Optional aliases: `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_API_KEY`.

Update `next.config.ts` `images.remotePatterns` hostname to the project ref.

## After migrate

```bash
# Seed Metric homepage + FAQ (preferred for this project)
npm run seed:metric

# Create CMS owner
CMS_ADMIN_EMAIL=you@example.com CMS_ADMIN_PASSWORD='********' npm run create:cms-admin
# or open /admin/setup/
```

Admin Metric homepage editor: **`/admin/metric-home/`** (draft | published status).

Legacy `npm run seed:cms` targets older unprefixed content shapes and is not the Metric home path.

## What you get (`metric_` prefix)

| Area | Objects |
|------|---------|
| Auth gate | `admin_users`, `is_admin()` |
| Home | `metric_home`, `metric_home_translations` |
| Projects | `metric_projects`, `metric_project_translations`, `metric_project_media`, `metric_project_blocks` |
| Content | `metric_services`, `metric_faq_*`, process/benefits/agency/team/testimonials |
| Site | `metric_site_settings`, `metric_page_seo`, `metric_leads` |
| Storage | public bucket `metric-media` (images), RLS for admin write |

## Security advisors (project `dksqshrlnmtabrsuyyoz`)

Checked via Supabase advisors (security + performance). **No CRITICAL RLS findings.**

Documented WARN-level notes (non-blocking):

- `public.is_admin()` is `SECURITY DEFINER` and executable by `anon` / `authenticated` via RPC — intentional for RLS helpers; revoke execute from `anon` only if you harden further ([lint 0028](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)).
- Performance: `auth_rls_initplan` / multiple permissive policies on several tables — optimize later if needed; not CRITICAL.

## Layout

```text
supabase/
  README.md
  migrations/
    20260810120000_metric_prefixed_schema.sql   # ← use this for Metric
    20260714*.sql                               # legacy unprefixed (do not apply on new Metric projects)
  snapshots/
    full_schema.sql                             # legacy concatenated snapshot
```
