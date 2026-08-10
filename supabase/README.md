# Supabase migrations (METRIC CMS)

Portable SQL for bootstrapping the CMS on any Supabase project.

## Layout

```text
supabase/
  README.md
  migrations/                 # ordered SQL (Supabase CLI compatible)
    20260714120000_cms_core_schema.sql
    20260714120100_storage_media_bucket.sql
  snapshots/
    full_schema.sql           # concatenated one-shot (generated)
```

Apply **in filename order**. Files are idempotent (`if not exists` / `drop policy if exists`).

## What you get

| Area | Objects |
|------|---------|
| Auth gate | `admin_users`, `is_admin()` |
| Projects | `projects`, `project_translations`, `project_media` |
| Content | `services`, `faq_*`, `process_*`, `benefits`, agency/team/testimonials |
| Site | `site_settings`, `page_seo`, `leads` |
| Storage | public bucket `media` (images, 10 MB), RLS for admin write |
| Integrations | Telegram bot, captcha, Metrika/GA/GTM, GSC & Yandex Webmaster verification |

## Fresh project checklist

1. Create a Supabase project (any region).
2. Run migrations (one of the methods below).
3. Copy env into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
4. Seed content: `npm run seed:cms`
5. Create owner: open `/admin/setup/` or `npm run create:cms-admin`

Update `next.config.ts` `images.remotePatterns` hostname to the new project ref.

## Apply methods

### A) One-shot paste (fastest)

```bash
npm run db:migrations:bundle
```

Open Dashboard → **SQL Editor** → paste `supabase/snapshots/full_schema.sql` → Run.

### B) File by file in SQL Editor

Run each file under `supabase/migrations/` in ascending order.

### C) CLI (`psql` + database URL)

Database password: Project Settings → Database.

```bash
export DATABASE_URL='postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres'
npm run db:migrate
```

### D) Supabase CLI

```bash
npx supabase link --project-ref YOUR_REF
npx supabase db push
```

## After migrate

```bash
npm run seed:cms
# optional:
CMS_ADMIN_EMAIL=you@example.com CMS_ADMIN_PASSWORD='********' npm run create:cms-admin
```
