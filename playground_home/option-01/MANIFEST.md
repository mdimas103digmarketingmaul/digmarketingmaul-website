# Option 01 — "Stack Dial" · Manifest

Created (all inside `playground/home/option-01/`):

| File | Purpose |
|---|---|
| `index.html` | Full alternative homepage: header/nav, hero with the Stack Dial, Digital Marketing Stack console, Profile/certifications, footer. Copy is identical to production. |
| `styles.css` | Self-contained styles: brand tokens, atmosphere layers (grid, major grid, aurora, cursor grid light, grain), layouts for 13" laptop → 27", tablet, mobile, `prefers-reduced-motion`. |
| `script.js` | Vanilla JS: Stack data (same as production), dial ↔ stack sync, ARIA tabs + keyboard, skill accordion, portrait colour lens, parallax, scroll progress, mobile menu, reveals, cert accordion. |
| `MANIFEST.md` | This file. |

New assets (`assets/images/`):
- `profile.webp` (30 KB) + `profile.jpg` (63 KB) — 960px optimised versions of production `profile.png` (1.9 MB).
- `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` — copies of production favicons.

Notes:
- Nav links to Frameworks / Products / Blog and the certificate images use absolute `https://digmarketingmaul.com/...` URLs so they work wherever the playground is hosted.
- `playground/assets/playground.js` currently maps Home "Option 01" to the production URL, so the compare view will not show this folder until that mapping is changed (not edited here, per brief).
- No production, reference, or other option files were changed. No build step, no npm, no frameworks.
