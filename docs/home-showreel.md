# Homepage SECTION 02 — “Build a website with digmarketingmaul.”

Full-bleed showreel that plays itself like a video (21 s loop, no scroll trigger). Launched 2026-10-29; the previous version is archived at `playground/sections/build-a-website-arsip-2026-10-29/`.

| Time | Caption | Content |
|---|---|---|
| 0–5.5 s | Design it. | Design fragments land on a tilted wireframe, red-edge wipe to the final UI, exploded layers |
| 5.5–8.7 s | Fit every screen. | One device frame, real reflow 1366 → 820 → 390 px |
| 8.7–11.8 s | Launch it. | Laptop + tablet + phone; after the CTA tap the portrait scales up (bounded below the site nav) |
| 11.8–21 s | Make it scroll-worthy. | Bakery product page in browser + phone: bun pull-apart → Our Dough → Taro + Isian Custard |

## Files

| File | Role |
|---|---|
| `src/pages/index.astro` | Section markup (`#showreel`, `#showreel-title` kept for anchors and page contracts) |
| `src/styles/home/showreel.css` | All section styles; tokens/cursor/`.mask-line` come from `home.css` |
| `src/scripts/home/showreel.js` | Player (timeline, loop, pause, progress bars), 3D camera, both sample sites. Cursor “Explore” + magnetic CTA come from `home.js` |
| `assets/home/showreel/` | `cfp/` placeholder-persona images · `bakery/` bun renders + Bebas Neue / Poppins (OFL, licences included) |
| `scripts/prepare-showreel-assets.mjs` | Regenerates the assets from the source repos (not part of the build) |

Sample sites are rebuilt as lightweight HTML inside the devices: sample 1 from `bumi-aksara-portfolio/website-thufeil-cfp` (placeholder persona only, never `/option-2/`), sample 2 from the `mammaroti` repo (HeroScene + DoughSwitch only; no nav, no logo, no brand name on screen — permission pending).

## Behaviour

- Plays only while the section is on screen and the tab is visible; pause/play button; progress bars jump to an act.
- `prefers-reduced-motion`: starts paused on the final frame; bars switch frames; plays only on request.
- Fine pointer: camera tilt, glass specular, hover lifts a device in the launch / bakery acts.
- Explore circle and title sit above the fixed `.floating-cta`.

## Tests

- `npm run build` (includes `verify-build`) passes. The digests of the two compatibility mirrors `assets/home/styles.css` / `assets/home/script.js` in `tests/baseline.json` were updated on 2026-10-29 because `home.css` / `home.js` lost the old showreel code; every other passthrough stays byte-identical.
- `npm run test:browser` compares the homepage with the pre-migration commit pixel by pixel, so the redesigned section shows up as an intentional diff on `/` (1440 + 390). Use `--behavior-only` for the behaviour checks.
