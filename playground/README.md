# digmarketingmaul — Universal Visual Playground

Folder ini digunakan untuk eksperimen visual halaman, section, card, dan component sebelum perubahan diterapkan ke production.

## Prinsip utama

1. Production tidak diedit dari dalam playground.
2. Setiap option harus self-contained.
3. Nama option selalu stabil: `option-01`, `option-02`, `option-03`, dst.
4. AI / engine yang membuat option dicatat di `meta.md`, bukan pada nama folder.
5. Option lama tidak perlu dihapus setelah keputusan final; playground berfungsi sebagai design history.
6. Tidak ada dashboard/index utama. Semua preview diakses langsung melalui URL manual.

## Struktur

```text
playground/
├── pages/
│   ├── website-development/
│   └── digital-ads-management/
├── sections/
├── cards/
├── components/
└── _template/
    └── option-template/
```

## Contoh URL lokal

```text
http://127.0.0.1:5500/playground/pages/website-development/option-01/
http://127.0.0.1:5500/playground/pages/website-development/option-02/
http://127.0.0.1:5500/playground/pages/digital-ads-management/option-01/
```

## Contoh URL production/public

```text
https://digmarketingmaul.com/playground/pages/website-development/option-01/
https://digmarketingmaul.com/playground/pages/digital-ads-management/option-01/
```

## Membuat option baru

Copy folder:

```text
playground/_template/option-template/
```

ke target, kemudian rename menjadi nomor option berikutnya:

```text
option-01
option-02
option-03
...
```

Tidak ada batas jumlah option. Terus tambah sampai menemukan visual yang ingin dipakai.

## Setelah menemukan option final

Catat keputusan di `notes.md` pada folder target. Jangan otomatis replace production. Implementasi ke production dilakukan sebagai langkah terpisah setelah visual disetujui.
