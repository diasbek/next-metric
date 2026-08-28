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

Priority for `og:image`:

1. Stored `og_image` (custom upload / URL / CMS-generated PNG)
2. Case cover (`cover_image`) when page is a work
3. Dynamic `/og/{locale}/works/{slug}/` or `/og/{locale}/{page}/`

In Admin → Works / Settings SEO use **Custom | Generate | Auto**. Generate writes `og-generated.png` to media and sets `og_image` immediately (works for drafts). Auto clears stored OG so the live route is used after publish.

After publish: spot-check OG URL `/og/en/works/{slug}/` and share preview (Facebook / Telegram debugger).

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
