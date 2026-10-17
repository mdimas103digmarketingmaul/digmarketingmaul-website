# Option Metadata

- Option: option-01
- Page / target: Website Development
- Engine / tool: Claude
- Created: 2026-10-17
- Status: Draft
- Concept name: **Lifecycle Blueprint**

## Goal

Create a substantially improved alternative UI/UX for the Website Development product/service landing page while preserving the digmarketingmaul brand/navigation language.

## Design concept

The page is organised around one idea: **a website is a stack of layers that has to be designed, built, measured, launched, cared for and eventually handed over**. Instead of a list of services, the visitor sees the website lifecycle.

- **Hero "website anatomy" card** — a dark navy browser frame showing the six lifecycle layers (Design & Development → CMS → Measurement & Search → Deployment & Infra → Care → Handover). It cycles slowly through the layers, pauses on hover/focus, and each layer links to its detailed section. It communicates "more than coding a page" at a glance.
- **Proof before detail** — selected work (Hanasari Catering, MammaRoti) moved directly under the hero as large split case studies with live, scaled browser previews.
- **Editorial lifecycle section** — sticky left column (headline + scroll-spy stage index) with six scannable stage rows on the right. Each stage leads with an outcome sentence, then the technical items.
- **Ink band** for "How We Work" to break the rhythm, with a 6-step rail and a "↻ after go-live" loop note.
- **After Launch** splits routine Website Care from Additional Development so scope and cost expectations are transparent.
- **Two paths to start** — base offer (checkout) vs custom scope (WhatsApp) — plus the free-domain note.
- **FAQ** answering the main objections using only facts already on the production page / proposal scope.
- **Final CTA** on an ink card with the "M." brand mark as a watermark.

## Key differences from production

| Area | Production | Option 01 |
|---|---|---|
| Hero | Headline + price + generic scope list | "More than just coding a page" headline, price strip, and an interactive lifecycle anatomy card |
| Portfolio | Mid-page, two equal cards | Directly after hero, large split case studies, desktop-width live previews, "want something similar?" CTA |
| Scope | 6 equal cards in a 2×3 grid | Editorial lifecycle rows with sticky index + scroll-spy, outcome-first copy, GA4/GTM/GSC as tool tiles |
| Process | 6 small boxes inside a panel | Full-bleed navy band with a step rail + "after go-live" loop |
| Integrations / care / handover | Three separate sections | Handover lives in the lifecycle; care vs. additional development shown side-by-side with a 3-step "how extra scope is agreed" flow |
| Pricing | Price only in hero | Hero price strip + dedicated "Two ways to start" section (checkout vs. custom scope) |
| Objections | None | 6-item FAQ (`<details>`, no JS needed) |
| Mobile | Stacked desktop layout | Mobile-first adjustments, vertical process rail, and a sticky bottom action dock (price + WhatsApp + checkout) |
| WhatsApp | Single generic prefilled text | Intent-specific prefilled messages (scope, similar work, integration, care, custom, final) in ID and EN |

## Major decisions

- **Brand kept intact:** M. mark, Inter + JetBrains Mono, near-black navy / off-white / #ff3158 accent, the same header structure, International toggle, and ID/EN + Light/Dark compact selects.
- **Commercial positioning unchanged:** `Rp999.000` / `USD 61` labelled "harga saat ini / current price"; the scope note mirrors production wording. No Hanasari proposal pricing is used.
- **No unsupported claims:** no testimonials, client counts, guarantees or SLAs. Care items are framed as "per maintenance agreement"; additional development as "estimated separately".
- **International mode compatible:** every checkout CTA keeps `data-international-cta` + `local-only` / `international-only` spans; every price keeps `data-price-id` / `data-price-usd`; the FAQ price uses `data-amount-id` / `data-amount-usd`. Turning International on switches prices to USD, forces EN, and routes checkout to WhatsApp (handled by the shared `assets/product-detail-international.js`).
- **Same UI contract:** `script.js` still exposes `window.MauldigitalUI` (getTheme/getLanguage/applyTheme/applyLanguage), uses the same localStorage keys, and dispatches `commerce-language-change`, so the shared compact controls work unchanged. WhatsApp links are re-localised whenever language changes.
- **Mobile header:** the "Back to Products" link was already hidden ≤840px in production. At ≤760px the header checkout button is also hidden; checkout stays reachable from the hero CTA and the sticky bottom dock.
- **Accessibility / motion:** skip link, visible focus rings, `aria-label`s on decorative frames, all motion disabled under `prefers-reduced-motion`; reveal-on-scroll only activates when JS is running.

## Files

```
option-01/
├── index.html      (rewritten — markup only, no inline page CSS)
├── styles.css      (all page styles)
├── script.js       (theme/lang API + option interactions)
├── meta.md
└── assets/         (shared control assets — unchanged copies)
    ├── compact-controls.css / .js
    └── product-detail-international.css / .js
```

## External assets / limitations

- External resources: Google Fonts (Inter, JetBrains Mono) only — same as production. No images were added; all visuals are HTML/CSS.
- Portfolio previews embed the live `pages.dev` sites in scaled iframes (same approach as production). They render at desktop width (1366px; 1024px on narrow cards) and are scaled to fit. If a site ever blocks framing, a branded name placeholder sits behind the iframe and the "Open Live Preview" buttons still work.
- Favicons use the site's absolute `/assets/images/` paths, so they resolve on Live Server from the repo root and on production.
- Static HTML/CSS/vanilla JS only. No build step, backend, checkout or production files were touched.

## Notes

This is a playground option. Never modify production from this package.
