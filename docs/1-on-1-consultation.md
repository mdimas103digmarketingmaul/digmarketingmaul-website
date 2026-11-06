# 1 on 1 Consultation

Added 2026-11-06. URL: `/products/1-on-1-consultation/`.

| Part | Where |
|---|---|
| Page | `src/pages/products/1-on-1-consultation/index.astro` |
| Styles | `src/styles/products/website-development.css` (shared base) + `src/styles/products/consultation.css` |
| Script | `src/scripts/products/consultation.js` |
| Share card | `assets/brand/og/1-on-1-consultation.jpg` (`ONLY=1-on-1-consultation node scripts/generate-og-images.mjs`) |
| Card on /products/ | `src/pages/products/index.astro` (06, between Digital Ads Management and eBooks) + `.cv-talk` in `products.css` |

## Price

- **Rp350.000 per one-hour session; USD 25 internationally.** USD is Rp350.000 at about Rp17,400–17,900 per USD (mid-2026), plus about 20% for payment and transfer fees, rounded up.
- The price is set once, in `PRICE` in the page frontmatter. It feeds the plan, the FAQ, the WhatsApp message (through `data-price-*` on the form) and the JSON-LD offer.
- **On purpose, the /products/ card shows no price**, only "1 jam · 1 on 1".
- There is no checkout and no Worker product. The booking flow is: WhatsApp message → agree on topic and time → payment (QRIS, bank transfer or the international methods). `products.json` has no `amount`, so the Worker price-drift check skips it.

## Content

- Tone: a conversation and sharing notes, not a sales pitch, and nothing overpromised. The /products/ card stays general ("Digital marketing") and doesn't name individual channels.
- Session: 60 minutes, by video call or WhatsApp chat (the visitor picks one in the form).
- The hero question cards come from `questions` in the frontmatter, in this order: Website, Video & motion, AI & automation, Reporting, Digital ads (last). Each card's → ticks its topic chip (`data-pick`) in the form.
- The FAQ is one `faq` array that renders both the visible list and the `FAQPage` JSON-LD.
