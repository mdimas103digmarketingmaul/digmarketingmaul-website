# Arsip — section “Build a website with digmarketingmaul.” (2026-10-29)

Section produksi homepage (SECTION 02 — Website Development Showreel) **sebelum diganti** oleh versi “responsive process” pada 2026-10-29. Disimpan agar bisa dilihat lagi kapan saja.

- Sumber: commit `10d60d7` — `src/pages/index.astro` (section `.showreel`), `src/styles/home/home.css` (§8 + aturan responsive/reduced-motion), `src/scripts/home/home.js` (§4 scroll scene, §6 placeholder, §7 cursor + magnetic).
- Isi folder hanya section tersebut (berdiri sendiri, tidak terhubung ke production):
  - `index.html` — markup section, verbatim (ditambah runway scroll khusus playground di atas/bawah).
  - `styles.css` — subset CSS homepage untuk section ini, verbatim per blok.
  - `script.js` — subset JS homepage untuk section ini.

## Preview

```sh
npm run dev
# http://127.0.0.1:4321/playground/sections/build-a-website-arsip-2026-10-29/
```

atau `python3 -m http.server 5500 --bind 127.0.0.1` di root repo →
`http://127.0.0.1:5500/playground/sections/build-a-website-arsip-2026-10-29/`

Efek frame (clip-path) berjalan saat scroll dari atas; cursor kustom hanya aktif di mouse.
