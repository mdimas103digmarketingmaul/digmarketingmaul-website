# Playground — Digital Ads Management

Production reference:
- Local: http://127.0.0.1:5500/products/digital-ads-management/
- Live: https://digmarketingmaul.com/products/digital-ads-management/

## Cara kerja

Buat option sebanyak yang dibutuhkan:

```text
option-01/
option-02/
option-03/
option-04/
...
```

Setiap option menggunakan struktur minimal:

```text
option-XX/
├── index.html
├── styles.css
├── script.js
└── meta.md
```

Jika CSS/JS dibuat inline, file yang tidak diperlukan boleh dihapus.

## Rule untuk AI

- Hanya edit folder option yang sedang ditugaskan.
- Jangan edit halaman production `https://digmarketingmaul.com/products/digital-ads-management/`.
- Jangan edit option lain.
- Jangan menambahkan backend/API/payment logic ke playground.
- Fokus pada eksplorasi UI/UX dan visual.
- Semua asset lokal khusus option dapat diletakkan pada `assets/` di dalam option tersebut.
