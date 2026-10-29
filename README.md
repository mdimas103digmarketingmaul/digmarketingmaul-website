# digmarketingmaul.com

Hybrid website: **Astro static marketing pages + Vanilla standalone pages + Cloudflare Worker APIs**. No React, SSR adapter, CMS, or backend migration.

## Development

Use Node **22.23.4+** (tested with Node 24.21.0).

```sh
npm install
npm run dev
```

Astro serves the frontend at the localhost URL shown in the terminal. Directory URLs for standalone HTML are served by a development-only Vite middleware; production still uses Cloudflare Static Assets. API routes are **not** implemented by Astro. Do not point local testing at production payment APIs.

The command first prepares `public/` from an explicit source allowlist. `public/` is **generated and ignored**, not an editable source directory. Restart `npm run dev` after editing a root standalone file or snapshot so staging refreshes; changes in `src/` use Astro HMR normally.

## Production build and preview

```sh
npm run build
npm run preview
```

`build` stages passthrough files, builds nine Astro routes into `dist/`, then checks compatibility. `preview` serves the built frontend only.

For the existing Worker locally, after building:

```sh
npm run preview:worker
```

Wrangler uses local emulation. No production secret is supplied by this repository. Payment creation/email delivery should not be tested without a separate sandbox setup. The migration's Worker smoke checks use missing-parameter, method-rejection and unauthenticated paths only.

## Source ownership

| Source | Responsibility |
|---|---|
| `src/pages/` | Homepage/profile section, blog landing, frameworks, catalog and selected product landings |
| `src/components/seo/` | Configurable metadata/favicon and one GTM installation per migrated page |
| `src/components/site/` | Shared navigation data presentation and reusable brand footer; home/custom presentation stays distinct |
| `src/components/products/` | Product card and shared eBook page |
| `src/layouts/` | Base document and framework article asset/initialization order |
| `src/data/` | Navigation/site configuration and **presentation-only** product/eBook data |
| `src/styles/`, `src/scripts/` | Homepage, shared site, frameworks and catalog ownership; Vanilla browser interactions |
| `assets/` | Shared compatibility assets, brand, payment icons and snapshot dependencies |
| `products/website-development/`, `products/digital-ads-management/` | Custom CSS/JS retained at their existing public URLs; HTML template lives in `src/pages/` |
| `products/website-course/` | Intentional standalone Vanilla course landing |
| `checkout/`, `payment/`, `admin/` | Existing standalone applications, unchanged |
| `playground*/` | Vanilla experiments/design history, unchanged |
| `public/` | Generated staging; never edit here |
| `dist/` | Generated deployment assets; never edit here |
| `worker.js` | Existing payment/admin/API/asset-serving authority, unchanged |
| `wrangler.jsonc` | Existing Worker + Static Assets topology; asset source is now `./dist` |

No content collection is created yet: there is one framework article and a blog landing, so adding a CMS/collection now is unnecessary. A future collection can reuse the layouts without changing existing URLs.

## Routes and static passthrough

`scripts/routes.mjs` lists the HTML paths owned by Astro. `scripts/prepare-static.mjs` copies only explicitly allowed legacy directories/files, excluding those routes. It also emits the old `/assets/home/` URLs from the single source under `src/`.

All playground source files remain Vanilla and retain their local assets. Root `/styles.css` and `/script.js` remain compatibility assets for snapshots; new marketing pages use the smaller owned styles/scripts. Do not remove those legacy files based only on references in `src/`.

`sitemap.xml` remains an **editorial allowlist of nine URLs**. It is copied unchanged; no automatic sitemap discovery includes admin, transactions or playground. The original eBook test remains indexed; the Midtrans variant stays noindex. Changing either requires an editorial decision.

## Pricing and backend

`src/data/products.json` drives catalog presentation, and `src/data/ebooks.js` drives the eBook variants. Neither authorizes a charge. `worker.js` owns validated product amounts, payment methods, fee calculation, signatures, D1 updates, admin Access checks and email/access delivery. Checkout and its localStorage/query/SDK contracts are unchanged.

Until a separately tested shared server/client data contract is introduced, synchronize display-price changes with Worker/checkout deliberately. Build checks detect drift in available catalog products.

## Validation

```sh
npm run build
npm test
npx playwright install chromium  # one-time local browser installation if needed
npm run test:browser
# With a separately running local Wrangler:
npm run test:worker
```

Alternatively set `BROWSER_PATH` to an existing compatible Chromium executable. Browser tests reconstruct the pre-migration frontend from the Git baseline recorded in `tests/baseline.json`, serve both versions locally, and block all external traffic and API calls. Reports/screenshots are ignored under `test-results/`.

The baseline comparison requires that historical commit to remain available (use a full Git checkout in CI). It is a migration regression gate, not a policy forbidding future intentional copy/SEO changes: update the baseline deliberately when those changes are approved.

See [migration compatibility and deployment notes](docs/migration/ARCHITECTURE.md).
