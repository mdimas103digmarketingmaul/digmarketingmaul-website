# Visual Option 02 — Editorial Signal

Alternatif homepage digmarketingmaul.com untuk dibandingkan secara independen dengan Option 01. Sumber konten: `reference-current/` dalam ZIP yang dilampirkan. Implementasi maupun arah desain Option 01 tidak dibaca.

## Cara mencoba

1. Ekstrak ZIP ini ke root repository. Gabungkan folder `playground` yang sudah ada; jangan menghapus atau mengganti seluruh folder playground.
2. Buka `playground/home/option-02/index.html` menggunakan Live Server atau static server setara.
3. Contoh URL: `http://127.0.0.1:5500/playground/home/option-02/`.

Tidak ada proses npm install/build. Tidak ada perubahan pada produksi, shared playground, Option 01, payment, course, backend, atau Worker. Halaman daftar opsi playground tidak diubah; buka URL Option 02 langsung.

## Konsep desain

**Editorial Signal** menggabungkan tipografi editorial dengan grafis teknis yang tenang:

- Nama besar pada dua baris, ditata asimetris dengan foto profil asli.
- Potret dengan dua sudut melengkung, garis elips berlapis, grid halus, dan label Creative / Data / Experimentation.
- Warna dasar navy, aksen merah muda, identitas `M.`, Inter dan JetBrains Mono mengikuti referensi.
- Lima kategori marketing membentuk jalur navigasi di bawah hero, kemudian pemilih vertikal pada bagian stack.
- Sertifikasi disusun seperti daftar editorial; footer menonjolkan alamat email.

Copy utama, informasi pekerjaan di Hijra Bank, Bekasi, semua deskripsi kemampuan, nilai proficiency, subskills, dan enam nama sertifikasi mengikuti file sumber. Nilai proficiency diberi konteks self-assessed, bukan hasil campaign.

## Interaksi

- Potret dan grafis elips bergerak berlawanan arah mengikuti kursor, maksimal 6 px. Hanya aktif untuk pointer presisi dan bila reduced motion tidak diminta.
- Menu mobile memiliki state terbuka/tertutup dan dapat ditutup dengan Escape.
- Lima kategori dapat dipilih dengan mouse/touch, tombol panah, Home, dan End. Panah atas/bawah di desktop; kiri/kanan di mobile.
- Klik nama kemampuan untuk membuka deskripsi lengkap, proficiency, serta subskills bila tersedia.
- Tautan kategori pada hero memilih panel yang sesuai dan menuju bagian stack.
- Indikator scroll, penanda Home/Profile, dan animasi masuk satu kali saat section terlihat.
- Semua konten tersedia tanpa JavaScript; saat JavaScript dimatikan seluruh panel tampil berurutan, navigasi mobile terbuka, dan accordion native tetap berfungsi.

## File yang ditambahkan

```text
playground/home/option-02/
├── index.html
├── option-02.css
├── option-02.js
├── README.md
└── assets/
    ├── profile.webp
    └── favicon.svg
```

`profile.webp` merupakan versi ringan dari potret asli yang dilampirkan, bukan potret generatif. Aset kecil ini disertakan agar Option 02 dapat dipreview mandiri tanpa bergantung pada keberadaan folder `reference-current` di repository tujuan. Favicon memakai identitas asli.

## Tautan dan aset sertifikasi

- Frameworks, Products, dan Blog menuju halaman produksi menggunakan URL lengkap agar tidak menghasilkan path salah dari nested playground.
- Instagram, LinkedIn, dan email mengikuti referensi. TikTok tetap berstatus coming soon dan tidak diberi URL fiktif.
- ZIP referensi tidak menyertakan gambar sertifikasi. Judul dan tahun sertifikasi dipertahankan; saat dibuka tersedia tautan ke profil produksi dan penjelasan bahwa gambar tidak disertakan. Tidak ada gambar rusak atau sertifikat buatan.
- `noindex, nofollow` disertakan karena ini halaman eksperimen.

## Browser, performa, dan aksesibilitas

HTML, CSS, dan JavaScript vanilla; tanpa framework, icon font, canvas, atau library animasi. SVG sederhana dipakai untuk ikon dan garis grafis. Efek pointer dan scroll dijadwalkan dengan requestAnimationFrame; tidak ada animation loop terus-menerus.

Font dimuat dari Google Fonts dan membutuhkan koneksi internet. Tanpa koneksi, sistem memakai font sans-serif/monospace bawaan. Disarankan memakai versi terkini Chrome, Edge, Firefox, atau Safari. Backdrop blur/mask merupakan enhancement visual; konten tetap tersedia jika efek tidak didukung.

Semantik heading, skip link, focus ring, tab roles, accordion native, label tombol, dan `prefers-reduced-motion` disediakan. Social/email rail dihilangkan pada lebar 1000 px ke bawah. Tinggi viewport 850 px ke bawah memakai hero lebih ringkas pada desktop. Layout mobile disusun ulang dan kategori memiliki area horizontal scroll tersendiri.

## Status verifikasi

Sudah diperiksa secara statis:

- Sintaks JavaScript dengan `node --check`.
- ID unik, target anchor internal, jalur stylesheet/script/gambar, dan safe external links.
- Kelengkapan 22 deskripsi kemampuan, subskills, dan enam sertifikasi terhadap referensi.
- Aturan responsif untuk desktop besar, laptop pendek, tablet, dan mobile; dukungan reduced motion.
- Isi ZIP hanya memuat enam file di direktori Option 02.

**Batasan:** tool preview browser yang diwajibkan lingkungan tidak tersedia pada sesi pembuatan ini. Pemeriksaan visual/render aktual, navigasi keyboard aktual, collision, wrapping, dan kelancaran animasi belum terverifikasi di browser. Ini bukan klaim lulus visual QA.

Saat membuka Live Server, periksa pada 1440 × 900, 1280 × 800, 2560 × 1440, 768 × 1024, serta 390 × 844 (tambahan 320 px untuk layar sempit). Periksa hero, gambar, menu mobile, kategori, accordion, rail, zoom 200%, dan reduced motion.
