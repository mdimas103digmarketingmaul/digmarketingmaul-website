# CRM & Email Management

Added 2026-11-08. URL: `/products/crm-email-management/`. Light only.

| Part | Where |
|---|---|
| Page | `src/pages/products/crm-email-management/index.astro` (all copy and data are in the frontmatter) |
| Styles | `website-development.css` (shared base) + `graphic-design.css` (rail, wall, viewer, category index) + `crm-email-management.css` |
| Scripts | `graphic-design.js` (chrome, rail, viewer, brief form) + `crm-email-management.js` (demos) |
| Assets | `assets/crm-email-management/{email,logo}/`; the three MTI newsletters are reused from `assets/graphic-design/newsletter/` |
| Share card | `assets/brand/og/crm-email-management.jpg` (`ONLY=crm-email-management node scripts/generate-og-images.mjs`) |
| Card on /products/ | `src/pages/products/index.astro` (06, between Digital Ads Management and 1 on 1 Consultation) + `.cv-mail` in `products.css` |

`graphic-design.js` and `graphic-design.css` are shared with Graphic Design, so check both pages after changing them. The brief form's wording comes from `data-copy` on the form.

## Sections

1. **Hero**: the overview wall and hanging rail, 15 real emails in 7 categories. Merge tags such as `{{name}}` and `[Nama PT]` are left visible on purpose: no recipient's data appears.
2. **Platforms**: the home page's bar, in the owner's order: Mailchimp, Resend, Insider One. Mailchimp and Resend are level (88), Insider One lower (72). Owner's call. The values are in `tools`. No numbers and no per-tool feature list are shown (owner's call). Light panel: the glow follows the pointer and takes the hovered tool's colour.
3. **What we manage**: 10 scope tiles.
4. **Set once, it runs**: 5 example automations (`flows`), cycling until someone picks one.
5. **Right people, right message**: a segment demo with 144 made-up contacts, seeded so it always looks the same. It is labelled as an illustration.
6. **Read the numbers**: pick a problem, see where the funnel breaks and what gets checked (`symptoms`). No performance figures are claimed.
7. **Pay for what you use**: three answers give a first direction on a tool. The three tools stand in a row, the answer steps forward and the panel takes its colour. It states no prices, so it does not go stale when a platform changes its plans.
8. **How it works, Pricing, FAQ, brief form.**

## Content rules

- Only claim what is real. No open rates, list sizes or client results unless the owner supplies them.
- Price is by scope. The platform subscription is separate from the management fee.

On /products/, the card hangs three emails on a rail over a sky tone: MTI “Spots still available”, Hijra Bank’s September 2025 newsletter (centre), MTI scholarship. Each `--shift` is `-(1 - 1.6 / (image height / width))`.

## Add an email

Add it to the right list in `works`, using `mail(key, name, client, title, cardH, fullH, alt)`. Put three files in `assets/crm-email-management/email/`:

- `<key>.webp`: full size, 1080px wide
- `<key>-card.webp`: 680px wide
- `<key>-thumb.webp`: 480×600, the top of the email

Flatten transparent PNGs onto white first, or the areas behind dark text go black. Numbers follow the order of `works`.
