# Website Development product page — “Hanging Proofs”

`/products/website-development/` · launched 2026-10-29 · light only (no dark toggle). Previous version archived at `playground/pages/website-development/arsip-2026-10-29/`.

## Sections

1. **Hero** — “Websites crafted to grow.” + one line, with *Selected work, crafted by Maul* beside it: laptop-ratio sheets hanging from a rail (drag / wheel / arrows / keys, pendulum swing, the centred sheet loads its live site). The ↗ button is the only link on a sheet.
2. **Showreel** — the homepage “Build a website with digmarketingmaul.” scene in a dark window (`src/styles/home/showreel.css`, `src/scripts/home/showreel.js`).
3. **Why digmarketingmaul.** — free preview · unlimited revisions (no final payment if not satisfied) · security guarantee (money back) · responsive · add-ons on request.
4. **How it works.** — Brief → Free preview → Revise → Build → Launch.
5. **Pricing.** — Rp999.000 / USD 61 (International) + “Need more?” card; **Accept payment** with every logo in `assets/payment-methods/` (+ Hijra Bank) and a QRIS button that shows digmarketingmaul's QRIS with a confirm-first warning.
6. **FAQ.**
7. **Let's discuss your website.** — brief form; “Lanjutkan ke WhatsApp” opens WhatsApp with the message prefilled (nothing stored).

## Files

| File | Role |
|---|---|
| `src/pages/products/website-development/index.astro` | Markup (BaseLayout → SEO, GTM, favicon) |
| `src/styles/products/website-development.css` | Styles |
| `src/scripts/products/website-development.js` | Language + International (keys `maulCommerceLanguage`, `maulProductsInternational`), hanging sheets, form → WhatsApp, QRIS popover, reveals, cursor |
| `src/scripts/products/product-page-init.js` | Language / International before first paint (shared with `/products/`) |
| `assets/website-development/clients/*.webp` | Sheet posters (1280×800, from the live sites) |
| `assets/payment-methods/hijra.webp`, `qris-digmarketingmaul.webp` | Hijra Bank logo, QRIS code |

**Add a client:** copy one `<li class="sheet">` (before the “Your website is next” sheet) and set `--tone`, the iframe `data-src`, the ↗ `href`, poster, name and type.

Old IDs from the page contract (`stage-01…06`, `after-launch`, `final-title`, …) are kept on the matching new elements so existing deep links still land on the page.
