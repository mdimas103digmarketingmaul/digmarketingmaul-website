# Products — Visual Option 01 · "Product Map"

A static HTML/CSS/vanilla JS exploration of `https://digmarketingmaul.com/products/`.
Open `index.html` with VS Code Live Server (or any static server). There is no build step and no npm.

## Visual concept

The page is laid out as a **map of the catalogue** instead of a grid of identical cards.

1. **Hero: product map.** The headline stays the same ("Build, Run & Grow Together."). Next to it, a constellation built from the existing orbit motif places all 10 offerings on three rings by format:
   - inner ring: digital products (01, 03, 09)
   - middle ring: services (02, 05, 10)
   - outer ring: 1 on 1 (04, 06, 07, 08)

   Available products are solid red nodes with a signal flowing along their spoke. Coming-soon products are hollow nodes with a dotted, static spoke. The first viewport answers "what does Maul offer, and what can I buy today?"
2. **Available now: spec-sheet panel.** The 3 active products sit in one panel divided by hairlines. The course is the flagship cell, with a large price, the struck-through original price, the promo note, and a small "0 → live" browser sketch.
3. **Coming soon: ruled index.** The 7 unavailable offerings form a quiet, scannable table: ID · product + description · format · placeholder price · status. These rows use no red and have no lift on hover, so they don't look purchasable.
4. **Footer** with a large `M.` mark, email and socials.

Product order 01–10 is unchanged. The IDs connect the map nodes to the catalogue entries.

## Major UI changes vs production

- Utility controls are now one compact capsule: International switch · `ID | EN` segmented control · dark/light icon segment. The pressed state is shown by fill. There are no native dropdowns, so there are no chevrons to misalign.
- Availability is the main visual axis. Red means actionable; muted, dashed or hollow means not yet available.
- Status copy appears once at section level ("Payment gateway setup in progress"). Each unavailable row keeps its own "Checkout segera tersedia / Checkout coming soon" status chip.
- In International mode, the PayPal badge row replaces the "Secure payment gateway" line on active products. In production both lines show together. This is worth a look in review.
- Section labels were added: "Tersedia sekarang / Available now" and "Segera tersedia / Coming soon". Ring labels were added: "Produk digital / Digital products", "Layanan / Services", "1 on 1". All product names, descriptions, categories, prices, placeholders (`Rpx.xxx.xxx`, `USD xxx`), the promo note and the CTA labels are unchanged.

## Interactions

- **Map nodes:** hover or keyboard focus highlights the node and its spoke and dims the rest. The readout under the map shows the ID, name, format, status and the current price (IDR or USD). Click or Enter jumps to that product and flashes its row or cell.
- **International switch (the motion moment):** a thin red sweep line crosses the viewport. Each price rolls from IDR to USD as the line passes it, and the status chips and CTAs cross-fade to their International copy. A polite live region announces the change.
- **Available cells:** a pointer-following spotlight, plus an accent line that draws across the top on hover or focus. The whole cell links to the product detail page, and the CTA sits above it.
- **Flagship sketch:** plays the "0 → live" progress once when scrolled into view.
- **Brand layers kept:** aurora, grid, cursor grid-light, grain (now static) and the scroll progress bar.

## Production logic preserved

- Theme: `maulSiteTheme` / `maulProductsTheme`. It is set before paint, so there is no flash.
- Language: `maulCommerceLanguage`. ID is the default.
- International: `maulProductsInternational` / `maulCourseInternational`. When it is on:
  - copy is forced to EN and the ID button is disabled
  - prices switch to USD
  - only `website-course`, `website-development` and `digital-marketing-ebooks` get a green **Contact via WhatsApp** CTA (same `wa.me/6281296069566` message pattern) and the **Payment with PayPal** badge
  - every other product reads "Not available internationally" and stays non-interactive

  Turning it off restores the previous language, IDR prices and the detail links.
- Links point to the live site (`https://digmarketingmaul.com/...`) because this is a playground. DOKU, Worker and payment polling are intentionally not included.

## Responsive behaviour

| Width | Behaviour |
|---|---|
| ≥ 2300px (27″ 2560×1440) | Root type scales to 125% (112.5% from 1800px), so the layout doesn't float small in the middle. |
| ≥ 1100px | Two-column hero. Rails are visible. The page gutter is `clamp(72px, 6vw, 128px)`, which leaves 30px+ of clear space between the rails and content at 1280×800. |
| 981–1199px | The International text label is hidden (globe + switch only). |
| ≤ 1099px | Rails are hidden (socials and email remain in the footer). The index rows reflow to title/desc + price/status. |
| ≤ 980px | The header splits into two rows: brand + controls, then nav. |
| ≤ 899px | The hero stacks with the map below the copy. The panel becomes a single column. |
| ≤ 640px | Mobile spacing. CTAs go full width. The index becomes stacked cards-in-rules. |
| ≤ 380px | Nav numbers are hidden so all five links fit. |

The headline uses fixed line breaks and is sized to its column (`cqi`, with a `vw` fallback), so "Grow Together." never wraps unintentionally.

Self-review was done at 1280×800, 1440×900, 1920×1080, 2560×1440, 1024×768, 820×1180 and 390/360 mobile, in both themes, with International on and off. It found no horizontal overflow and no overlap between the rails and content.

## Accessibility & performance notes

- Semantic landmarks, a skip link, `role="switch"` for International and `aria-pressed` segmented buttons. Map nodes are real links with bilingual screen-reader names, and decorative layers are `aria-hidden`.
- Visible `:focus-visible` rings on everything, including the stretched card link and the map nodes.
- Unavailable products are plain rows with a status chip, not disabled buttons or links.
- Contrast adjustments, derived from the palette:
  - CTA red `#e3203f` (white label about 4.6:1) instead of `#ff304f` (3.6:1)
  - WhatsApp green `#15803d` (5:1) instead of `#16a34a` (3.3:1)
  - small muted text `#7f8ca0` (dark) and `#5f6b7a` (light)

  Brand tokens are otherwise unchanged.
- `prefers-reduced-motion`: no sweep, roll, pulse, flow or reveal. The final states show immediately.
- Font Awesome 6.7.2 and Google Fonts (Inter, JetBrains Mono) load from the same CDNs as production. About 14 KB of JS, with no libraries. Animations use transform/opacity/stroke-dashoffset only, and the grain layer no longer animates.
- `<meta name="robots" content="noindex">` keeps the playground out of search. Remove it if this becomes production.

## Files

```text
playground/page-02/option-01/
├── index.html
├── styles.css
├── script.js
└── README.md
```

No `assets/` folder is needed. The favicon and links reference the live site.
