# Graphic Design product page — “Hanging Samples”

`/products/graphic-design/` · added 2026-11-01 · light only. Same family as [Website Development](./website-development.md) and [Video Editing & Motion](./video-editing-motion.md): same header, rail, sheets, bento, steps, pricing, payment, FAQ, brief form and footer.

The hero rail is mostly **sample applications** drawn in HTML/CSS. Each one is labelled “Sample applications” / “Sample” and uses a made-up brand name. Never caption these as “Selected work”. The exception is **real client work** (images: price list, jerseys, logos, newsletters, packaging). It hangs on the same rail, each piece in its category's place after that category's samples, and there is no separate portfolio section.

## Categories (one list, used everywhere)

01 Social media · 02 Promosi & penjualan · 03 Presentasi & dokumen · 04 Cetak & event · 05 Kaos & jersey · 06 Simple logo · 07 Newsletter (email blast; added 2026-11-05) · 08 Kemasan / Packaging (added 2026-11-05). Category keys (`data-cat`): social, sales, docs, print, apparel, logo, email, packaging.

The **Simple logo** category is a simple, clean logo for small businesses (UMKM) or ones just starting out. The page copy keeps this neutral and does not compare it with full brand identity work. The **Cetak & event** category also covers backdrops, banners, booths and signage; these used to be WhatsApp rows under “Creative production” on /products/.

## Sections

