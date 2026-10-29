# Arsip — halaman Website Development (2026-10-29)

Halaman production `/products/website-development/` **sebelum diganti** oleh desain baru (“Hanging Proofs”, dikembangkan sebagai option-02) pada 2026-10-29. Disimpan agar bisa dilihat lagi kapan saja.

- Sumber: commit `94dda18` — `src/pages/products/website-development/index.astro` (dirender ulang), `products/website-development/styles.css` + `script.js`, `assets/compact-controls.*`, `assets/product-detail-international.*`.
- Berdiri sendiri: CSS/JS dan logo disalin ke folder ini; favicon tetap dari `/assets/brand/favicon/`.
- Dibersihkan untuk arsip: tag GTM dihapus (tidak mengirim analytics), `robots: noindex`, tanpa canonical. Link checkout/WhatsApp tetap seperti aslinya.

## Preview

```sh
npm run dev
# http://127.0.0.1:4321/playground/pages/website-development/arsip-2026-10-29/
```

atau `python3 -m http.server 5500 --bind 127.0.0.1` di root repo → `/playground/pages/website-development/arsip-2026-10-29/`.

## Catatan keputusan (2026-10-29)

- Option terpilih: **option-02 “Hanging Proofs”** — light only, hero dengan selected work (lembaran tergantung), showreel “Build a website with digmarketingmaul.”, Why digmarketingmaul, How it works, Pricing + Accept payment (termasuk Hijra Bank + QRIS), FAQ, form brief → WhatsApp, header/footer seragam.
- Diimplementasikan ke production: Ya (2026-10-29). Folder option-02 dihapus dari playground setelah dipindahkan.
