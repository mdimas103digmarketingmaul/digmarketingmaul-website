# DigMarketingMaul — Complete Brand Guide

| Metadata | Nilai |
| --- | --- |
| Brand | DigMarketingMaul |
| Website | https://digmarketingmaul.com/ |
| Document type | Complete Brand Guide / repository-derived source of truth |
| Version | 1.0 |
| Generated from | Current website repository |
| Last audited | 2026-10-25 |

## 00. Cara membaca dan batas audit

Dokumen ini mengekstrak identitas yang sudah ada, bukan menetapkan rebrand. Gunakan sebagai sumber utama untuk memahami desain website dan mengembangkan website, landing page, social visual, presentasi, produk digital, campaign, dan motion video yang masih terasa seperti DigMarketingMaul.

Tiga label digunakan sepanjang dokumen:

- **Observed:** ditemukan dalam HTML, CSS, JavaScript, atau aset repository. Nilai CSS adalah deklarasi source beserta konteksnya, bukan hasil pengukuran screenshot.
- **Inferred:** interpretasi pola yang berulang. Ini menjelaskan karakter, bukan klaim bahwa pemilik brand pernah menetapkan aturan tersebut.
- **Recommended:** arahan atau standardisasi untuk karya berikutnya. Belum merupakan implementasi atau aturan brand yang sudah disetujui.

Label pada pembuka bagian atau tabel berlaku untuk seluruh isi bagian/tabel tersebut, kecuali dinyatakan berbeda. Referensi `[S01]` dan seterusnya mengarah ke indeks source pada bagian 22. Selector disertakan agar sumber tetap mudah ditemukan meskipun nomor baris berubah.

**Observed — cakupan audit:** root homepage; katalog `/products/`; seluruh lima direktori detail produk yang tersedia, termasuk varian eBooks Midtrans; `/blog/`; library dan artikel framework; checkout; payment success; aset bersama; source runtime tema; serta inventaris playground dan admin sebagai pembanding. Playground tidak otomatis dianggap desain produksi. Audit membaca implementasi, urutan stylesheet, inline override, media query, dan perilaku JavaScript, bukan hanya nama file atau komentar.

**Batas validasi:** browser tidak tersedia dalam sesi audit. Tidak dilakukan validasi viewport secara langsung, pengukuran computed style, uji keyboard/screen reader, pengujian transaksi, atau konfirmasi kesamaan deployment publik dengan checkout repository. Aset portrait dibuka secara visual; logo/favicon ditelaah dari SVG. Temuan responsif dan interaksi di bawah adalah hasil audit source, bukan sertifikasi bahwa semua state bekerja sempurna di browser.

**Recommended — urutan pengambilan keputusan:** pertahankan DNA utama; pilih konteks halaman/produk; pakai nilai dari keluarga visual tersebut; baru eksplorasi komposisi. Jangan menggabungkan semua variasi repository menjadi satu style tanpa alasan. Untuk creative brief singkat gunakan dokumen Lite; untuk implementasi presisi gunakan panduan lengkap ini.

## 01. Brand overview

**Observed.** Website memperkenalkan M. Dimas Maulana sebagai digital marketer yang bekerja lintas creative, acquisition, measurement, build, dan optimization. Homepage menyebut website sebagai ruang berbagi pengalaman dan pembelajaran. Framework dan halaman layanan mengorganisasi pekerjaan menjadi tahapan, area, serta hubungan data → insight → action. [S01, S05, S10]

**Inferred.** Identitas utamanya adalah **praktisi digital marketing yang berpikir sistematis, tetapi tetap personal**. Desain menyeimbangkan ketegasan teknis dengan kemudahan memahami langkah berikutnya. Kredibilitas dibangun melalui struktur kerja, contoh proyek, dan sertifikasi; atmosfer visual memberi karakter tanpa menggantikan informasi.

Yang paling membedakannya adalah kombinasi headline sans besar dengan tracking rapat, label monospace kecil dan bernomor, navy sangat gelap, merah sebagai penunjuk fokus, grid/garis/orbit, dan cara menjelaskan layanan sebagai sistem. Satu elemen saja—misalnya Inter atau tombol merah—belum cukup membentuk identitas tersebut.

### Keluarga visual yang benar-benar ada

| Keluarga | Observed | Implikasi penggunaan — Inferred / Recommended |
| --- | --- | --- |
| Portfolio / field notes | Homepage, blog, library framework: navy gelap, aurora, grain, grid, headline besar, label monospace | Ekspresi personal, eksploratif, atmosferis |
| Commerce / layanan | Katalog default terang; Website Development dan Digital Ads memakai permukaan terang dengan blok navy, aksen merah, dukungan dark mode | Ekspresi praktis untuk memahami penawaran, proses, dan keputusan |
| Artikel framework | Default light dari initializer HTML, dukungan dark, TOC, panel bacaan panjang | Ekspresi editorial untuk pembelajaran mendalam |
| Website Course | Manrope + DM Sans, biru–lime, off-white hangat, ilustrasi browser, endorsement “by digmarketingmaul” | Variasi identitas produk yang teramati; bukan pengganti palet master |
| Checkout / pascapembayaran | Form ringkas, detail pembelian, status dan langkah berikut; checkout course punya override tersendiri | Dahulukan kepastian dan keterbacaan |

Sumber: [S01–S11]. **Observed:** komentar `worker.js` menyebut rollback tema portfolio, tetapi artikel framework tetap memiliki pengaturan light/dark native. Implementasi HTML/JS lebih menentukan daripada ringkasan komentar.

## 02. Brand personality

**Inferred — delapan karakter berikut disimpulkan dari implementasi:**

1. **Sistematis.** Penomoran, lifecycle, diagram tujuh area, matrix paket, dan flow keputusan membuat proses terlihat terhubung.
2. **Presisi.** Monospace, garis tipis, alignment, dan struktur katalog membantu membandingkan informasi.
3. **Tegas.** Headline besar, weight kuat, tracking rapat, dan kontras navy–terang memberi pusat perhatian yang jelas.
4. **Digital.** Grid, orbit, browser frame, progress, serta interaksi pointer membentuk bahasa lingkungan kerja digital.
5. **Editorial.** Kicker, judul, lead, nomor, dan blok bacaan membangun urutan membaca. Tidak bergantung pada serif.
6. **Personal.** Portrait, sapaan langsung, penyebutan Maul, dan jalur diskusi membuat keahlian terasa berasal dari seseorang.
7. **Praktis.** CTA menjelaskan langkah berikut; copy menerangkan scope, batas layanan, dan hasil yang dapat dipakai.
8. **Eksperimental terkendali.** Website menampilkan eksperimen, live test, dan motion atmosferis; struktur informasi tetap stabil.

“Cinematic” hanya cocok untuk lapisan atmosfer homepage, bukan seluruh UX. “Minimal” cocok untuk hierarki tertentu, tetapi bukan deskripsi literal karena dekorasi dan panel cukup banyak. Tidak ada dasar kuat untuk menyebut keseluruhan desain brutalist, luxury, atau playful. Course memiliki sisi lebih ramah dan ilustratif daripada master brand.

## 03. Core design principles

**Inferred → Recommended.** Prinsip berikut merumuskan pola yang ada menjadi arahan lintas media.

### 01 — Perlihatkan cara berpikir

Jadikan struktur, urutan, dan hubungan antarelemen bagian dari komunikasi. Nomor, garis, node, dan tahapan harus membantu menjelaskan sesuatu. Dasar: stack homepage, lifecycle website, map ads, dan framework.

### 02 — Merah mengarahkan perhatian

Gunakan merah pada keputusan, kata kunci, titik, active state, atau progres. Beri ruang netral agar merah tetap memiliki daya tarik. Favicon membuktikan bidang merah dominan bisa tepat untuk aplikasi kecil; ini bukan larangan memakai bidang merah.

### 03 — Tipografi membawa hierarki

Buat gagasan utama terasa kuat melalui ukuran, weight, dan ruang. Gunakan label kecil sebagai orientasi, bukan pesaing headline. Monospace paling berguna untuk nomor, metadata, harga, dan bahasa sistem.

### 04 — Atmosfer mendukung informasi

Grid, grain, gradient, dan glow memberi kedalaman. Intensitasnya harus turun ketika tugas pengguna beralih ke membaca detail, mengisi form, atau membandingkan pilihan.

### 05 — Beri ruang untuk membaca, kepadatan untuk membandingkan

Hero dan pergantian topik boleh lapang; tabel, ledger, dan katalog perlu alignment yang rapat dan konsisten. Jangan menyamakan whitespace dengan memperpanjang setiap section.

### 06 — Gerak menunjukkan hubungan

Reveal mengikuti urutan informasi, progress menunjukkan perkembangan, active node terhubung ke penjelasan. Gunakan ambient motion lebih lambat daripada respons kontrol.

### 07 — Kejelasan membangun kepercayaan

Tampilkan scope, status, dan batas penawaran secara eksplisit. Kejujuran halaman eBooks live test dan fee “TBC” lebih representatif daripada janji hasil tanpa bukti.

### 08 — Adaptasi bentuk, pertahankan karakter

Susunan baru, tema terang, diagram baru, maupun motion baru diperbolehkan. Pertahankan ketegasan, struktur, fokus, dan suara personal; tidak perlu menyalin layout homepage.

## 04. Visual design language

**Observed.** Mayoritas halaman memakai tipografi sans, bentuk geometris, alignment ke kiri, outline tipis, serta sudut membulat sedang. Header transparan berblur, panel gradient gelap, glow merah lokal, dan lingkaran/orbit terdapat pada portfolio. Halaman layanan memperluas bahasa ini menjadi blueprint, ledger, matrix, dan browser mockup. [S01–S05]

**Inferred.** Bahasa yang paling akurat adalah **editorial digital dengan struktur sistem dan kontras tegas**. Ekspresi premium muncul dari kontrol hierarki dan detail; bukan ornamen mewah. Perpaduan teks besar dan annotation kecil menghasilkan skala dramatis tetapi tetap informatif.

**Recommended.** Susun satu gagasan utama, satu visual penjelas, dan beberapa annotation yang benar-benar berguna. Komposisi dapat simetris untuk perbandingan atau asimetris untuk narasi. Pertahankan keterkaitan antarbagian melalui alignment, warna, atau garis—bukan dengan mengurung semua konten dalam kartu identik.

## 05. Color system

### 5.1 Master identity dan keluarga merah

**Observed — nilai aktual.** RGB diturunkan dari HEX. Merah merupakan aksen identitas sekaligus warna aksi, sementara navy dan neutral menguasai area background. Tidak ada token resmi bernama “primary brand color” yang menyatukan seluruh halaman.

| Warna | RGB | Peran dan contoh | Hubungan / konteks |
| --- | --- | --- | --- |
| `#FF304F` | 255, 48, 79 | `--accent` root; titik logo, accent heading, active stack, progress | Merah identitas portfolio; juga favicon [S01, S12] |
| `#FF4964` | 255, 73, 100 | `--accent-bright`; endpoint progress dan hover tertentu | Highlight lebih terang pada navy [S01] |
| `#C91839` | 201, 24, 57 | `--accent-dark`; awal gradient progress | Kedalaman merah, bukan background utama [S01] |
| `#FF3158` | 255, 49, 88 | `--accent` layanan/checkout; CTA katalog `.is-ready` | Variasi merah commerce; sedikit berbeda dari logo [S03–S09] |
| `#E92B50` | 233, 43, 80 | Hover primary CTA pada light mode | Versi commerce lebih gelap [S03–S09] |
| `#FF5575` | 255, 85, 117 | Hover accent layanan dalam dark mode | Versi commerce lebih terang [S04, S05, S07–S09] |
| `#FFF0F3` | 255, 240, 243 | `--accent-soft`; badge, selected surface | Bidang pendukung merah pada light; bukan warna teks [S04, S05, S07–S09] |

**Recommended — dominasi:** navy/neutral menjadi bidang mayoritas; merah terkonsentrasi pada sedikit titik fokus, aksi utama, dan hubungan antarbagian. Highlight/tint memiliki dominasi lebih rendah lagi. Jangan mengartikan tiga shade portfolio sebagai ramp numerik yang presisi. Tidak ditemukan rasio penggunaan warna resmi; panduan ini tidak menetapkan persentase seolah berasal dari source.

**Recommended — karya baru master brand:** gunakan `#FF304F` bersama navy logo untuk kontinuitas identitas. Ketika memperpanjang UI commerce yang sudah ada, ikuti `#FF3158` dan token lokalnya. Penyatuan kedua merah perlu keputusan desain terpisah; audit ini tidak mengubahnya.

### 5.2 Background, surface, text, border

**Observed.** Tabel ini mencatat keluarga warna; baris tidak boleh dipindah-pasangkan sembarang antar tema.

| Konteks / peran | Nilai | Penggunaan dan relasi | Dominasi — Recommended |
| --- | --- | --- | --- |
| Portfolio background | `#07111F` (7,17,31), `#050D18` (5,13,24), `#091522` (9,21,34) | Root `--bg-primary`, `--bg-deep`, `--bg-secondary`; gradient halaman [S01] | Mayoritas bidang gelap |
| Portfolio text | `#F4F6FA`, `#A5B0BF`, `#68778B` | Primary, secondary, muted pada navy [S01] | Primary untuk informasi inti; muted untuk metadata, bukan semua body |
| Portfolio border | `rgba(150,165,185,.15)` | Pemisah tipis; hover `rgba(255,48,79,.46)`, active `.80` [S01] | Sangat rendah, meningkat saat state berubah |
| Katalog / artikel light | `#F6F7F9`, `#EEF1F5`, `#FFFFFF` | Token background / deep / secondary [S01, S03, S10] | Mayoritas bidang terang |
| Katalog light rendered background declaration | `#FAFBFC → #F3F5F8 → #EEF1F5` | Gradient body menimpa penggunaan background token secara langsung [S01] | Halus; tidak menjadi ilustrasi utama |
| Katalog / artikel light text | `#17202C`, `#4F5C6C`, `#7A8797` | Primary, secondary, muted; border `rgba(23,32,44,.11)` [S01] | Hierarki informasi, bukan dekorasi |
| Layanan / transaksi light | `#F7F8FB`, `#FFFFFF`, `#F3F5F8` | Background, panel, panel sekunder [S04, S05, S07–S09] | Mayoritas bidang light |
| Layanan / transaksi light text | `#111827`, `#667085` | Primary dan muted [S04, S05, S07–S09] | Kontras utama dan pendukung |
| Layanan light line | `#E4E7EC`, `#D0D5DD` | Divider dan line-strong layanan [S04, S05] | Subordinat terhadap teks |
| Layanan / transaksi dark | `#07111F`, `#0D1B2D`, `#101F33` | Background, panel, panel-2 [S04, S05, S07–S09] | Mayoritas bidang dark |
| Layanan / transaksi dark text | `#EEF4FF`, `#9AA8BD` | Primary dan muted; line `rgba(148,163,184,.18)` [S04, S05, S07–S09] | Primary jelas; muted untuk detail |
| Ink focal blocks | `#07111F`, `#0D1B2D` (Website); `#0E1C2F`, `#15263D` (Ads) | Anatomy, system, process band, decision, CTA. Dalam dark, dasar ink menjadi `#0B1A2D` [S04, S05] | Fokus lokal, tetap hadir di halaman light |

### 5.3 Semantic dan warna pihak ketiga

**Observed.** Hijau mempunyai fungsi status/aksi tertentu, bukan aksen dekorasi master yang setara merah.

| Fungsi | Nilai penting | Contoh dan source |
| --- | --- | --- |
| Success / available | `#15803D`, soft `#ECFDF3`; dark `#4ADE80` | Status sukses dan checklist; live indicator pada anatomy [S04, S05, S08, S09] |
| Available katalog | `#34D399`, halo `rgba(52,211,153,.16)` | `.js-detail-card .payment-progress-dot` [S03] |
| WhatsApp | `#166534` di `#F0FDF4`; dark `#BBF7D0`; solid `#4ADE80` | CTA diskusi; dipisahkan dari CTA primary merah [S04, S05] |
| Pending / timeout | `#B45309` / `#B91C1C` | `.payment-progress[data-payment-state]` katalog [S03] |
| Error | `#B42318`, border `rgba(239,68,68,.35)`, bg `rgba(239,68,68,.07)` | `.status-box.error` checkout [S08] |
| Live test warning | `#9A3412` di `#FFF7ED`, border `#FED7AA`; dark text `#FCD34D` | Badge eBooks live test [S07] |
| Informational | `#F4F8FC`, `#D8E4F0`, `#475467` | Background, border, text info pada transaksi; dark text `#B5C2D4` [S08, S09] |

**Recommended.** Dominasi semantic rendah dan lokal: status harus disertai teks atau ikon, bukan hanya warna. Warna logo bank, kartu, platform, dan PayPal adalah identitas pihak ketiga, bukan perluasan otomatis palet DigMarketingMaul. Admin memiliki semantic tambahan seperti biru `#175CD3` dan ungu `#6941C6`; ini UI operasional, bukan bukti bahwa purple gradient adalah karakter brand. [S13, S15]

### 5.4 Gradients, opacity, overlay

**Observed:**

- Headline gelap memakai gradient text `96deg`, `#FFFFFF 12% → #DFE6F2 46% → #97A4B8 96%`; light memakai `#111923 → #253244 → #667589`. Accent text tetap merah. [S01]
- Aurora merah memakai alpha `.13`/`.075`; orb biru `rgba(90,130,255,.04)` sangat subordinat, blur `90px`. Ini atmosfer, bukan palet multiwarna utama. [S01]
- Grid `72px` memiliki white alpha `.022`; spotlight pointer memakai garis merah `.23`, radial mask `220px`, visible opacity `.72`. [S01]
- Grain SVG fractal noise opacity `.035`, blend `overlay`; portfolio mobile `.02`; katalog light `.016`, blend `multiply`. [S01]
- Portrait memiliki overlay merah/navy dengan `soft-light`, scanline opacity `.12`, inner shadow dan glow. [S01]
- Layanan memakai radial glow merah `.09` pada body; ink focal block dapat memakai `.14–.24`. [S04, S05]
- Header portfolio `rgba(7,17,31,.72)` dengan blur `20px`; header layanan light putih `.88` dengan blur `18px`. [S01, S04, S05]

**Recommended.** Pertahankan gradient dalam keluarga warna yang dekat. Translucency, glass, dan glow memang bagian existing design; gunakan terarah, jangan dilarang total atau diperbanyak pada setiap elemen.

### 5.5 Pengecualian Website Course

**Observed.** Palet light course: background `#F7F8F4`, paper `#FFFFFF`, ink `#202737`, muted `#606A79`, blue `#3042A2`, hover `#25347F`, lime `#E4F889`, line `#DDE2DC`, soft `#EFF2E9`, blue-soft `#EEF0FB`. Dark: background `#151B27`, paper `#1C2534`, ink `#F0F1E9`, muted `#B2BDCC`, blue `#A7B5FF`, hover `#C6CEFF`, line `#354053`, soft `#1D2831`, blue-soft `#29344D`. Merah `#D93642` muncul pada monogram mentor dan coretan harga. [S06]

**Inferred.** Off-white, biru, lime, bentuk arch, serta sapaan pembelajar memberi rasa lebih ramah. **Recommended:** pertahankan neutral dominan, biru untuk penekanan/aksi, lime sebagai bidang aksen lokal ketika membuat materi khusus course. Jangan mengangkat palet ini menjadi default seluruh brand tanpa keputusan eksplisit.

## 06. Typography system

### 6.1 Keluarga font dan cakupan

**Observed:**

| Family | Jenis / peran | Weight dan sumber |
| --- | --- | --- |
| Inter | Sans serif utama; display, heading, body; UI layanan | Google Fonts 400/500/600/700/800. Heading portfolio 700; heading layanan 800. CSS juga meminta 550/650/750 pada beberapa elemen; jangan menganggap semua weight itu diunduh secara eksplisit. [S01, S03–S05, S07–S10] |
| JetBrains Mono | Monospace; nav portfolio, kicker, nomor, metadata, harga, flow label | Portfolio/katalog import 400/500; layanan/transaksi import juga 600. Beberapa selector meminta 600/700. [S01, S03–S05, S07–S10] |
| Manrope | Sans serif display/heading course; harga dan wordmark produk | Import 400–800, heading lazim 800. [S06, S08] |
| DM Sans | Sans serif body dan kontrol course | Import 400–800; body 16px/1.65. [S06, S08] |
| Georgia | Serif dekoratif dalam ilustrasi course | `.work-one::after` menampilkan “Aa”; selector mini-preview lain juga mendeklarasikan Georgia, bukan sistem heading/body utama. [S06] |
| Roboto Mono | Deklarasi pada `.payment-status-detail` katalog | Tidak ditemukan import Roboto Mono pada halaman itu; fallback `monospace` berlaku bila font tidak tersedia. Bukan font inti yang terverifikasi dimuat. [S03] |
| Font Awesome 6.7.2 | Font ikon, bukan typeface untuk copy | Stylesheet CDN portfolio/katalog/framework/blog. [S01–S03, S10] |

Fallback yang ditemukan mencakup `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `system-ui`, `ui-sans-serif`, Arial, Helvetica, dan `sans-serif`; monospace mencakup `SFMono-Regular`, `SF Mono`, Menlo, `ui-monospace`, dan `monospace`. Arial/Helvetica juga dipakai dalam SVG wordmark PayPal dan template email di worker. Itu bukan kandidat font display baru. Playground Products option-02 mengimpor Inter 900 sebagai eksperimen; tidak dijadikan default produksi. [S11, S14]

**Inferred.** Kombinasi dominan adalah **sans + monospace**, bukan serif + sans. Sans memberi ketegasan dan aksesibilitas bahasa; monospace memberi kesan terukur, dokumentatif, dan teknis. Serif yang muncul di ilustrasi course hanya memperagakan kemungkinan desain lain.

### 6.2 Hierarki ukuran

**Observed — desktop/base declarations; breakpoint dapat mengubahnya:**

| Level | Ukuran / weight | Line-height / tracking | Source selector |
| --- | --- | --- | --- |
| Homepage H1 | `clamp(55px,5vw,82px)` / 700 | `.98` / `-.055em` | [S01] `.hero-title` |
| Blog/katalog display | `clamp(54px,6vw,92px)` / 700 | `.98` / `-.055em` | [S01] `.subpage-title` |
| Portfolio H2 | `clamp(38px,4vw,58px)` / 700 | `1.03` / `-.047em` | [S01] `.section-heading h2` |
| Website Development H1 | `clamp(46px,6.6vw,88px)` / 800 | `.95` / `-.062em` | [S04] `.hero h1` |
| Ads Management H1 | `clamp(52px,7.6vw,104px)` / 800 | `.92` / `-.066em` | [S05] `.hero h1` |
| Layanan section title | Sampai 56px / 800 | `1.02` / `-.048em` | [S04, S05] `.title` |
| Katalog card title | `clamp(22px,2vw,28px)`; mobile 24px | `1.15`; tracking diwarisi `-.04em` | [S03] catalog override |
| Blog topic title | 20px | `1.25` / `-.025em` | [S01] `.topic-card h3` |
| Lead/body | Hero 17–20px; konten umum 14–17px | Umumnya `1.6–1.78` | [S01, S04, S05] |
| Article body | 16px | `1.78` | [S01] `.article-section p` |
| Kicker | 12px portfolio; 11px layanan | `1.2` layanan; tracking `.14em` / `.17em`, uppercase | [S01, S04, S05] |
| Nav portfolio | 13px monospace | Nomor dipisah dari label | [S01] `.nav-link` |
| Harga katalog | `clamp(22px,2vw,26px)` / 500 mono | Tracking `-.035em` | [S01, S03] `.commerce-price` |
| Course H1 | `clamp(46px,5.2vw,70px)` / 800 Manrope | `1.08` / `-.06em` | [S06]; EN/mobile punya override |
| Course H2 | `clamp(34px,3.65vw,50px)` / 800 | `1.17` / `-.06em` | [S06] |

**Recommended.** Jaga kontras skala antara headline dan annotation; body jangan ikut dipadatkan dengan tracking negatif ekstrem. Uppercase cocok untuk label pendek. Caption kecil yang ada di source bukan target minimum keterbacaan untuk karya baru. Pastikan weight font tersedia atau dipetakan dengan sengaja.

## 07. Layout & grid

**Observed:**

- Portfolio memakai `--container:1480px`, dengan base `width:min(calc(100% - 96px),var(--container))`; ruang luar juga menampung social rails. Homepage hero memakai rasio `1.3fr/.7fr`, gap `92px`, portrait kanan. [S01]
- Katalog final dua kolom setara, gap `20px`; kartu memakai empat zona yang sejajar lewat CSS subgrid dengan fallback. Nilai ini menimpa layout lama di root CSS. [S03]
- Blog adalah sembilan **topic cards**, bukan feed artikel dengan cover/date. Grid 3 → 2 → 1 kolom. Tidak ada basis untuk mengarang standar thumbnail atau halaman artikel blog yang belum ada. [S02, S01]
- Website Development dan Ads memakai `.shell` maksimum `1200px`, lebar viewport dikurangi `48px`. Website hero `1.08fr/.92fr`, gap `72px`; Ads memakai hero top terbelah dan system map lebar di bawahnya. [S04, S05]
- Lifecycle dan FAQ Website memakai sidebar sticky; case study berselang posisi visual. Ads memakai ledger baris, matrix, serta flow measurement. Kepadatan mengikuti tugas, bukan satu template card. [S04, S05]
- Framework article memakai TOC `245px` + area konten maksimum `820px`, gap `76px`; pada ≤1180px menjadi `210px` + maksimum `760px`, gap `50px`. Panel bacaan menambah padding internal sehingga panjang baris nyata lebih sempit dari kolom. [S01, S10]
- Course container maksimum `1180px`, base viewport dikurangi `72px`; hero `1.02fr/1fr`, gap `65px`, dengan override layar lebar. Checkout form maksimum `780px`. [S06, S08]
- Full-bleed dipakai selektif: process band Website dan band course, dengan konten tetap dalam container. [S04, S06]

**Inferred.** Komposisi terasa editorial karena ada perbedaan skala, narasi, dan ruang antarbagian. Asimetri memakai grid yang dapat dijelaskan; bukan penempatan acak. Katalog sebaliknya mengutamakan keseimbangan untuk membandingkan pilihan.

**Recommended.** Gunakan komposisi terbelah untuk gagasan + bukti/visual, baris untuk proses, dan grid setara untuk pilihan setara. Jangan mengubah semua informasi menjadi bento. Dalam slide atau social visual, turunkan pola itu menjadi satu frame dengan pesan utama dan annotation pendukung.

## 08. Spacing & rhythm

**Observed.** Tidak ditemukan skala spacing global yang formal. Angka berulang menunjukkan ritme, tetapi bukan sistem 8pt yang ketat.

| Peran | Nilai yang ditemukan | Source |
| --- | --- | --- |
| Gap kontrol / chip | 4, 6, 7, 8, 10, 12px | [S01, S03, S04, S13] |
| Gap grid / kelompok | 16, 18, 20, 24px | [S01, S03–S05] |
| Padding card | Portfolio 25/24/22px; katalog 30/30/28px; mobile 24/20/22px | [S01, S03] |
| Pemisahan heading dan isi | 42px portfolio; 48px Ads; 52px Website | [S01, S04, S05] |
| Section portfolio | 74px atas, 100–110px bawah; mobile/tablet 64/84px | [S01] |
| Section layanan | 112px vertikal; Website 80px pada ≤840px, 68px pada ≤620px | [S04]; Ads memakai 80px pada ≤840px [S05] |
| Course section | 100px base, dengan override lokal/responsif | [S06] |
| Gap komposisi besar | 48, 56, 64, 72, 76, 80, 92px | [S01, S04, S05] |

**Recommended.** Ruang mengikuti kedekatan makna: label dan nilai rapat; paragraf dan CTA lebih renggang; topik baru paling lapang. Untuk standardisasi baru, kelompokkan menjadi micro/control/content/section/composition; angka final tetap bergantung konteks. Jangan mengklaim token spacing yang belum ada sudah dipakai di seluruh website.

## 09. Component language

**Observed — karakter komponen dan variasinya:**

| Komponen | Bahasa visual / perilaku |
| --- | --- |
| Navbar portfolio | Sticky, blur, garis bawah halus, logo SVG, nav bernomor monospace; active underline merah dan progress bar 2px. Social/email rails terpisah di desktop. [S01] |
| Header layanan | Monogram teks `M.`; control bahasa/tema/international; link kembali dan CTA. Ads menambah anchor nav pill di desktop. [S04, S05, S13] |
| Hero | Headline besar, kicker/eyebrow, body muted, titik atau kata aksen. Homepage portrait; layanan memakai anatomy/system map; course memakai browser ilustratif. [S01, S04–S06] |
| Primary CTA | Layanan: solid merah, white text, radius 12px, min-height 46px; large 54px/radius 14px. Hover naik 1px. Katalog final min-height 46px/radius 12px dan font mono. [S03–S05] |
| Secondary CTA | Neutral bordered; link teks dengan underline tipis; WhatsApp memakai hijau semantik. Hierarki bergantung intent, tidak semua tombol merah. [S04, S05] |
| Stack card | Lima kategori; active red border/top line dan tint; detail panel terpisah dengan skill bars. Hover desktop bisa memilih kategori, click juga tersedia. [S01] |
| Product card | Icon/category/index → title → description → price/status/CTA; baris sejajar. Available dot hijau; in-development hollow dot, muted icon/price, tanpa hover lift. [S03] |
| Blog topic card | Icon merah dalam kotak kecil, nomor sudut, judul + deskripsi. Elemen `article` bersifat informatif; efek hover bukan bukti link artikel. [S02] |
| Certifications / FAQ | Baris divider dengan `<details>/<summary>`; chevron atau plus berubah ketika terbuka. Sertifikat dibuka di panel gambar terang. [S01, S04, S06] |
| Scope ledger / matrix | Nomor, garis pemisah, label paket, checklist, selected column. Cocok untuk penawaran yang perlu dibandingkan. [S05] |
| Form | Label jelas, border tipis, input persegi membulat, fokus accent; checkbox/radio dikemas menjadi chip pada brief. Preview pesan mono dalam bidang navy. [S05, S08] |
| Badge / tag | Pill berisi metadata pendek, uppercase/mono pada layanan; kategori muted, status aktif lebih kontras. [S03–S05] |
| Dropdown | Bahasa memakai native select dengan chevron SVG; metode pembayaran memakai panel overlay, kategori, subkategori, logo, dan fee. [S08, S13] |
| Toggle | Track kecil, knob putih; on merah, knob bergeser 11px; label Dark/International. Course punya kontrol tersendiri. [S06, S13] |
| Modal pembayaran | Overlay navy `.50`, blur 2px; shell ≤560px × ≤760px, radius 18px, tombol close 42px; ≤640px menjadi fullscreen. Isi Snap berasal dari provider, bukan seluruhnya desain merchant. [S08] |
| Footer | Copyright “© 2026 Build and Design by Maul”, divider dan social/link utilitas; padat, tidak menjadi hero kedua. [S01–S06] |
| Mobile CTA | Website dock/floating Ads tampil setelah hero lewat dan hilang dekat CTA akhir; course menyembunyikan bar saat offer/closing terlihat. [S04–S06] |

**Inferred.** Komponen berbagi hierarki: permukaan tenang, garis tipis, label kecil, judul kuat, aksen sesuai state. **Recommended:** konsistensi berasal dari peran ini; bentuk setiap komponen tidak harus identik.

## 10. UI states

**Observed:**

- **Default:** surface netral, border rendah kontras, teks sekunder untuk konteks.
- **Hover:** warna/border menguat, underline memanjang, lift singkat; kadang sheen melintas pada portfolio cards. Topic icon bergerak `-2px` dan rotate `-2deg`. [S01]
- **Active/selected:** merah solid pada chips, tinted surface/border pada stack dan matrix; `aria-pressed`/`aria-selected` digunakan pada beberapa kontrol. [S01, S03, S05, S13]
- **Focus:** root memiliki outline accent; layanan outline 2px offset 3px; course outline 3px offset 5px. Beberapa kontrol compact justru mengandalkan perubahan border/color dan menghapus outline. [S01, S04–S06, S13]
- **Disabled/unavailable:** CTA katalog abu `#F2F4F7`, text `#667085`, line `#E4E7EC`; dark surface `#101F33`, text `#9AA8BD`. Payment button preview disabled opacity `.56`. [S03, S13]
- **Loading:** checkout `.loading` opacity `.72`, `pointer-events:none`; status box menjelaskan proses. [S08]
- **Success/error/pending:** warna semantik dan copy status, bukan hanya perubahan warna. [S03, S08, S09]
- **Empty / belum tersedia:** blog memiliki coming note; produk dalam pengembangan tetap terlihat dengan status; tidak ada standar empty dashboard global yang dapat disimpulkan. [S02, S03]

**Recommended.** Jadikan hover dan focus memberi informasi yang setara; state harus tetap terbaca tanpa motion. Jangan membuat kartu statis tampak seperti aksi utama apabila tidak dapat dibuka. Status produk dan status pembayaran adalah dua konteks berbeda.

## 11. Imagery & visual assets

**Observed:**

- Homepage memakai `assets/images/profile.png`: portrait personal dengan treatment warna dan streak cahaya merah/pink dalam asetnya. CSS menambahkan grayscale, contrast 1.05, brightness .95; hover menjadi berwarna, contrast 1.02, scale 1.03. Touch menampilkan versi berwarna. Crop `object-fit:cover`, center, frame aspect-ratio `.92`, base width 302px, radius 16px. [S01, S12]
- Enam PNG sertifikasi berada di `assets/images/certifications/`; disajikan dengan width 100%, height auto, frame terang maksimum 560px. Ini bukti yang perlu tetap terbaca, bukan ilustrasi untuk diwarnai ulang. [S01, S12]
- Website Development menampilkan live iframe Hanasari dan MammaRoti dalam browser frame, bukan screenshot lokal. `.browser-view` aspect-ratio 16/10; script menghitung scale terhadap lebar dasar 1024/1366. Warna desain klien bukan warna master DigMarketingMaul. [S04]
- Ads mengandalkan diagram HTML/CSS/SVG. Course membangun ilustrasi browser dan bentuk abstrak via markup/CSS; “Bumi Aksara” dan contoh domain dinyatakan sebagai contoh. [S05, S06]
- Logo pembayaran tersedia sebagai WebP/SVG; memakai `object-fit:contain` di bidang putih. Tidak ada dasar untuk mewarnai semua logo bank menjadi merah. [S13]

**Recommended.** Prioritaskan aset personal, bukti kerja, UI nyata, atau diagram yang menjelaskan konsep. Foto dapat diberi treatment kontras/monokrom terarah; jangan mengaburkan wajah atau bukti. Untuk campaign baru, ilustrasi boleh berbeda selama punya fungsi naratif. Jangan membuat hasil campaign, testimoni, sertifikasi, atau angka dashboard fiktif untuk mengisi ruang.

### Logo dan favicon

**Observed.** `assets/brand/logo/icon.svg` adalah mark geometris angular menyerupai bentuk sigma terbuka dengan titik di kanan: path navy `#07111F`, dot `#FF304F`, viewBox 64×64. `icon-reversed.svg` mengganti path utama menjadi `#F4F6FA`, dot tetap merah. Deskripsi bentuk ini bukan klaim makna simbol yang ditetapkan pemilik.

Favicon baru memakai bidang persegi merah `#FF304F`, mark + dot putih, group translate 6.4/scale .8. PNG 192/512, maskable 512, apple-touch-icon, ICO dan webmanifest tersedia. Manifest background/theme `#07111F`. File `assets/images/favicon.svg` lama masih berupa huruf M putih pada kotak merah radius 14. Halaman layanan memakai monogram teks `M.`; course memakai mark kode dan wordmark produk. [S12, S04–S06]

**Recommended.** Pakai aset SVG master untuk karya brand baru, reversed pada bidang gelap. Pertahankan proporsi, titik, dan kontras; jangan menggantinya dengan huruf atau ikon lain. Clear space, minimum size cetak, dan animasi resmi belum ditemukan. Tentukan lewat uji keterbacaan; jangan menganggap ukuran navbar 36px sebagai ukuran minimum semua media.

## 12. Iconography

**Observed.** Portfolio memakai Font Awesome solid/regular/brands, termasuk platform, tools, sosial, panah, dan lokasi. Layanan memakai inline SVG dengan stroke sederhana serta simbol teks `→`, `↗`, `↓`, `+`, dan `✓`. Nomor sering menggantikan ikon ketika urutan lebih penting. [S01–S06]

**Inferred.** Iconography bersifat fungsional dan terkait topik. **Recommended:** pakai satu gaya ikon per komposisi; berat garis dan ukuran harus seimbang dengan teks. Merah cocok untuk ikon navigasi konsep, hijau untuk status/WhatsApp, warna asli untuk identitas pihak ketiga. Jangan mencampur emoji, glossy 3D icon, dan outline tipis tanpa konsep yang jelas.

## 13. Decorative language

**Observed.** Pola khasnya meliputi garis 1px; garis aksen 2–3px; titik kecil; penomoran 01; grid 72px portfolio dan 64px layanan; orbit dashed/solid; stripe diagonal pada detail panel; grain SVG; scanline portrait; dan watermark `M.` beropacity rendah pada CTA layanan. [S01, S04, S05]

Radius tidak tunggal: root 15/20px; layanan 16px dengan large 24px Website atau 26px Ads; final CTA 28/30px; article panel 28px yang mengecil menjadi 24/22px; pill 999px. Border membuat struktur, radius melunakkan kelompok, shadow memisahkan lapisan. [S01, S04, S05]

Shadow contoh: card hover portfolio `0 20px 44px rgba(0,0,0,.30)`; soft layanan light `0 8px 28px rgba(15,23,42,.05)`; Website ink `0 40px 90px -36px rgba(7,17,31,.55)`. Kedalaman jauh lebih kuat pada focal block daripada seluruh background. [S01, S04]

**Recommended.** Pilih sedikit motif yang terhubung ke pesan. Garis boleh menjadi alur, titik menjadi lokasi perhatian, orbit menjadi hubungan. Negative space adalah bagian komposisi yang menjaga motif tersebut tetap terbaca. Jangan menjadikan semua tekstur sebagai lapisan wajib.

## 14. Motion & interaction language

### 14.1 Inventaris motion aktual

**Observed:**

| Pola | Nilai / perilaku | Source |
| --- | --- | --- |
| Easing portfolio | `cubic-bezier(.22,1,.36,1)` | [S01] `--ease-out` |
| Easing layanan | `cubic-bezier(.2,.7,.2,1)` | [S04, S05] `--ease` |
| Hero reveal portfolio | 850ms; masked headline translateY 112% → 0; fadeUp 14px; delay 90/260ms | [S01] `.reveal-item`, keyframes |
| Scroll reveal portfolio | 760ms; opacity + translateY 20px; IntersectionObserver threshold .10, sekali terlihat | [S01] CSS/JS |
| Layanan reveal | 700ms/18px; entrance 800ms/16px; Website stagger 50ms bertahap, anatomy 180ms; Ads 80/160/240ms | [S04, S05] |
| Respons kontrol | Nav 180ms, underline 320ms; layanan button 180ms; toggle 180ms; card hover 320ms | [S01, S04, S05, S13] |
| Card sheen | Perjalanan left -48% → 120%, skew -18deg; 820ms | [S01] `.card-sheen` |
| Skill progress | scaleX 650ms; stagger 65ms per bar; shimmer 3.8s; subskill delay 90+70×index ms | [S01] CSS/JS |
| Stack detail swap | Fade/translate 7px, transition 220ms; update konten setelah 130ms | [S01] `activateStack` |
| Portrait | Filter 700ms, zoom 800ms, tilt transition 380ms; JS translate x/y×8px, rotate x/y×4.5deg dari koordinat relatif | [S01] CSS/JS; pointer tilt hanya lebar ≥900px |
| Orbit portfolio | Outer 44s, inner 60s reverse, dot 22s; blog orbit 40/54s | [S01] linear infinite |
| Ambient | Aurora 26/34/42s ease-in-out; dot pulse 3.2s; grain 1.2s steps(4) | [S01] |
| Certificate open | 420ms, fade + translateY -7px; chevron 340ms/180deg | [S01] |
| Anatomy Website | Auto-cycle 2600ms, progress linear; live pulse 2.4s | [S04] CSS/JS |
| Ads map | Auto-cycle 2400ms; ring stroke-dashoffset 9s linear; node scale 1.14/300ms | [S05] CSS/JS |
| Ledger Ads | Open 400ms, fade + translateY -6px; plus-to-minus 300ms | [S05] |
| Mobile dock / FAB | Slide dari 140% Website /160% Ads,350ms | [S04, S05] |
| Course | Button 180ms/lift 2px, disclosure 200ms, mobile CTA 200ms; browser ilustrasi rotate -2deg adalah pose statis | [S06] |

Auto-cycle layanan berhenti saat hover/focus, di luar viewport, atau document hidden; reduced motion menonaktifkannya. Spotlight grid mengikuti pointer halus; ini tidak mengganti cursor sistem. Scroll progress mengukur posisi halaman. Tidak ditemukan marquee, scroll parallax multi-layer, elastic/spring motion, atau page-transition system pada source produksi yang diaudit. Jangan menyebutnya sebagai motion existing. [S01, S04, S05]

### 14.2 Sintesis bahasa gerak

**Inferred.** Gerak DigMarketingMaul mempunyai tiga tempo: **respons cepat**, **reveal yang tenang**, dan **ambient yang sangat lambat**. Easing keluar halus membuat elemen tiba dengan pasti; linear dipakai untuk rotasi/progress berkelanjutan. Bahasa ini lebih menjelaskan sistem daripada menampilkan kelucuan. Tidak ada overshoot elastis sebagai pola dominan.

**Recommended.** Gunakan gerak untuk menjawab: apa yang muncul, apa yang berubah, dan bagaimana bagian-bagian saling terkait? Stagger mengikuti urutan membaca. Pada layar kompleks, satu proses dominan bergerak sementara sisanya stabil. Beri waktu membaca setelah gerak berhenti.

## 15. Motion video translation

**Recommended — seluruh bagian ini adalah pengembangan kreatif, bukan motion guideline video yang ditemukan di repository.** Nilai durasi website menjadi referensi rasa; jangan menyalinnya mentah ke setiap shot. Tidak ditemukan musik, audio logo, footage brand film, atau timeline video resmi.

### Typography motion

Masukkan headline melalui mask dari bawah atau slide pendek + fade, dengan penghentian halus. Bangun frase per unit makna; satu kata merah dapat muncul terakhir untuk emphasis. Label/nomor hadir sedikit lebih awal sebagai orientasi. Keluar melalui cut atau arah yang konsisten; hindari membuat tiap huruf berputar sendiri tanpa alasan.

Untuk caption, utamakan keterbacaan dan kontras, bukan imitasi ukuran label web. Highlight merah cukup pada kata atau ide penting. Sans utama tetap membawa pesan; monospace menjadi annotation atau angka.

### Logo motion

Mulai dari titik, lalu ungkap mark asli dengan mask sederhana; alternatifnya mark muncul utuh dengan fade dan pergeseran kecil. Akhiri pada proporsi SVG asli yang stabil. Dot dapat menjadi titik awal jalur visual sebelum kembali ke posisi logo. Ini pilihan konsep; tidak ada urutan logo resmi. Jangan mengubah geometri logo menjadi simbol lain di end frame.

### Transition

Gunakan cut tegas, wipe mengikuti garis/divider, atau match cut antara dot → node → active state. Transisi panel dapat mengikuti perpindahan bab. Pergantian navy ke light bisa menandai perpindahan dari gagasan ke demonstrasi. Flash merah fullscreen hanya sebagai aksen singkat bila pesan membutuhkan energi; bukan transisi default berulang.

### Product / UI motion

Bangun frame browser atau panel bersih, lalu fokuskan satu tindakan. Ungkap urutan seperti objective → measurement → campaign → review. Highlight bergerak mengikuti node/baris yang sedang dijelaskan. Zoom ke detail UI sebelum teks menjadi terlalu kecil. Bedakan diagram konseptual dari UI produk nyata; jangan membuat angka dashboard seolah bukti performa.

### Camera movement

Gunakan kamera virtual stabil, push-in lambat, pan pendek, atau depth tipis antar lapisan UI. Pointer tilt homepage memberi inspirasi parallax kecil, bukan dasar untuk kamera berputar 360°. Hindari perspektif ekstrem yang menyulitkan membaca screenshot.

### Pacing dan durasi kerja

Sebagai starting point kreatif, respons/penekanan bisa sekitar 0.15–0.35s; reveal frase/panel sekitar 0.5–0.9s; hold mengikuti panjang kalimat. Angka ini rekomendasi, bukan token video existing. Hook boleh cepat; penjelasan harus melambat ketika detail bertambah. Energi datang dari pergantian gagasan dan kontras, bukan jumlah efek.

| Format | Adaptasi yang disarankan |
| --- | --- |
| Reels / TikTok | Satu ide per beat, headline besar, satu diagram sederhana, crop vertikal yang disusun ulang; letakkan teks di area aman UI platform |
| Video ads | Hook konkret → mekanisme/bukti → CTA; logo dan merah menjadi pengikat antarbeat, bukan watermark besar sepanjang video |
| Product video | UI tajam, zoom selektif, highlight langkah, durasi baca lebih panjang |
| YouTube / explainer | Bab bernomor, diagram berkembang bertahap, pause saat kesimpulan penting |
| Brand film | Portrait/proses nyata, navy dan cahaya merah lokal, pacing lebih lapang, pernyataan singkat |
| Motion graphics / presentasi | Susunan modular, nomor/garis sebagai navigasi; tetap efektif sebagai frame statis |

### Background, accent, sound

Background dapat berupa navy solid, off-white, grid sangat halus, atau drift cahaya merah. Grain hanya bila menambah kedalaman tanpa merusak kompresi dan keterbacaan. Tidak perlu membawa aurora ke setiap format.

Merah menandai fokus, titik keputusan, atau perubahan state. Hijau tetap bermakna sukses/tersedia bila relevan; jangan menjadi aksen acak. Course boleh memakai biru–lime dalam campaign course, dengan endorsement yang jelas.

Sound direction: electronic yang bersih, pulse ringan, click/tick pendek untuk pergantian node, dan whoosh lembut untuk transisi besar. Sisakan ruang untuk suara manusia. Hindari alarm, glitch terus-menerus, dan impact dramatis pada setiap kata. Ini konsep audio baru, bukan temuan aset audio website.

## 16. Copywriting & tone of voice

**Observed:** homepage/blog dominan Inggris; layanan dan artikel framework menyediakan ID/EN; course default Indonesia dengan terjemahan melalui JS. International mode dapat memaksa English dan mengubah jalur CTA. Copy menggabungkan istilah teknis Inggris dengan kalimat Indonesia yang praktis. [S01–S10, S13]

Homepage memakai “Hi, my name is” dan pengalaman pribadi. Blog memakai “Notes, Ideas & Experiments.” Website Development memakai “Ceritakan website yang kamu butuhkan”; Ads memakai “Kelola ads sebagai sistem”; CTA “Diskusikan Scope”, “Lihat Scope & Detail”, dan “Susun brief diskusi” menjelaskan tindakan. Ini contoh aktual, bukan tagline wajib.

Panjang copy mengikuti kebutuhan: heading singkat, deskripsi katalog ringkas, framework lebih panjang, FAQ/ketentuan lebih rinci. Course lebih conversational (“kamu”, “japri”, “bingung”), sedangkan layanan memakai “Maul” sebagai penyedia dan membahas scope. Bahasa personal tidak berarti semua media harus memakai slang.

**Inferred.** Tone paling konsisten: praktisi yang menjelaskan, bukan korporasi yang mengumumkan kehebatan. Kata seperti build, measure, test, learn, scope, dan system muncul karena metode kerja, bukan sekadar jargon estetis.

**Observed — ketegangan dengan preferensi ringkas pengguna:** course/katalog memuat urgensi harga Oktober 2026; course berulang kali menjanjikan pendampingan sampai live; halaman layanan mengulang scope di beberapa lokasi; artikel memakai konstruksi perbandingan cukup sering. Maka “seluruh copy existing sudah singkat dan tidak menjual” bukan kesimpulan yang akurat.

**Recommended — pedoman ke depan:**

- Nyatakan manfaat atau tindakan konkret pada kalimat awal. Satu paragraf menangani satu gagasan.
- Gunakan heading sebagai ringkasan isi, bukan slogan abstrak yang bisa dipakai semua brand.
- Pertahankan istilah teknis bila membantu presisi; beri konteks hasil praktis untuk pembaca pemula.
- CTA menyebut aksi dan tujuan. Sesuaikan “Lihat detail”, “Diskusikan scope”, atau “Mulai belajar” dengan tahap pengguna.
- Hindari mengulang manfaat yang sama pada hero, subtitle, caption, dan CTA dalam satu viewport/frame.
- Pakai “saya”, “Maul”, dan “kamu” sesuai narator; jangan berganti tanpa alasan dalam satu karya.
- Klaim, angka, harga, promo, pekerjaan saat ini, dan ketersediaan produk harus diverifikasi saat publikasi. Snapshot Oktober 2026 bukan fakta evergreen.
- Untuk video/social, ringkas pesan tanpa menghilangkan batas penawaran. Hindari superlatif, janji hasil pasti, dan kalimat generik seperti “solusi revolusioner untuk kesuksesan tanpa batas”. Contoh ini adalah anti-pattern baru, bukan kutipan website.

## 17. Responsive design principles

**Observed — tidak ada satu breakpoint global:**

| Keluarga | Perubahan utama |
| --- | --- |
| Portfolio | ≤1180px: topic grid 2 kolom, stack horizontal; ≤820px: hero 1 kolom, rails dan cursor light hilang, topic 1 kolom, stack scroll-snap; ≤620px: skill row 1 kolom, portrait/typography mengecil; ≤390px: penyesuaian tambahan. [S01] |
| Portfolio gutters | Base 48px per sisi; 1181–1360px aturan gutter 44px; pada ≤1180px aturan berikutnya memakai 28px; ≤820px: 18px; ≤620px: 14px; ≤390px: 12px. Header punya override lebih kecil:12px pada ≤620px dan 9px pada ≤390px. [S01] |
| Katalog | ≤900px menjadi 1 kolom dan subgrid per-row dinonaktifkan; ≤620px filter chip scroll horizontal, padding card mengecil. [S03] |
| Website Development | ≤1080px hero/lifecycle/FAQ menumpuk; ≤840px shell 16px/sisi, case/paths 1 kolom, dock aktif; ≤760px nav-actions disembunyikan; ≤620px rail horizontal menjadi timeline vertikal. [S04] |
| Ads Management | ≤1140px page-nav hilang; ≤1024px map/legend menumpuk; ≤840px measurement lanes menjadi vertikal, FAB aktif; ≤620px ledger/form lebih sederhana. Matrix tetap beberapa kolom dengan teks pendukung dikurangi. [S05] |
| Artikel | ≤900px TOC tidak sticky, menjadi grid di atas isi; ≤820/620px panel padding mengecil. [S01] |
| Course | Breakpoint 1100/860/680/365px; header-nav disembunyikan ≤1100px oleh override terakhir; mobile CTA ≤680px mempertimbangkan safe-area inset. [S06] |
| Checkout | ≤700px summary/meta menumpuk; modal Snap ≤640px fullscreen; payment methods ≤560px fee pindah di bawah nama. [S08, S13] |

