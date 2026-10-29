# Arsip — halaman Products (2026-10-29)

Halaman production `/products/` **sebelum diganti** oleh desain baru (dikembangkan sebagai `playground/pages/products/option-01`) pada 2026-10-29. Disimpan agar bisa dilihat lagi kapan saja.

- Sumber: `src/pages/products/index.astro` (katalog “Balanced catalog” dengan filter kategori, Dark toggle, kartu dari `src/data/products.json`), dirender dari build production.
- Berdiri sendiri: CSS/JS hasil build dan logo disalin ke `assets/`; favicon dan logo pembayaran tetap dari `/assets/`.
- Dibersihkan untuk arsip: tag GTM dihapus (tidak mengirim analytics), `robots: noindex`, tanpa canonical. Link produk tetap seperti aslinya.
- Navbar di arsip ini masih urutan lama (01 Home · 02 Frameworks · 03 Products · 04 Blog · 05 Profile).

## Preview

```sh
npm run dev
# http://127.0.0.1:4321/playground/pages/products/arsip-2026-10-29/
```

atau `python3 -m http.server 5500 --bind 127.0.0.1` di root repo → `/playground/pages/products/arsip-2026-10-29/`.

## Catatan keputusan (2026-10-29)

- Option terpilih: **option-01** — light only, hero “Build. Create. Grow.” dengan tumpukan kartu Web/Ads/Creative/Motion/Brand, Accept payment di atas (QRIS popup, Hijra, PayPal pertama di International), 4 produk, Creative production → WhatsApp, Coming soon, form brief → WhatsApp.
- Diimplementasikan ke production: Ya (2026-10-29). Folder option-01 dihapus dari playground setelah dipindahkan.
