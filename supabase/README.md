# Supabase (METRIC CMS)

Portable SQL for bootstrapping Metric CMS tables (`metric_*`) on a Supabase project.
**Target:** minim prod — shared with next-timsol.

## Active project

| | |
|--|--|
| **Project ref** | `ginhgueucvaqxhphplmy` (minim) |
| **URL** | `https://ginhgueucvaqxhphplmy.supabase.co` |
| **Table prefix** | Metric CMS: `metric_*` · Timsol CMS: unprefixed (coexist) |
| **Auth** | Shared unprefixed `admin_users` / `is_admin()` |
| **Media bucket** | `metric-media` (+ `lead-attachments`, `site-files`) |

Dashboard: https://supabase.com/dashboard/project/ginhgueucvaqxhphplmy

## Fresh Metric schema on minim

Apply **only** Metric-era migrations (safe alongside existing Timsol tables):

```text
supabase/migrations/20260810120000_metric_prefixed_schema.sql
supabase/migrations/20260810130000_metric_storage_buckets.sql
```

Do **not** re-run older unprefixed `20260714*` files — Timsol already has those shapes.

### Apply methods

**A) Dashboard SQL Editor** (required if MCP has no org access)

1. Open https://supabase.com/dashboard/project/ginhgueucvaqxhphplmy/sql/new
2. Paste and run each Metric migration file in order.

**B) CLI with DB URL**

```bash
# Settings → Database → URI → DATABASE_URL in .env.local
npm run db:migrate
```

**C) Bundle for paste**

```bash
npm run db:migrations:bundle   # writes supabase/snapshots/full_schema.sql (Metric only)
```

## Env keys

Copy into `.env.local` / Hostinger (see `.env.example`):

| Key | Purpose |
|-----|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ginhgueucvaqxhphplmy.supabase.co` |
| `SUPABASE_URL` | Same (server) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Same publishable as next-timsol |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same anon as next-timsol |
| `SUPABASE_SECRET_KEY` | Secret / service_role (server only) — **required** |

Optional aliases: `SUPABASE_API_KEY`. Also set `CMS_ADMIN_EMAIL` / `CMS_ADMIN_PASSWORD` for postbuild `create:cms-admin`.

## After migrate

```bash
npm run seed:metric
CMS_ADMIN_EMAIL=admin@minim.uz CMS_ADMIN_PASSWORD='********' npm run create:cms-admin
# or open /admin/setup/
```

Admin Metric homepage editor: **`/admin/metric-home/`**.

Login is server-proxied (no browser → `*.supabase.co` Auth).

## What you get (`metric_` prefix)

| Area | Objects |
|------|---------|
| Auth gate | `admin_users`, `is_admin()` (shared) |
| Home | `metric_home`, `metric_home_translations` |
| Projects | `metric_projects`, `metric_project_translations`, `metric_project_media`, `metric_project_blocks` |
| Content | `metric_services`, `metric_faq_*`, process/benefits/agency/team/testimonials |
| Site | `metric_site_settings`, `metric_page_seo`, `metric_leads` |
| Storage | `metric-media`, `lead-attachments`, `site-files` |

## Layout

```text
supabase/
  README.md
  migrations/
    20260810120000_metric_prefixed_schema.sql   # ← Metric on minim
    20260810130000_metric_storage_buckets.sql
    20260714*.sql                               # Timsol-era (already on minim)
  snapshots/
    full_schema.sql
```
