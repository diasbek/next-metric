# SEO ops checklist (metric.graphics)

Technical SEO from the excellence plan is in the app. Use this list to keep rankings after deploy.

## Search Console / Yandex Webmaster

1. Confirm properties for `https://metric.graphics` (and `/de/` coverage via International Targeting / hreflang — already in HTML).
2. Verification tokens: Admin → Settings → Analytics (Google / Yandex meta). Env fallbacks: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_YANDEX_SITE_VERIFICATION`.
3. Submit sitemap: `https://metric.graphics/sitemap.xml` (staging returns empty / robots disallow — only production indexes).
4. Monitor Coverage / Pages: unexpected `noindex`, soft 404s, redirect chains from legacy `/agency|/services|/contacts`.

## Indexable surface

- Indexed: `/`, `/works/`, `/works/[slug]/` (if published + `seo_indexable`), `/privacy/` (+ `/de/…`).
- Not indexed (by design): `/works/?category=` / `?type=`, admin, drafts, redirected agency/services/contacts.
- Toggle case indexing in the project editor (`seo_indexable`). Sitemap omits `seo_indexable = false`.

## OG / social images

Priority for `og:image` (Telegram / Facebook / X):

1. Stored `og_image` (custom upload / CMS-generated PNG in storage)
2. Case cover (`cover_image`) — used when no custom OG (reliable absolute image URL)
3. Static card `/images/og/{locale}-{page}.png` for page-level SEO (committed PNGs)
4. Dynamic `/og/{locale}/…` only as admin preview / generate helper (falls back to static on Hostinger)

Regenerate static cards locally: `npm run generate:og` (commit the PNGs; do not rely on Hostinger WASM/`@vercel/og`).

After publish: spot-check `og:image` URL returns **200 image/png** (or JPEG for covers) with no redirect chain.

## Content cadence

- Ship 1–2 strong cases / month with unique EN + DE copy, real gallery/before-after, filled SEO title (~60) and description (120–160), OG/cover (Generate or Custom).
- Use Admin → Tags for category/type vocabulary; assign on each case (not free text).
- After publish: spot-check OG URL `/og/en/works/{slug}/` and share preview.

## Monitoring

- Vercel Speed Insights (LCP / INP / CLS) on home + case pages.
- GSC Performance: queries, CTR on case titles.
- Re-check FAQ / services JSON-LD after home FAQ or services CMS edits (rich results).

## Do not

- Index thin filter URLs.
- Restore separate indexable `/agency|/services|/contacts` without a full content strategy.
- Force-index drafts.
