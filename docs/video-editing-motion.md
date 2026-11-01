# Video Editing & Motion product page — “Hanging Reels”

`/products/video-editing-motion/` · added 2026-11-01 · light only. Same family as [Website Development](./website-development.md): same header, rail, sheets, bento, steps, pricing, payment, FAQ, brief form and footer.

## Sections

1. **Hero** — “Video editing & motion.” + one line, with *Selected work, crafted by Maul* beside it: 9:16 sheets hanging from the same rail (drag / wheel / arrows / keys, pendulum swing). The centred sheet plays a silent preview loop; the screen or ▶ opens the player. Last sheet = “Your video is next.” → brief.
2. **What we make.** — start from anything (footage, photos, logo, idea) · video editing · motion graphics · promos & ads · audio & subtitles.
3. **How it works.** — Brief → Concept → Production → Review → Delivery.
4. **Pricing.** — “By scope” card + “Something else?” card (logo animation, explainers, motion for websites); **Accept payment** as on Website Development. No checkout: CTAs go to the brief.
5. **FAQ.**
6. **Let's discuss your video.** — brief form; “Lanjutkan ke WhatsApp” opens WhatsApp with the message prefilled (nothing stored).

## Video delivery

| File (`assets/video-editing-motion/work/`) | Size | Loaded |
|---|---|---|
| `*-poster.webp` 540×960 | 16–21 KB | with the page (sheet image, before any video) |
| `*-preview.mp4` 540×960 H.264, no audio | 0.9–1.2 MB | only for the centred sheet, once the rail is on screen and still |
| `*.mp4` 720×1280 H.264 + AAC 128k | 2.4–3.6 MB | only when the visitor presses play |

- Every `<video>` starts with `preload="none"`; the script sets `src` on demand. Off-screen, hidden tab, or player open → previews pause.
- `prefers-reduced-motion` or Save-Data → no previews at all, posters + play button only.
- MP4s are `+faststart`, so playback starts while the rest streams (Cloudflare static assets answer range requests).
- H.264/AAC MP4 plays in every current browser, so there is one source per video.
- Original renders are never changed. Regenerate from them with:

```sh
node scripts/prepare-video-assets.mjs \
  "<motion-engine>/output/video-motion-promo-10/hijra-deposito-10-option-02-final.mp4" \
  "~/Documents/video-production/renders/digmarketingmaul/01-website-offer/option-01-final.mp4" \
  "<path>/digmarketingmaul-motion-engine"   # repo with sharp installed (for the WebP posters)
```

## Files

| File | Role |
|---|---|
| `src/pages/products/video-editing-motion/index.astro` | Markup (BaseLayout → SEO, GTM, favicon) |
| `src/styles/products/website-development.css` | **Shared base**, loaded first. Changing it changes both pages. |
| `src/styles/products/video-editing-motion.css` | Video-only additions: 9:16 sheets, previews, scope visuals, player |
| `src/scripts/products/video-editing-motion.js` | Language + International, hanging reels + preview loading, player, brief → WhatsApp, QRIS, reveals, cursor |
| `scripts/prepare-video-assets.mjs` | Poster / preview / full encodes from the final renders |

**Add a video:** run it through the same encode settings, then copy one `<li class="sheet">` (before the “Your video is next” sheet) and set `--tone`, `data-full`, the poster `<img>`, the preview `<video data-src>`, the time chip, name and type.

The page is not in `sitemap.xml` yet (the sitemap is an editorial allowlist checked by `scripts/verify-build.mjs`).