**Recommended.** Susun ulang komposisi berdasarkan urutan baca; jangan sekadar mengecilkan desktop. Pertahankan makna diagram ketika koneksi horizontal berubah vertikal. Kurangi dekorasi sebelum mengecilkan informasi penting. Untuk media vertikal, tampilkan bagian UI yang relevan, bukan seluruh desktop screenshot dipaksa muat.

## 18. Accessibility considerations

**Observed — fondasi yang ada:** semantic heading, label input, alt portrait/certificate, aria-hidden dekorasi, native details, aria state pada sejumlah kontrol, skip link pada layanan/course, focus styling, dan reduced-motion rules. Home touch tidak bergantung pada hover untuk melihat portrait berwarna. Website/Ads reveal dibatasi `html.js` dan prefers-reduced-motion; JS menyediakan fallback ketika IntersectionObserver tidak tersedia. [S01, S04–S06, S08, S13]

**Observed — area yang perlu diperiksa:** nav portfolio turun hingga 7.35px pada ≤390px; beberapa label/status/fee juga 8–11px. Root `.section-reveal` tersembunyi secara default sampai JS berjalan, kecuali artikel diberi override agar konten langsung terlihat. Sejumlah compact control menghapus outline. Checkout overlay memiliki definisi visual, tetapi audit ini belum membuktikan focus trap/restore dan navigasi keyboard bekerja. Tidak dilakukan pengukuran contrast ratio.

**Recommended.** Uji kontras pasangan aktual pada kedua tema, terutama merah dengan putih/neutral, muted text, gradient text, serta status. Sediakan state dengan teks/ikon, bukan warna saja. Uji zoom, reflow, panjang terjemahan, focus order, dropdown, modal, dan target sentuh. Ukuran kecil existing jangan dipromosikan sebagai standar ideal. Pastikan reduced motion menyisakan konten yang terlihat dan kontrol yang dapat digunakan. Untuk video, caption harus tetap terbaca dan hindari kilatan berulang. Bagian ini adalah arahan kualitas, bukan klaim lulus standar aksesibilitas tertentu.

## 19. Do / Don't

**Recommended — berdasarkan pola yang diaudit:**

| Do | Don't | Mengapa |
| --- | --- | --- |
| Headline tegas dengan ruang dan subcopy berguna | Semua teks besar, bold, dan merah | Hierarki membutuhkan perbedaan tingkat perhatian |
| Merah sebagai fokus/aksi, neutral sebagai panggung | Merah untuk seluruh panel, body, border, dan glow sekaligus | Aksen kehilangan fungsi penunjuk |
| Diagram yang menjelaskan proses nyata | Node dan chart acak untuk kesan teknis | Brand kuat pada struktur kerja, bukan simulasi kompleksitas |
| Variasikan baris, grid, dan section terbuka | Setiap kalimat dibungkus rounded card | Existing site juga memakai ledger, divider, timeline, dan ruang terbuka |
| Glass/glow lokal dan tenang | Seluruh layar transparan, glowing, bergradient ramai | Kedalaman seharusnya membantu fokus dan kontras |
| Copy konkret, personal, dengan batas scope | Jargon panjang dan janji performa tanpa bukti | Merusak kredibilitas praktisi |
| Motion mengikuti urutan informasi | Bounce, spin, glitch, zoom pada semua elemen | Tidak sesuai gerak dominan yang terkendali |
| Pilih satu keluarga visual per konteks | Campur biru–lime course, merah master, dan warna klien tanpa hierarki | Variasi produk berubah menjadi inkonsistensi |

## 20. Anti-AI-slop guidelines

**Recommended.** Penilaian utamanya bukan apakah satu efek sedang populer, tetapi apakah keputusan desain mempunyai alasan yang spesifik untuk pesan dan pengguna DigMarketingMaul.

1. Mulai dari gagasan dan urutan informasi. Jangan mulai dari template hero–bento–logo cloud–testimonial yang tidak didukung konten.
2. Bangun karakter melalui kombinasi tipografi tegas, annotation sistematis, ruang, dan aksen. Inter sendirian tidak membuat karya otomatis generik; hierarki yang lemah dan susunan tanpa konteks yang membuatnya generik.
3. Gunakan bukti nyata. Jangan menciptakan dashboard metric, client logo, testimonial, atau angka pertumbuhan untuk membuat mockup terlihat lengkap.
4. Hindari ungu–biru neon, glassmorphism, atau 3D blob sebagai default otomatis. Jika eksplorasi memang memerlukannya, jelaskan peran dan pertahankan identitas utama.
5. Jangan menghapus seluruh gradient, rounded corner, atau glow hanya karena dianggap tren AI. Ketiganya memang ditemukan di website; yang perlu dikendalikan adalah intensitas dan fungsi.
6. Hapus kalimat yang mengulang gagasan tanpa menambah informasi. Namun jangan memotong scope, status test, atau informasi pembelian yang dibutuhkan untuk keputusan.
7. Tinjau hasil sebagai frame statis: apakah pesan utama jelas sebelum animasi dimulai? Jika tidak, motion belum menyelesaikan masalah komposisi.

## 21. Design tokens reference

### 21.1 Token existing

**Observed.** Namespace lokal berbeda; tabel ini bukan satu stylesheet gabungan yang aman ditempel ke production.

| Namespace / source | Token | Nilai base |
| --- | --- | --- |
| Root [S01] | `--bg-primary`, `--bg-deep`, `--bg-secondary` | `#07111f`, `#050d18`, `#091522` |
| Root [S01] | `--text-primary`, `--text-secondary`, `--text-muted` | `#f4f6fa`, `#a5b0bf`, `#68778b` |
| Root [S01] | `--accent`, `--accent-bright`, `--accent-dark` | `#ff304f`, `#ff4964`, `#c91839` |
| Root [S01] | `--border`, `--border-hover`, `--border-accent` | `rgba(150,165,185,.15)`, `rgba(255,48,79,.46)`, `rgba(255,48,79,.80)` |
| Root [S01] | `--container`, `--radius-md`, `--radius-lg` | `1480px`, `15px`, `20px` |
| Root [S01] | `--font-sans`, `--font-mono` | Inter + system fallback; JetBrains Mono + mono fallback |
| Root [S01] | `--ease-out` | `cubic-bezier(.22,1,.36,1)` |
| Website/Ads [S04, S05] | `--bg`, `--panel`, `--panel-2` | `#f7f8fb`, `#fff`, `#f3f5f8` |
| Website/Ads [S04, S05] | `--text`, `--muted`, `--line`, `--line-strong` | `#111827`, `#667085`, `#e4e7ec`, `#d0d5dd` |
| Website/Ads [S04, S05] | `--accent`, `--accent-hover`, `--accent-soft` | `#ff3158`, `#e92b50`, `#fff0f3` |
| Website/Ads [S04, S05] | `--radius-md`, `--radius-lg` | `16px`, Website `24px` / Ads `26px` |
| Website/Ads [S04, S05] | `--ease`, `--mono` | `cubic-bezier(.2,.7,.2,1)`; JetBrains Mono + fallback |
| Course [S06] | `--bg`, `--paper`, `--ink`, `--muted` | `#f7f8f4`, `#fff`, `#202737`, `#606a79` |
| Course [S06] | `--blue`, `--blue-hover`, `--lime`, `--line` | `#3042a2`, `#25347f`, `#e4f889`, `#dde2dc` |

Theme overrides, semantic colors, shadow, typography, spacing, dan motion lengkap dijelaskan pada bagian 5–8 dan 14. Banyak nilai masih hard-coded, termasuk durasi, gutter, dan beberapa radius. Root `--accent` juga bukan jaminan semua komponen memakai warna yang sama: katalog memakai inline CTA commerce red.

### 21.2 Standardisasi yang dapat dipertimbangkan

