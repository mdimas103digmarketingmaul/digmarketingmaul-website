# Hybrid Astro migration

## Compatibility contract

Migrated HTML routes:

- `/` (`#home`, `#profile` and all existing IDs retained)
- `/blog/`
- `/frameworks/`
- `/frameworks/digital-ads-operating-system/`
- `/products/`
- `/products/website-development/`
- `/products/digital-ads-management/`
- `/products/digital-marketing-ebooks/`
- `/products/digital-marketing-ebooks-midtrans/`

Intentionally unchanged standalone HTML routes:

- `/products/website-course/`
- `/checkout/` including `?product=...`
- `/payment/success/` including invoice/token and gateway callback parameters
- `/admin/`, `/admin/customers/`, `/admin/sessions/`, `/admin/magic-links/`, `/admin/orders/`, `/admin/activity/`
- All 18 HTML files under the four playground directory families

The profile remains a section, not a new `/profile/` page. Existing Worker handling for `/profile` remains untouched. No `/en/` routes are added. `index.html` aliases and trailing-slash behavior remain under the existing Cloudflare HTML handling; Astro emits directory `index.html` files.

The build verifies title, description, canonical, robots/noindex, favicon links, existing IDs, static file hashes, sitemap membership, local references and one GTM loader/noscript pair for each migrated page. `worker.js`, standalone applications, legacy root CSS/JS and playground assets are byte-preserved. Price values are presentation only and checked against the existing Worker catalog.

## Initialization and visual preservation

No client-side navigation router/view transitions are installed. Full document navigation preserves existing `DOMContentLoaded` behavior.

Early theme/international initializers use raw source imports and inline scripts so they run before paint. Existing classic scripts retain their order and `window.MauldigitalUI` / `window.MaulProductInternationalConfig` contracts. The homepage, framework article, catalog and custom product landing interactions remain Vanilla JS.

CSS was separated by ownership without changing design tokens. Shared rules formerly hidden inside old home sections (gradient/accent text, card sheen and topic cards) remain in shared CSS. Responsive navigation rules load after the family rules to preserve the original cascade. Residual legacy-responsive selectors remain where removing them could cause regression; this is not a dead-CSS purge.

The two eBook pages share a template. Provider/product ID, presentation amount and robots are configured independently. The original public test remains in the sitemap; Midtrans is noindex. Custom course identity is untouched.

## Cleanup performed

- `.wrangler/` local cache/SQLite state is removed from Git tracking, **not deleted from local disk**. `.gitignore` excludes it, Node/build/generated staging, local environment files and `.DS_Store`.
- Old marketing HTML is replaced by editable Astro source. The staging allowlist prevents duplicate route ownership.
- Homepage CSS/JS has one editable source; compatibility URLs are generated from it.
- The migrated catalog no longer contains the inactive `maulLastPayment` payment workflow or loads the DOKU SDK. Before removal, its `.js-buy-now[data-checkout-product]` selector matched zero elements. The catalog uses detail links; checkout retains its original SDK and payment lifecycle. Historical playground copies are untouched.
- Existing `.assetsignore` remains historical root configuration. Deployment now uses the explicit staged/build output; repo source/docs/config never enter that output.

## Cloudflare deployment (not executed)

Topology remains **Worker + Static Assets**, not Cloudflare Pages and not Astro SSR.

Only `assets.directory` changed: `.` → `./dist`. `main`, `ASSETS`, D1 identity/binding, custom domains, compatibility date, `run_worker_first`, observability and `keep_vars` remain unchanged. No backend endpoints move into Astro.

When deployment is separately authorized:

1. Build with Node 22.23.4+ (Node 24.21.0 was used locally).
2. Run `npm ci` and `npm run build` before invoking Wrangler.
3. Keep `worker.js` as Wrangler entry point and use the repository `wrangler.jsonc`.
4. The eventual deployment command is `npx wrangler deploy`; it must only run after a successful build. No deploy command was run without `--dry-run` during this implementation.

### Dashboard action depends on existing deployment workflow

The current Dashboard settings were not inspected or changed. Do **not** create a Pages project or change an existing Worker into Pages.

If using Workers Builds connected to Git:

- Open **Workers & Pages → digmarketingmaul-website → Settings → Build** (the UI label may vary).
- Set the build command to `npm run build` and ensure dependency installation uses the lockfile (`npm ci`). If installation is not automatic in that workflow, use `npm ci && npm run build`.
- Keep the deployment command `npx wrangler deploy` and repository root as the working directory.
- Select a Node version satisfying the package engine requirement.
- Wrangler reads `assets.directory` from version control; do not set a Pages-style output directory separately.

If deployment is performed from CLI/another CI that already runs the build before Wrangler, **no Dashboard change is required**.

No changes to secrets, D1, Access policies, gateway callback URLs or custom-domain bindings are required by this migration. Their live correctness still needs separate release verification; the repository cannot establish current Dashboard state.

## Deferred work

- Worker decomposition, D1 schema migrations and course subdomain application remain outside this migration.
- Checkout/payment/admin were not refactored.
- Root legacy CSS/JS is retained for playground compatibility; do not remove blindly.
- Course text-node translation and multiple legacy theme-storage keys remain unchanged.
- Shared pricing/fee data across Worker, checkout and marketing needs a separately tested contract. Frontend data must never become payment authority.
- Open Graph/structured data enhancements are deferred to an editorial change; the baseline lacked them and this migration preserves existing SEO output.
- Baseline screenshots block external fonts, tracking and iframe destinations identically in both versions. They establish layout parity under controlled conditions, not a production Lighthouse score or external-service availability guarantee.
- Standalone sources require re-staging after edits; restart dev or run `npm run prepare:static`. No second editable copy exists under generated `public/`.
