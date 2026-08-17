# Production — `metric.graphics`

Single production environment template (fill Supabase + Hostinger when ready).

## Indexing matrix

| Env | URL | Indexing |
|-----|-----|----------|
| Local | `http://localhost:3000` | **noindex** (`NODE_ENV` / gate) |
| Staging | `https://metric.nocode.uz` | **noindex** (host not in allowlist + headers) |
| Production | `https://metric.graphics` (+ www → apex) | **indexed** when `SITE_URL` is graphics |
| Legacy | `metric.agency`, `metric.uz` | **301 → metric.graphics** (never index) |

Never set `NEXT_PUBLIC_ALLOW_INDEXING=true` on staging or local.

## Hosts

- `PRODUCTION_HOSTS` = `metric.graphics`, `www.metric.graphics`
- www / legacy `metric.agency` / `metric.uz` → apex `https://metric.graphics`

## Supabase

| Field | Value |
|-------|-------|
| Name | METRIC prod |
| Ref | _(create project)_ |
| URL | `https://YOUR_PROJECT.supabase.co` |

## Env (Hostinger / `.env.production.local`)

```bash
NEXT_PUBLIC_SITE_URL=https://metric.graphics
NEXT_PUBLIC_CONTACT_EMAIL=hello@metric.agency
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## Cutover checklist

- [ ] Create Supabase project + apply migrations (`npm run db:migrate`)
- [ ] Seed CMS (`npm run seed:cms`) + create admin (`npm run create:cms-admin`)
- [ ] Hostinger env → prod Supabase + `SITE_URL=https://metric.graphics`
- [ ] Auth redirect URLs: `https://metric.graphics/**`, `https://www.metric.graphics/**`
- [ ] Telegram webhook: `https://metric.graphics/api/telegram/webhook/?secret=…`
- [ ] Confirm staging `metric.nocode.uz`: `/robots.txt` Disallow `/`, empty sitemap, `X-Robots-Tag: noindex`
- [ ] Confirm production: `/robots.txt` Allow, non-empty `/sitemap.xml`, meta robots index
- [ ] Google Search Console → property `https://metric.graphics` → submit sitemap → request index for `/` and top cases
- [ ] Yandex Webmaster → `https://metric.graphics` → submit sitemap
- [ ] Optionally keep `metric.agency` GSC property temporarily to monitor 301s
- [ ] Set Google / Yandex verification tokens in CMS settings
- [ ] Spot-check: canonicals, hreflang en↔de, OG debugger, Rich Results (Organization / FAQ / Breadcrumb)
- [ ] Purge CDN / cache for `metric.graphics`
- [ ] Confirm CDN does **not** long-cache HTML/RSC — `next.config.mjs` already sets `Cache-Control: max-age=0, s-maxage=0, must-revalidate` on `/:path*` so post-deploy chunk hashes cannot 404 as `text/plain`
- [ ] Admin media uploads use browser → Supabase path (`browser-upload`); avoid Server Action uploads on VPS (`fetch failed`)
