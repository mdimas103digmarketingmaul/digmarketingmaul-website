# Option 01 — Connected Editorial

## Design concept
An editorial service page with a warm off-white canvas, near-black/navy ink, disciplined pink-red accents, large Inter typography, and JetBrains Mono annotations. The visual centerpiece is a linked seven-area index rather than a fake performance dashboard. Light and dark themes both retain the brand.

## What changed
- A direct hero: “Setiap iklan. Satu sistem. Arah yang jelas.” / “Every ad. One system. Clear direction.”
- All seven area names are visible in the hero. Each links to its corresponding scope disclosure and opens that detail.
- A sticky section navigation plus an editorial scope column replaces repeating equal-sized card grids.
- Four spacious measurement lanes separate customer environment, measurement tools, and the decision signal. They become stacked environment rows on smaller screens.
- Daily/Live Dashboard, Weekly Review, and Monthly Review live in their own review section, separate from the measurement tools.
- Essential / Growth / Scale emphasize cumulative scope. Creative strategy is core; creative production belongs to Growth and Scale; structured experimentation belongs to Scale.
- The new-account FYI remains visible. The eight-tier monthly fee table is inside an accessible native details disclosure; all 24 fee cells remain TBC. No numeric fees or simulations from the source PDF are published.
- Credentials preserve the precise Meta Blueprint badge wording and Google Ads certification years.
- An optional brief composer builds a WhatsApp message with business, objective, platform, monthly budget, package, and tracking context. All fields are optional. The visitor reviews and sends the message inside WhatsApp.

## File changes
Replaced: index.html, styles.css, script.js, meta.md.
Added: assets/favicon.svg (local, original M. favicon).
Kept unchanged: all four copied shared reference assets. The compact-controls.js and product-detail-international.js files are used. Their CSS copies remain reference assets; styles.css owns this option’s control styling.
No production or context files are modified. No checkout, backend, API, framework, build step, or package dependency is added.

## Behavior and compatibility
- Uses maulSiteTheme, maulCommerceTheme, maulCommerceLanguage, and maulProductsInternational preferences, plus the MauldigitalUI API and commerce-language-change event.
- ID / EN content, select options, placeholders, and WhatsApp messages switch together.
- International mode forces English and disables ID while active, retaining the supplied shared behavior. Budget tiers remain denominated in IDR; there is no invented exchange rate or USD fee.
- Form content is kept only in the current DOM. It is not posted, logged, or saved to localStorage. Only display preferences persist.
- Scope and fee details work without JavaScript. Direct WhatsApp links also work without JavaScript; language/theme switches and the brief composer require JavaScript.
- Reduced-motion preferences are respected. Native details/select controls, visible keyboard focus, labeled inputs, semantic headings, and a skip link are included.

## Preview
1. Extract the ZIP into the existing digmarketingmaul-website repository root. The ZIP contains only playground/pages/digital-ads-management/option-01/.
2. Start VS Code Live Server at the repository root.
3. Open http://127.0.0.1:5500/playground/pages/digital-ads-management/option-01/.
4. If the old page is cached, do a hard refresh.

The option uses relative asset links and may also be opened through another static server. Public navigation links point to the production homepage, Products, profile, and framework. Publishing/deployment has not been performed. The playground is marked noindex,nofollow,noarchive.

## Validation and limits
Completed:
- JavaScript syntax checks.
- Source/target comparison: all edits confined to option-01; all context/reference files unchanged.
- Seven scope disclosures, eight budget rows, 24 TBC fee cells; unique IDs and resolving internal links/local assets.
- A Node DOM simulation using the delivered HTML tested the actual option script plus both shared scripts: ID/EN switching; light/dark; International on/off with ID lock; deep-link scope opening; package selection; encoded WhatsApp messages; Enter guard; normal and unavailable localStorage.

Browser visual verification is NOT completed: no local Chromium executable was available, its download was unavailable, and the cloud browser could not reach the local preview server. The DOM simulation does not validate CSS layout or browser rendering. Responsive CSS is provided for desktop, tablet, and mobile; check 1440, 1280, 768, 390, and 320 px in Live Server, in both languages/themes. The fee table intentionally scrolls horizontally on narrow screens.

## External resources
Google Fonts: Inter (400–800) and JetBrains Mono (400–500), using fonts.googleapis.com and fonts.gstatic.com. System sans-serif and monospace fallbacks are provided when fonts cannot load. No stock imagery, generated images, icon CDN, fake logos, performance data, or testimonials are used. The M. favicon is a local SVG made for this option.

## Source priority
Current production reference controls public positioning and TBC pricing. Both provided PDF copies informed scope and package logic only. The supplied README, brief, and context summary were read before implementation.
