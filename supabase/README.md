# Supabase (METRIC CMS)

Metric content and auth use the **`metric_` prefix**. Unprefixed tables belong to **Timsol** on the shared minim project.

## Active project

| | |
|--|--|
| **Project ref** | `ginhgueucvaqxhphplmy` (minim) |
| **URL** | `https://ginhgueucvaqxhphplmy.supabase.co` |
| **Metric** | `metric_*` tables + `metric_is_admin()` + buckets `metric-media`, `metric-lead-attachments`, `metric-site-files` |
| **Timsol** | unprefixed tables + `is_admin()` + buckets `media` / `lead-attachments` / `site-files` |

Dashboard: https://supabase.com/dashboard/project/ginhgueucvaqxhphplmy

## Separation rules

| Concern | Metric | Timsol |
|---------|--------|--------|
| Admins | `metric_admin_users` | `admin_users` |
| Audit | `metric_admin_audit_log` | `admin_audit_log` |
| RLS helper | `metric_is_admin()` | `is_admin()` |
| CMS content | `metric_projects`, `metric_home`, … | `projects`, `home_translations`, … |
| Media | `metric-media` | `media` (legacy) |
| Lead files | `metric-lead-attachments` | `lead-attachments` |
| Site files | `metric-site-files` | `site-files` |

**Never** point next-metric at unprefixed content tables. **Never** change Timsol `is_admin()` / `admin_users` from this repo.

## Migrations (Metric)

```text
20260810120000_metric_prefixed_schema.sql   # metric_* content (+ legacy shared admin bootstrap)
20260810130000_metric_storage_buckets.sql   # historical shared buckets (superseded for Metric)
20260811120000_metric_auth_separation.sql   # metric_admin_* + metric_is_admin + Metric buckets
```

Apply via MCP `apply_migration` or SQL Editor, in order.

```bash
npm run db:migrations:bundle
```

## Env

See `.env.example` — project `ginhgueucvaqxhphplmy`, runtime prefers `SUPABASE_*` over `NEXT_PUBLIC_*`.

## After migrate

```bash
npm run create:cms-admin   # upserts metric_admin_users
npm run seed:metric
```

Admin: `/admin/login/` → JSON API `/api/admin/login/`.
