# Local migration validation

Validated on 29 October 2026. No production deployment, remote push, real order/payment, Dashboard change, secret change, or production D1 operation was performed.

## Passed

- `npm install`: completed; dependencies pinned in package-lock. No React/react-dom installed.
- `npm run build`: nine Astro pages rendered; post-build compatibility checks passed.
- Build checks: 36 HTML routes, 169 byte-identical static compatibility files, 410 local references, original metadata/favicon/noindex, all existing migrated-page IDs, nine sitemap entries, one GTM loader/noscript pair per migrated page, available-product price comparison, Worker hash preservation.
- `npm run dev` + `node tests/frontend-routes.mjs http://127.0.0.1:4321`: all 36 HTML routes served, including standalone directory URLs.
- `npm run preview` + route checks at `http://127.0.0.1:4322`: all 36 HTML routes served.
- Browser suite: 18 full-page baseline comparisons (nine migrated routes × desktop 1440 and mobile 390). Largest measured pixel difference: **0.0088%**, below the 0.1% threshold. Most comparisons were 0%. External resources were blocked equally on both versions; reduced motion and disabled transitions made snapshots reproducible.
- Browser behavior: mobile menu/open/Escape; homepage profile hash navigation; catalog categories (3 service cards / 10 all cards), theme, language, international prices and original detail destinations; framework reading controls; custom product language/theme/international controls; WhatsApp brief URL generation without opening/sending; iframe sizing; standalone course controls.
- Additional motion-enabled checks: homepage initialization/curtain readiness, skills selection, blog scroll reveal.
- Local Wrangler with isolated `/tmp/maul-astro-worker-state`: 36 HTML routes; `/blog`, `/products`, `/frameworks`, course and checkout directory redirects; `/index.html` aliases; checkout query retention; `_astro` assets; private source URLs and unknown routes return 404.
- API smoke checks used **GET only**: create-payment/create-midtrans-payment/webhooks return 405; payment status without invoice/token returns 400; unauthenticated admin overview returns 403. No valid transaction payload or gateway request was sent.
- `npx wrangler deploy --dry-run --outdir /tmp/maul-worker-dry-run`: packaging passed with existing `DB` and `ASSETS` bindings. Dry-run did not upload or deploy.

## Interpretation

These checks establish local source/output compatibility, not live gateway availability or a production Lighthouse score. Live Access policies, environment values, merchant callbacks, external iframe sites and course subdomain behavior were not exercised.

Existing checkout, payment success, course landing, admin, Worker and playground implementations were preserved byte-for-byte (except marketing HTML moved to Astro, and the homepage compatibility CSS/JS emitted from their new single source). Local `.wrangler` files were untracked rather than deleted.

Detailed transient JSON reports and failure screenshots live under ignored `test-results/`; repeatable test code and the baseline commit/hash manifest are version-controlled.
