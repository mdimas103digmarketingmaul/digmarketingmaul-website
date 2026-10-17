# Products Page Playground — Option 03

- Page: Products / Services
- Production reference: `/products/`
- Playground target: `/playground_products/option-03/`
- Engine: Claude
- Status: Draft — revision 2 (2026-10-17)
- Concept name: **Balanced catalog**
- Goal: Independent visual/UI/UX alternative for comparison against Option 01 and Option 02.

## Revision 2 — what changed after feedback

Feedback on revision 1: too much structural change, mixed large/small cards felt unbalanced, and the "Where to start?" block was unnecessary.

Revision 2 therefore:
- **Keeps the hero exactly as production** ("Products / Services — Build, Run & Grow Together." + original intro).
- **Removes** the "Where to start?" router, the status counters, the separate "In development" section, the "available only" switch and the WhatsApp contact strip.
- **Keeps production markup and scripts** for the catalog (same card classes, links, prices, International logic, payment-status script). Only these were added:
  - `./styles.css` and `./script.js`;
  - `data-cat` attributes on the 10 cards;
  - a small filter chip row inside the existing "Categories" heading;
  - `noindex,nofollow`.

## Concept

The "Categories" section is tidied into a **balanced 2 × 5 grid of equal cards** whose inner parts line up across each row:

- **Aligned zones (CSS subgrid):** every card has the same four zones (icon/category/number → title → description → price/status/button). Subgrid makes each zone as tall as its neighbour's, so titles, divider lines, prices and buttons sit at the same height in both cards of a row. Browsers without subgrid still get equal-height cards with bottom-pinned buttons.
- **Natural wrapping:** the forced `<br>` line breaks inside card titles and descriptions were replaced with spaces, so text wraps evenly instead of creating uneven 1-, 2- and 3-line titles.
- **Clearer states, same layout:**
  - Available cards (01–04) get a green status dot.
  - In-development cards (05–10) get a hollow dot, a muted placeholder price and a muted icon, and no hover lift.
  - Copy, prices, placeholder prices and the disabled "Checkout segera tersedia" buttons are unchanged from production.
- **Category filter:** Semua / Layanan / Belajar & Resource / Advisory 1 on 1 (ID/EN), placed in the existing "Categories" heading. Filtering hides cards and keeps the 2-column grid.

## Category mapping

- Layanan / Services: 02 Website Development, 03 Digital Ads Management, 10 Conversion Tracking & Measurement Setup
- Belajar & Resource / Learn & Resources: 01 Website course, 04 Digital Marketing eBooks, 09 Reporting Templates
- Advisory 1 on 1: 05, 06, 07, 08

## Responsive decisions

- **>900px:** two equal columns, with row-aligned zones.
- **≤900px:** single column (as production); each card keeps its internal order with the button at the bottom.
- **≤620px:**
  - Chips sit under the "Categories" label in one horizontally scrollable row.
  - Card padding and title size are tuned for 390px.
  - No horizontal overflow (checked at 390px).

## Facts preserved

- Order: 01 Course → 02 Website Development → 03 Digital Ads Management → 04 Digital Marketing eBooks → 05–10.
- Prices:
  - Course Rp899.000 (Rp4.000.000 struck through, "Harga Oktober 2026" note).
  - Website Development Rp999.000 (Rp5.000.000 struck through).
  - Digital Ads Management "Sesuai scope".
  - eBooks Rp10.000.
  - USD equivalents unchanged.
- Links: `/products/website-course/`, `/products/website-development/`, `/products/digital-ads-management/`, `/products/digital-marketing-ebooks/`.
- No Midtrans test card. In-development status copy unchanged.
- Production inline scripts (payment status, card click-through, language / theme / International) are untouched.

## Dependencies / assumptions

- Same external resources as production (Google Fonts, Font Awesome 6.7.2, `/api/doku-checkout-sdk.js`) and the shared root `../../styles.css` / `../../script.js`.
- CSS subgrid is used progressively; a fallback layout is included.
- No `assets/` folder needed.

## Production safety

This option is an experiment only. Production files, `playground_products/index.html`, Option 01 and Option 02 were not modified.
