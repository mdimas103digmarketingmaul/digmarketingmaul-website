# Digital Ads Management — Playground Option 02

- Engine / tool: Claude
- Status: Draft
- Created: 2026-10-17
- Production reference: `/products/digital-ads-management/`
- Playground URL: `/playground/pages/digital-ads-management/option-02/`
- Concept name: **Ads System Map**

## Design concept

The page tells one story: **digital ads managed as a connected system around your business objective and KPIs**, built from exactly seven management areas.

1. **Hero system map.** A dark navy panel with the seven areas as numbered nodes on a loop around a central "Business objective & KPI". A slow pulse travels around the loop. Next to it, a legend gives each area a one-line description and a package marker (all packages / Growth + Scale / Scale only). Nodes and legend highlight each other, cycle gently, pause on hover or focus, and clicking either one opens that area further down the page.
2. **Seven-area ledger.** An editorial list grouped into three unnumbered working layers (Foundation / Execution / Learn & grow). Each area is a row that opens to show its detailed scope from the PDF, with an "Expand all" toggle. The seven numbers stay the only numbered framework on the page.
3. **Measurement as source → signal → decision.** A table of four lanes (Website, App, CTWA/WhatsApp, Marketplace/Offline) with columns *where customers act → measurement stack → what becomes readable*. A shared base strip covers the measurement plan and data-quality checks. A connector line then leads into a dark **decision layer**: Daily/Live, Weekly and Monthly shown as three reading rhythms, each with the question it answers. They end in Scale / Fix / Retest / Stop decisions, including what they mean for the landing page, offer and funnel.
4. **Package matrix.** Seven areas × Essential / Growth / Scale. It shows clearly that packages are cumulative and differ only in areas 05 and 07. Hovering or clicking a package highlights its column, and each column has its own WhatsApp CTA. The FYI for new accounts follows below.
5. **Fee.** Split layout: fee drivers and platform note on the left, a compact budget-tier table on the right (8 tiers × 3 packages, all **TBC**). A small decorative bar shows how the tiers scale. It is visible but kept from dominating the page.
6. **Credentials + framework.** Three credentials listed with year and issuer, plus the profile link. Digital Ads Operating System sits in a secondary card.
7. **Brief builder (final CTA).** Optional fields (business/product, objective, platforms, monthly budget tier, tracking status, scope of interest) build a live WhatsApp message preview. "Send brief via WhatsApp" opens wa.me with that text, and a plain "chat directly" link is always available.

## Major differences from production

| Area | Production | Option 02 |
|---|---|---|
| Hero | Headline + 4-bullet focus card | Same headline, plus a full-width interactive seven-area system map with package markers |
| Seven areas | 7 equal cards in a 2-column grid | Grouped ledger rows that open on demand, showing the full PDF scope (campaign key/values, format chips, experiment loop) |
| Working model | Separate 4-step "working model" | Removed; the three unnumbered layers carry this instead, so nothing competes with the seven-area model |
| Measurement | 4 same-size cards + 3 review cards | Environment → stack → signal lanes, a connector, then a decision layer with cadence and decision outcomes |
| Packages | 3 pricing-style cards | 7 × 3 inclusion matrix with column highlight and a WhatsApp CTA per package |
| Fee table | Full-width table below packages | Compact table next to an explanation of what drives the fee |
| Credentials | Two equal cards | Credential list with year and issuer + secondary framework card |
| CTA | Generic WhatsApp buttons | Brief builder generating a structured WhatsApp message (ID/EN) |
| Header | Back + WhatsApp | Same, plus a small in-page nav (Scope / Measurement / Packages / Fee) on wide screens |
| Mobile | Stacked desktop layout | Compact matrix, stacked lanes, vertical experiment loop, floating "Talk to Maul" button |

## Storytelling / section-order decisions

**What it is → what exactly is managed → how it's measured and decided → how to choose a package → what it costs → why trust it → start the conversation.**

- The seven areas appear twice on purpose. The hero map shows the whole system at a glance, and the ledger shows the detail. They are linked, so the map acts as navigation.
- Measurement follows scope because it explains *how* areas 02 and 06 turn into decisions, which is the main thing that sets the service apart.
- Packages come before fee so visitors understand what they choose before seeing a price table that is all TBC.
- Credentials sit near the end as reassurance, not as the opening pitch.

## UI/UX decisions

- **Brand:** M. mark, Inter + JetBrains Mono, navy / off-white / #ff3158, and the original header controls (International, ID/EN, Light/Dark) are kept. Navy "ink" panels give rhythm (system map, decision layer, brief) and work in both themes.
- **Package markers** (filled / half / ring dot) appear on the map, legend and badges, so availability reads the same everywhere.
- **No fake data:** no dashboards with numbers, logos, testimonials or results. The cadence "bars" are abstract scale indicators only.
- **Accessibility:** `<details>`/`<summary>` for the ledger, real radio/checkbox inputs for chips, a table with row headers, skip link, visible focus rings, `prefers-reduced-motion` respected, and reveal-on-scroll only when JS runs.
- **Same UI contract:** `script.js` exposes `window.MauldigitalUI` with the same storage keys and `commerce-language-change` event, so the shared compact controls and the International script work unchanged. WhatsApp links, the brief preview, placeholders and select labels all re-localise on language change. International mode forces EN as before.

## Limitations

- Fee values stay **TBC** by instruction. The PDF's numeric fees and package simulation are not used.
- The brief builder only composes a WhatsApp message. Nothing is stored or sent anywhere else.
- Objective options (Leads / Sales / App install / Awareness) and platform chips (Meta, Google, TikTok, LinkedIn) are visitor inputs, not claims about results. TikTok/LinkedIn come from the PDF's "other platforms, discuss effort" note.
- The in-page header nav is hidden below 1140px; the header WhatsApp button is hidden below 760px, where the hero buttons and the floating button cover it.

## External assets/resources used

- Google Fonts: Inter, JetBrains Mono (same as production).
- No images. Icons are small inline SVGs and the map is HTML/CSS + inline SVG.
- `assets/`: unchanged copies of the shared compact-controls and product-detail-international files.

## Decision after review

- Selected: Pending
- Production implementation: Pending
- Notes:
