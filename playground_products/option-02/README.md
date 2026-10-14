# DIGMARKETINGMAUL — Products / Visual Option 02

An independent, static visual exploration of the Products page. Built from the supplied production reference; Option 01 was not used as a design reference.

## Concept: The Digital Product Edit

An editorial product showcase with three distinct rhythms:

1. **An oversized opening.** The original “Build, Run & Grow Together.” headline sits beside a layered browser composition. The `M.` mark, drafting grid, restrained pink accent, and small monospace labels keep the technical DIGMARKETINGMAUL identity.
2. **A flagship feature.** The website course becomes a wide split composition, pairing a bold “0 → live” graphic with its original title, description, October 2026 offer, price, and CTA.
3. **An edited catalog.** Website Development and Digital Marketing eBooks have individual visual treatments. The remaining seven products use quiet, fully readable editorial rows with clearly disabled checkout controls.

This exploration retains Inter, JetBrains Mono, near-black/navy surfaces, the red/pink accent, the M. logo, and the production light-mode direction. Illustrations are HTML/CSS, not screenshots or representations of actual product contents.

## Files and installation

Only these four files are included:

```text
playground/page-02/option-02/
├── index.html
├── styles.css
├── script.js
└── README.md
```

Extract the archive at the repository root. Open `playground/page-02/option-02/index.html` with VS Code **Open with Live Server**.

Alternatively, from the repository root:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000/playground/page-02/option-02/
```

No npm installation, build step, framework, or shared playground file is required. CSS and JavaScript use relative sibling paths, so the folder can also be served independently.

Navigation to other site pages and domestic product details uses explicit `https://digmarketingmaul.com/` URLs. Those destinations are intentionally outside this isolated preview. The page does not embed checkout, submit purchases, call payment APIs, or load the production payment SDK. The original payment labels describe the linked purchase flow. International CTAs open WhatsApp with the original enquiry text; PayPal is a payment indication, not a checkout integration.

## Preserved content and behavior

All ten source products, bilingual product descriptions and titles, categories, prices, original course price, October offer, and availability states are retained. Editorial section labels are navigation aids, not additional services or claims.

| Product | Domestic ID / EN | International |
| --- | --- | --- |
| Your First Website Live from Zero | Rp899.000; Rp4.000.000 struck through; original detail URL | USD 56; USD 229 struck through; WhatsApp + PayPal cue |
| Website Development | Rp999.000; original detail URL | USD 61; WhatsApp + PayPal cue |
| Digital Marketing eBooks | Rp10.000; original detail URL; **live test warning preserved** | USD 6; WhatsApp + PayPal cue; **live test warning preserved** |
| Other seven products | `Rpx.xxx.xxx`; checkout disabled | `USD xxx`; “Not available internationally”; checkout disabled |

- **International:** forces English, disables the ID option, switches prices to USD, and activates enquiries only for the three allowlisted products. The seven upcoming products have no links or clickable article wrappers.
- **ID/EN:** domestic English retains IDR prices. Turning International off restores the preceding domestic language and the exact original detail links.
- **Dark/Light:** changes the full surface, border, typography, disabled-state, utility-control, and illustration palette. The PayPal wordmark retains a white backing in both themes.
- **Preferences:** writes only `maulOption02Theme`, `maulOption02Language`, and `maulOption02International`. On first use, existing production preferences may be read as defaults, but production preference keys are never changed. Preview settings therefore do not propagate into production checkout pages.
- **Social/email:** original Instagram, LinkedIn, and email destinations remain. TikTok is visibly unavailable and is not a fake clickable link.
- **No JavaScript:** the complete Indonesian catalog and domestic detail links still render. Utility controls are disabled with an explanatory notice.
- The playground has `noindex,nofollow` to avoid presenting the exploration as a second production catalog.

## Interaction details