1. **Hero**: “Graphic design.” plus the owner's line (kept in English for both languages).
   - The right side **opens on the overview wall** (`data-view="wall"` on the hero): every image of every work as a small tile (`<image>-thumb.webp`), categories interleaved, in three columns drifting up / down / up (CSS, paused on hover, off screen and under reduced motion, where the wall just scrolls). Clicking a tile switches to the rail (`data-view="rail"`) already standing on that work (`data-wall-go` → the sheet's `data-key`). The ▦ button in the controls goes back to the wall; on the wall the controls show only “Semua karya” and →, which enters the rail at 01. The wall and the rail share one grid cell, so the hidden rail keeps its measurements.
   - Under the line is the **category index**: each row shows a category and its main items. Clicking a row opens the rail at that category's first sheet (`data-cat-go` → `data-cat`); a category with nothing on the rail yet (Social media, Presentasi & dokumen) goes to the open slot, “Your design is next”. On narrow screens it also scrolls the rail into view.
   - On the rail, the row of the centred sheet is highlighted.
   - The title uses `line-height: 1.02` (the base is 0.9). At 0.9 the descender of the “p” in “Graphic” touches the dot of the “i” in “design”.
   - The rail is in category order: samples (HTML/CSS, tagged “Sample”) and real work (`WorkSheet`, client name + ↗). Today (12 sheets, real work only, in the order of `works`): **Meutuah drip bag · Meutuah box & pouch** · **Hijra Runner jersey · Hijra Bank football kit · PTM Baposa jersey** · **Meutuah 1978 logo · Gals Episode logo** · **Meutuah price list** · **3 newsletters** · “Your design is next.” The wedding invitation sample was taken out on 2026-11-06 (owner's call), with its CSS; “Cetak & event” in the index now lands on the open slot. The sample post, sales poster, menu, company profile slide, jersey and logo were taken out on 2026-11-05 (owner's call); their `.art-*` CSS went with them.
   - Sheet numbers and the rail total come from `rail` in the frontmatter (sample keys + work keys), so adding a work renumbers everything.
   - **Work sheets** (`src/components/products/WorkSheet.astro`) show a card image at its own ratio. **Newsletter sheets** (`mail: true`) show an A-series window over the top of the full-length email that scrolls to the bottom on hover (fine pointers). Clicking any work sheet or its ↗ opens the **work viewer**, a `<dialog>` that shows all of that work's `images` stacked top to bottom (wider dialog when the first image is landscape). ←/→ moves between the works of the same category; Esc or the backdrop closes it. A drag on the rail never opens it. The data is the `works` object in the page frontmatter, one list per category.
2. **What we design.**: the full list. It has a “start from anything” tile plus one tile per category: number, small visual, title and a bullet list. The grid is 4 columns, 2 columns at ≤1180px and 1 column on phones.
3. **One look, every medium.**: one sample identity on five media. The Teduh / Lari / Arunika chips switch every medium at once. The section cycles on its own until someone picks a brand, and never cycles under reduced motion.
4. **How it works.**: Brief → Direction → Design → Review (revised until it matches the brief) → Pay & final files.
5. **Pricing.**: a “By scope” card (it includes “unlimited revisions, pay once it matches the brief”) and a “Something else?” card, plus **Accept payment**. The CTAs go to the brief.
6. **FAQ.**: covers revisions (unlimited; pay only once the design matches the brief) and what kind of logo is made.
7. **Let's discuss your design.**: the brief form. It opens WhatsApp with the message prefilled. Nothing is stored.

## Performance

Apart from the shared logo, favicon and payment logos, the only images are the client work in `assets/graphic-design/<category>/` (sales, apparel, logo, newsletter, packaging). A work has a `-card.webp` (800px wide, or 680px for newsletters) on the rail, lazy, and every image has a `-thumb.webp` (480px wide, ~25KB; emails cropped to their top at 4:5) for the overview wall; the wall's first copy of each column loads eagerly because it is the first view. Its full images (1600px wide; newsletters up to 1280px) load only when the viewer opens it, with the next work's first image preloaded. The payment logos are lazy, except QRIS. Samples are plain markup and CSS, and their sizes use `cqw` so each one scales with its sheet. `cqw` only works on a sample's **children**: on the sample element itself it resolves against the viewport, so a sample's own padding uses `%`.

## Files

| File | Role |
|---|---|
| `src/pages/products/graphic-design/index.astro` | Markup (BaseLayout → SEO, GTM, favicon) |
| `src/styles/products/website-development.css` | **Shared base**, loaded first. Changing it changes all three pages. |
| `src/components/products/WorkSheet.astro` | One real-work sheet on the rail (card, caption, ↗ with the viewer data) |
| `src/styles/products/graphic-design.css` | Design-only additions: sheet sizes, sample artwork, work sheets + viewer, bento visuals, the “one look” stage |
| `src/scripts/products/graphic-design.js` | Language + International, hanging samples, the sample-brand switcher, brief → WhatsApp, QRIS, reveals, cursor. Also runs [CRM & Email Management](./crm-email-management.md): check both pages after changing it or `graphic-design.css`. |

**Add real work:** add an item to the right list in `works` (`key`, `name`, `client`, `title` id/en, `card`, `images` with real pixel sizes and an `alt` each). It lands after the last piece of that category; numbers follow. Put the files in `assets/graphic-design/<category>/`.
- **Boards, not loose files.** A work with several views (front/back, colour versions, concepts → final) is one composed board, 1600px wide (`<name>.webp`) plus an 800px card (`<name>-card.webp`): same padding (72px) and gutter (28px), rounded tiles, small mono labels (VERTICAL / ON DARK, FRONT / BACK…). The 2026-11-05 boards were made with sharp; jerseys on mismatched backgrounds were cut out by colour (saturation mask, holes filled, small open/close) and set on one light canvas with a soft floor shadow. Use only the brand's real colours on a palette row.
- Make a `-thumb.webp` (480px wide) for every image, or the wall tile 404s.
- Extra images that tell the story (logo philosophy, options explored, packaging photos) go after the board in `images`; the viewer stacks them.
- **Newsletter:** export the email as a long PNG and centre it, so the left and right margins are equal and the top and bottom margins are about 5% of the width. Save the two WebPs (card 680w, full ≤1280w, quality ~84) into `assets/graphic-design/newsletter/` and add an item with `mail: true`. If the source is narrower than 680px, use one file for both `card` and the image, as `mti-last-chapter.webp` does. The sheet's hover-scroll distance and duration come from the card's size.

**Replace a rail sample with real work:** delete the sample `<li>` (and its `.art-*` CSS), remove its key from `rail`, and add the work to `works` as above. Rename the hero label to “Selected work” only if every sheet is real.

The page is not in `sitemap.xml` yet (the sitemap is an editorial allowlist checked by `scripts/verify-build.mjs`).
