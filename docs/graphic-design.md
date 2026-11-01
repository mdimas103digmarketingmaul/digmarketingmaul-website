# Graphic Design product page — “Hanging Samples”

`/products/graphic-design/` · added 2026-11-01 · light only. Same family as [Website Development](./website-development.md) and [Video Editing & Motion](./video-editing-motion.md): same header, rail, sheets, bento, steps, pricing, payment, FAQ, brief form and footer.

There is no client portfolio yet, so every visual is a **sample application** drawn in HTML/CSS. Each one is labelled “Sample applications” / “Sample” and uses a made-up brand name. Never caption these as “Selected work”.

## Categories (one list, used everywhere)

01 Social media · 02 Promosi & penjualan · 03 Presentasi & dokumen · 04 Cetak & event · 05 Kaos & jersey · 06 Simple logo.

The **Simple logo** category is a simple, clean logo for small businesses (UMKM) or ones just starting out. The page copy keeps this neutral and does not compare it with full brand identity work. The **Cetak & event** category also covers backdrops, banners, booths and signage; these used to be WhatsApp rows under “Creative production” on /products/.

## Sections

1. **Hero**: “Graphic design.” plus the owner's line (kept in English for both languages).
   - Under the line is the **category index**: each row shows a category and its main items. Clicking a row moves the rail to that category's first sheet (`data-cat-go` → `data-cat`). On narrow screens it also scrolls the rail into view.
   - The row of the centred sheet is highlighted.
   - The rail holds 7 samples (post, sales poster, menu, company profile slide, wedding invitation, sports jersey, simple logo) plus “Your design is next.”
2. **What we design.**: the full list. It has a “start from anything” tile plus one tile per category: number, small visual, title and a bullet list. The grid is 4 columns, 2 columns at ≤1180px and 1 column on phones.
3. **One look, every medium.**: one sample identity on five media. The Teduh / Lari / Arunika chips switch every medium at once. The section cycles on its own until someone picks a brand, and never cycles under reduced motion.
4. **How it works.**: Brief → Direction → Design → Review (revised until it matches the brief) → Pay & final files.
5. **Pricing.**: a “By scope” card (it includes “unlimited revisions, pay once it matches the brief”) and a “Something else?” card, plus **Accept payment**. The CTAs go to the brief.
6. **FAQ.**: covers revisions (unlimited; pay only once the design matches the brief) and what kind of logo is made.
7. **Let's discuss your design.**: the brief form. It opens WhatsApp with the message prefilled. Nothing is stored.

## Performance

The page loads no images apart from the shared logo, favicon and payment logos. The payment logos are lazy, except QRIS. Samples are plain markup and CSS, and their sizes use `cqw` so each one scales with its sheet. `cqw` only works on a sample's **children**: on the sample element itself it resolves against the viewport, so a sample's own padding uses `%`.

## Files

| File | Role |
|---|---|
| `src/pages/products/graphic-design/index.astro` | Markup (BaseLayout → SEO, GTM, favicon) |
| `src/styles/products/website-development.css` | **Shared base**, loaded first. Changing it changes all three pages. |
| `src/styles/products/graphic-design.css` | Design-only additions: sheet sizes, sample artwork, bento visuals, the “one look” stage |
| `src/scripts/products/graphic-design.js` | Language + International, hanging samples, the sample-brand switcher, brief → WhatsApp, QRIS, reveals, cursor |

**Add real work:** replace one sample `<li class="sheet" data-cat="…">` (keep `data-cat` so the category index still finds it) (or add one before “Your design is next”). Put an `<img>` in `.sheet-screen`: WebP, about 1200px wide, with `width`/`height` set, and `loading="lazy"` on everything after the first two sheets. Set the screen's `aspect-ratio` to the image's ratio, and swap the “Sample” tag for the client name. Once real work is in, rename the hero label to “Selected work” only if every sheet is real.

The page is not in `sitemap.xml` yet (the sitemap is an editorial allowlist checked by `scripts/verify-build.mjs`).