- A subtle pointer-driven tilt and light response on the hero browser stack; only active on fine pointers with hover.
- Gentle course-arrow, browser, and book movement on product hover.
- Keyboard-visible CTA and navigation focus, clear active navigation, and native select controls with contained chevrons.
- Section index links and a back-to-top control.
- A scroll-progress line updated at most once per animation frame.
- A polite live region announces changes to language/International state.
- No looping background animations, custom cursor, scroll hijacking, or content that depends on reveal JavaScript to become visible.

## Responsive design

| Viewport | Intended behavior |
| --- | --- |
| 2560×1440 | Content capped at 1440px; enlarged hero typography and illustration; fixed side rails remain outside the content. |
| 1440×900 | Split hero, compact single-row header, three-part section index, full-width course feature, asymmetric two-product area. |
| 1280×800 | Fluid hero and product typography with bounded spacing; 88px side gutters reserve space for rails. |
| 1024px tablet landscape | 72px gutters; reduced navigation detail; hero and course remain split. |
| 768px tablet | Two-row header; rails move to footer links; 40px gutters; split product layouts retain flexible widths. |
| 700px and below | Single-column hero and catalog; vertical section index; full-width controls and product rows; footer retains social/email access. |
| 320–380px mobile | 18px gutters, smaller controls and illustrations; all content remains in normal document flow. |

No fixed-width product grid or global horizontal overflow clipping is used. Mobile utility controls remain visible; there is no hamburger that conceals mode selection. At narrower widths, decorative art stacks inside a bounded canvas and product content moves into one column.

## Accessibility and performance

- Semantic header/nav/main/section/article/footer landmarks and explicit section labels.
- Skip link, one page-level heading, native anchors/buttons/selects, real `disabled` attributes, and visible focus outlines.
- Language visibility uses the native `hidden` attribute; the root language updates with the selected copy.
- Decorative graphics and icons are hidden from assistive technology.
- Core text/status/CTA color pairs were calculated at 4.5:1 or higher. Original prices use a semantic strikethrough.
- `prefers-reduced-motion` disables entrance motion, smooth scrolling, tilt, and hover travel; runtime preference changes also reset depth.
- Basic forced-colors accommodations preserve text, control borders, and switch state.
- No raster images, icon CDN, animation libraries, payment dependencies, or build process. Google Fonts is the only external display dependency, with system fallbacks when unavailable.
- Local storage is optional; all mode controls work in memory if storage is blocked.

## Validation completed and limits

Completed:

- JavaScript syntax check.
- Programmatic comparison of all ten product titles, descriptions, categories, both price currencies, the course promo copy, availability, and original detail destinations against the supplied production HTML.
- Checks for unique IDs, section-label references, fragment links, relative CSS/JS dependencies, and product counts.
- Execution of the actual `script.js` against a lightweight DOM fixture derived from `index.html`: domestic ID/EN, International on/off over repeated cycles, exact WhatsApp destinations and messages, three PayPal cues, seven disabled products, placeholder prices, domestic language/link restoration, theme/meta updates, persistence, and blocked storage.
- Confirmation that the preview writes no production preference keys and includes no payment API calls or SDK.
- Calculated contrast checks for core text, status text, and CTA colors in both themes.

**Verification limit:** browser QA was unavailable in the authoring session. The responsive behavior above was reviewed in the source; it has **not** been visually verified at the listed viewports in a real browser. The DOM fixture checks logic, not rendering, focus behavior, native dropdowns, or layout overflow. The live website, fonts, external destinations, and actual payment flows were not exercised. No payment or WhatsApp message was sent.

Before approving the option, use Live Server to inspect 1280×800, 1440×900, 2560×1440, 768×1024, 390×844, and 320×740 in both themes. Check ID and EN text wrapping, International notices and disabled products, Tab/Enter navigation, 200% zoom, reduced motion, rail clearance, and horizontal scrolling. The source's October 2026 pricing has deliberately not been inferred or refreshed.

## Scope

No production, `reference-current`, Option 01, shared playground, homepage option, backend, payment, admin, or course file is modified. The archive contains only this option's four files. Replace only this folder after review.