**Recommended — belum ada sebagai token source:** alias semantik seperti `brand.red`, `surface.canvas`, `surface.focus`, `text.primary`, `border.interactive`, `motion.feedback`, `motion.reveal`, dan `motion.ambient`. Petakan alias ke nilai per tema/produk dahulu, baru pertimbangkan penyatuan. Jangan otomatis menormalkan seluruh radius, font, atau breakpoint menjadi satu angka.

## 22. Source references

Semua path relatif terhadap root repository. Link di bawah relatif terhadap lokasi dokumen. Selector dan nama fungsi menjadi locator utama; path juga tertulis agar dokumen tetap berguna jika dipindahkan sebagai context AI.

| ID | Source | Bukti utama |
| --- | --- | --- |
| S01 | [index.html](../../index.html), [styles.css](../../styles.css), [script.js](../../script.js) | Homepage; root token; atmosphere; hero; stack; certification; nav/footer; shared responsive; reveal, tooltip, tilt, progress; shared article/catalog styles |
| S02 | [blog/index.html](../../blog/index.html) | Hero field notes, sembilan topic cards, coming note; memakai root CSS/JS |
| S03 | [products/index.html](../../products/index.html), [products/products-catalog.css](../../products/products-catalog.css), [products/products-catalog.js](../../products/products-catalog.js) | Inline CTA/status/theme/international overrides; final balanced grid, subgrid, filter, available state |
| S04 | [products/website-development/index.html](../../products/website-development/index.html), [styles.css](../../products/website-development/styles.css), [script.js](../../products/website-development/script.js) | Lifecycle, anatomy, work previews, process rail, pricing, FAQ, dock; token/light-dark; cycle 2600ms |
| S05 | [products/digital-ads-management/index.html](../../products/digital-ads-management/index.html), [styles.css](../../products/digital-ads-management/styles.css), [script.js](../../products/digital-ads-management/script.js) | System map, ledger, measurement lanes, matrix, fee, brief builder, FAB; cycle 2400ms |
| S06 | [products/website-course/index.html](../../products/website-course/index.html), [styles.css](../../products/website-course/styles.css), [script.js](../../products/website-course/script.js), [theme-init.js](../../products/website-course/theme-init.js) | Course sub-identity, fonts, copy/translation, browser illustration, curriculum, support, offer, responsive CTA |
| S07 | [products/digital-marketing-ebooks/index.html](../../products/digital-marketing-ebooks/index.html), [products/digital-marketing-ebooks-midtrans/index.html](../../products/digital-marketing-ebooks-midtrans/index.html) | Inline commerce design, live-test warning, bilingual CTA; varian provider bukan brand baru |
| S08 | [checkout/index.html](../../checkout/index.html) | Form, state, merchant overlay, success UI, course-specific overrides; visual audit saja |
| S09 | [payment/success/index.html](../../payment/success/index.html) | Transaction palette, success/access/info panels; tidak mengakses order nyata |
| S10 | [frameworks/index.html](../../frameworks/index.html), [frameworks/digital-ads-operating-system/index.html](../../frameworks/digital-ads-operating-system/index.html) | Library, numbered long-form framework, native article-theme initializer dan controls; shared styles S01 |
| S11 | [worker.js](../../worker.js), [assets/site-theme.js](../../assets/site-theme.js) | `isThemeManagedStaticPath`, `serveStaticAsset`: generic theme injection hanya path profile; runtime CSS bukan bukti aktif di semua halaman; email fallback fonts |
| S12 | [assets/brand/logo/icon.svg](../../assets/brand/logo/icon.svg), [icon-reversed.svg](../../assets/brand/logo/icon-reversed.svg), [favicon.svg](../../assets/brand/favicon/favicon.svg), [site.webmanifest](../../assets/brand/favicon/site.webmanifest), [legacy favicon](../../assets/images/favicon.svg), [profile.png](../../assets/images/profile.png) | Logo master/reversed, favicon family, legacy M, portrait; `assets/images/certifications/` untuk sertifikat |
| S13 | [assets/compact-controls.css](../../assets/compact-controls.css), [compact-controls.js](../../assets/compact-controls.js), [product-detail-international.css](../../assets/product-detail-international.css), [product-detail-international.js](../../assets/product-detail-international.js), [checkout-payment-methods.css](../../assets/checkout-payment-methods.css), [checkout-payment-methods.js](../../assets/checkout-payment-methods.js) | Kontrol bersama, international/language, payment selector; `assets/payment-methods/` dan `assets/payment-logos.svg` untuk logo |
| S14 | [playground/README.md](../../playground/README.md), [catalog option-03 meta](../../playground_products/option-03/meta.md), [Website option-01 meta](../../playground/pages/website-development/option-01/meta.md), [Ads option-02 meta](../../playground/pages/digital-ads-management/option-02/meta.md) | Sejarah eksperimen; inventaris `playground_home/`, `playground_products/`, `playground/`; bukan otoritas menggantikan implementasi production |
| S15 | [admin/assets/admin.css](../../admin/assets/admin.css), [admin/index.html](../../admin/index.html) | Pembanding UI operasional: Inter/mono, semantic tambahan; bukan master creative palette |

**Observed — penting untuk traceability:** CSS produksi menyatakan katalog dipromosikan dari option-03, Website dari option-01, Ads dari option-02; sebagian metadata playground masih bertuliskan draft/pending. Karena itu, panduan mengikuti file yang benar-benar dimuat oleh halaman produksi repository. Begitu pula komentar script yang menyebut default dark tidak menggantikan initializer katalog yang memilih light.

## 23. Future design guidance

**Recommended.** Panduan ini adalah dasar keputusan jangka panjang, bukan batas kreativitas. Untuk setiap pekerjaan baru, tentukan pesan, audience, medium, dan keluarga brand yang relevan. Pilih elemen identitas yang paling membantu pesan; jangan memindahkan seluruh ornamen website ke setiap output.

Karya master dapat terasa DigMarketingMaul tanpa portrait, tanpa card, atau tanpa orbit selama masih tegas, sistematis, personal, dan memiliki fokus merah yang jelas. Course dapat tetap berbeda apabila hubungan produk–parent brand dinyatakan dengan sengaja. Motion baru boleh lebih ekspresif untuk campaign, asalkan informasi dan karakter tetap terbaca.

### Area review yang belum menjadi keputusan desain

| Prioritas | Observed / pertanyaan review | Recommended |
| --- | --- | --- |
| Tinggi | Ikon SVG baru pada portfolio/katalog versus monogram `M.` pada layanan/transaksi dan wordmark course | Tentukan arsitektur logo master, endorsement produk, dan penggunaan monogram |
| Tinggi | Dua merah `#FF304F`/`#FF3158` serta shade hover yang berbeda | Putuskan apakah variasi konteks dipertahankan atau disatukan melalui alias |
| Tinggi | Course memakai palet/font tersendiri sampai checkout | Konfirmasi apakah ini sub-brand yang disengaja; jangan otomatis “memperbaiki” menjadi merah |
| Tinggi | Nav mobile sangat kecil; compact focus dan beberapa status rendah kontras perlu validasi | Lakukan review browser, zoom, keyboard, serta kontras kedua tema |
| Menengah | Home/blog dark-only; katalog/layanan default light; artikel native light/dark; course memakai storage key berbeda | Definisikan ekspektasi theme persistence lintas journey, bukan memaksa semua halaman sama |
| Menengah | Roboto Mono dideklarasikan tanpa import; beberapa weight tidak dimuat eksplisit | Perjelas font mapping dan weight tersedia |
| Menengah | Inline overrides, CSS patch, dan komentar lama dapat berbeda dengan perilaku efektif | Dokumentasikan ownership token dan varian komponen saat ada pekerjaan implementasi terpisah |
| Menengah | Rounded panel/blur lebih kuat di artikel daripada ledger layanan; hover kartu blog bisa memberi kesan clickable | Evaluasi density dan affordance sesuai tugas pengguna |
| Menengah | Promo Oktober 2026 dan repetisi pendampingan/scope berbeda dari preferensi copy yang sangat ringkas | Review klaim/promo berkala; ringkas duplikasi tanpa menghapus informasi penting |
| Menengah | Root reveal bergantung JS; overlay dan viewport belum diuji langsung pada audit ini | Verifikasi failure state, reduced motion, focus modal, dan reflow sebelum memakai angka sebagai spesifikasi final |

### Pemeliharaan panduan

**Recommended.** Perbarui versi, tanggal audit, dan source ketika ada perubahan identitas yang disepakati. Saat sebuah rekomendasi benar-benar diimplementasikan, pindahkan statusnya menjadi Observed dengan bukti source baru. Simpan perbedaan produk yang disengaja sebagai varian, bukan sebagai kesalahan yang otomatis dihapus. Jangan menjadikan harga, status produk, atau informasi pekerjaan dalam contoh copy sebagai aturan brand permanen.
