# Production — `metric.agency`

Single production environment template (fill Supabase + Hostinger when ready).

| Env | URL | Indexing |
|-----|-----|----------|
| Production | `https://metric.agency` (+ www → apex) | indexed when host allowlist + `SITE_URL` are agency |

## Hosts

- `PRODUCTION_HOSTS` = `metric.agency`, `www.metric.agency`
- www / legacy `metric.uz` redirects → apex agency

## Supabase

| Field | Value |
|-------|-------|
| Name | METRIC prod |
| Ref | _(create project)_ |
| URL | `https://YOUR_PROJECT.supabase.co` |

## Env (Hostinger / `.env.production.local`)

```bash
NEXT_PUBLIC_SITE_URL=https://metric.agency
NEXT_PUBLIC_CONTACT_EMAIL=hello@metric.agency
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## Cutover checklist

- [ ] Create Supabase project + apply migrations (`npm run db:migrate`)
- [ ] Seed CMS (`npm run seed:cms`) + create admin (`npm run create:cms-admin`)
- [ ] Hostinger env → prod Supabase + `SITE_URL=https://metric.agency`
- [ ] Auth redirect URLs: `https://metric.agency/**`, `https://www.metric.agency/**`
- [ ] Telegram webhook: `https://metric.agency/api/telegram/webhook/?secret=…`
- [ ] Google Search Console + Yandex Webmaster → `https://metric.agency`
- [ ] Purge CDN / cache for `metric.agency`
