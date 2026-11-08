# SEO

Updated 2026-11-08.

## What every page gets

**Astro pages** get their SEO tags from `src/components/seo/BaseHead.astro`, driven by each page's `meta`:

| meta key | Output |
|---|---|
| `title`, `description`, `canonical`, `robots` | `<title>`, the meta description, the absolute canonical URL and robots. For the original pages these are locked by `tests/page-contracts.json`, so change them on purpose and update the contract in the same change. |
| `image`, `imageAlt` | Open Graph and Twitter `summary_large_image` tags. The image is 1200×630; without one the page uses `assets/brand/og/default.jpg`. |
| `lang` (from BaseLayout) | `og:locale` is `id_ID` or `en_US`, with the other one as the alternate. |
| `structuredData` | JSON-LD. Use the helpers in `src/data/structured-data.js`. |

Pages with `noindex` get no Open Graph or Twitter tags.

**Static pages** (`products/website-course/index.html`) carry the same tags written by hand. These files are hash-locked, so update their digest in `tests/baseline.json` after any edit.

## Structured data

| Page | JSON-LD |
|---|---|
| `/` | `Person` (M. Dimas Maulana, socials, Bekasi) + `WebSite` |
| `/products/` | `CollectionPage` with an `ItemList` of the eight products + breadcrumb |
| Website Development | `Service` + "starting from" `Offer` (IDR 999,000, as shown on the page) + breadcrumb |
| Video Editing & Motion, Graphic Design, CRM & Email Management | `Service` + breadcrumb + `FAQPage` |
| 1 on 1 Consultation | `Service` + `Offer` (IDR 350,000, as shown on the page) + breadcrumb + `FAQPage` |
| Digital Ads Management | `Service` + breadcrumb |
| Website course | `Course` (IDR 899,000) + breadcrumb |

Only state what the page shows: no ratings, made-up durations or claims. The FAQ on Video and Graphic Design is one `faq` array in the page frontmatter. It renders both the visible `<details>` list and the `FAQPage`, so the two cannot drift apart.

## Share images

```sh
node scripts/generate-og-images.mjs   # BROWSER_PATH=… to use another Chromium
```

The script writes `assets/brand/og/{default,products,website-development,video-editing-motion,graphic-design,digital-ads-management,website-course,1-on-1-consultation,crm-email-management}.jpg`, each around 50–75 KB. Edit the card markup inside the script and run it again; `ONLY=<name>` renders a single card and leaves the others untouched.

## Sitemap

`sitemap.xml` is an editorial allowlist of 13 URLs, checked by `scripts/verify-build.mjs` and hash-locked in `tests/baseline.json`.

- Add `<lastmod>` only where the date is known.
- When adding a page: add its `<url>`, update the count in `verify-build.mjs` and the digest in `baseline.json`, and add a share card if it needs one.
- `robots.txt` allows everything and points to the sitemap.
- Admin, checkout, payment, playground and the Midtrans eBook page stay `noindex` and out of the sitemap.
