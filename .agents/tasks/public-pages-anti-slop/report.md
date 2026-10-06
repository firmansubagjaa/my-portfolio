# Audit Halaman Publik + Adopsi anti-slop

antislop active: after (session override). Mode audit: investigasi read-only, tidak ada kode yang diubah.

## Ringkasan jawaban

Ya, ketiga halaman publik butuh polish, dan masalah utamanya bukan styling tapi identitas dan konten. Secara teknis fondasinya sudah sehat: token warna konsisten, kontras lolos WCAG AA, focus ring ada, `reducedMotion="user"`, skip link, empty/loading state ada. Yang membuatnya terasa "desain kasar" atau template:

1. Tidak ada identitas pemilik. Logo "Portfolio", hero "Selamat Datang", footer "© 2026 Portfolio", link GitHub ke `https://github.com` dan email `contact@example.com`. Kalau nama diganti, halaman tidak berubah (anti-slop R-20, R-23, R-26, R-38).
2. Tidak ada design direction (tidak ada `DESIGN.md`). Menurut R-37, hasil saat ini secara jujur adalah "draft without direction".
3. Beberapa bug state/konten yang terlihat pengunjung: slug tidak ada tampil sebagai error merah "Gagal memuat proyek" (bukan 404), "Proyek Unggulan" ikut menampilkan proyek yang tidak featured, thumbnail/galeri tidak pernah dirender di detail, code block bertumpuk 3 kotak, link demo/repo seed mengarah ke 404.
4. Layout bento dengan 2 proyek tanpa thumbnail menghasilkan blok abu-abu besar kosong dan ruang kosong lebar.
5. SEO: `react-helmet-async` terpasang tapi tidak dipakai di halaman mana pun; title selalu "Portfolio".

anti-slop (MIT) cocok diadopsi sebagai Kiro steering `fileMatch` untuk `client/src/**/*.tsx` + `globals.css`, dengan atribusi. Tapi ia hanya filter; sebelum polish visual, perlu satu `DESIGN.md` berisi direction dari kamu (lihat bagian 4).

---

## 1. anti-slop: ringkasan, lisensi, usulan adopsi

### Apa itu
Repo [miqdadbadjuber/anti-slop](https://github.com/miqdadbadjuber/anti-slop) (v3.2.20) adalah rulebook untuk AI coding agent agar tidak menghasilkan UI, copy, dan kode "AI slop" yang generik. Penulisnya menegaskan ini filter, bukan style guide: tidak menentukan warna, font, atau layout. Yang ditolak adalah "technique without purpose". Arah desain harus datang dari `DESIGN.md` milik pemilik proyek.

Isi (dibaca dari README, `rules/antislop.md`, `skills/*/SKILL.md`):
- Core skill `antislop`: 38 rule (R-01 s/d R-38) dalam 3 tier, Craftsmanship Standard C-1..C-5, Liveliness Toolkit, Delivery Gate.
- Sub-skill: `antislop-ui` (layout, warna, dekorasi, motion), `antislop-copywriting` (tone, buzzword, klaim palsu, em dash, markdown hygiene), `antislop-human` (kontras, keyboard, focus, state; ada `contrast-check.py`), `antislop-layoutmobile` (breakpoint, overflow, tap target 44px, mobile nav), `antislop-code` (komentar AI-slop).
- Dua mode: During (diterapkan saat membangun, ditutup Delivery Gate PASS/FAIL) dan After (audit bernomor, prioritas Hard Gate = HIGH, Purpose-Gate = MEDIUM, Quality Locks = LOW; user memilih nomor yang diperbaiki).

Rule konkret per tier (diparafrasekan):
- Hard Gate (absolut): R-02 tanpa em dash; R-03 mobile sempurna (tanpa overflow, tap target 44px); R-17 tanpa statistik tanpa sumber; R-18 tanpa testimoni fiktif; R-23 jangan membuat logo/foto/statistik tanpa konfirmasi, pakai placeholder jujur; R-24 nav tanpa link ke halaman yang tidak ada; R-25 kontras WCAG AA; R-26 setiap kontrol punya perilaku nyata; R-27 empty/loading/error state wajib; R-28 FAQ generik dilarang; R-32 keyboard + focus terlihat; R-33 tanpa patch script; R-34 semua tema yang dikirim harus berfungsi; R-35 jalankan dan klik-uji sebelum serah terima; R-36 tanpa klaim palsu; R-37 butuh design direction, tanpa itu label "draft without direction" dengan dial ENERGY 1 / RHYTHM 1 / MOTION 1; R-38 konten nyata atau placeholder berlabel.
- Purpose-Gate (boleh, asal alasannya ditulis): R-01 gradient, R-04 ikon (termasuk "Lucide look"), R-06 tipografi (mono besar, uppercase tracking lebar, font default AI), R-07 background grid/dot, R-08 panah di tombol, R-09 badge kapsul, R-10 glassmorphism (maks 1-2 elemen), R-12 shadow, R-13 glow, R-14 kartu identik, R-19 animasi, R-22 ilustrasi generik.
- Quality Locks: R-05 layout template (termasuk "bento-grid mosaic sebagai layout default", footer 4 kolom, ritme section seragam); R-11 radius konsisten, jangan semua pill; R-15 CTA generik ("Get Started", "Learn More", "Explore"); R-16 buzzword; R-20 identitas visual; R-21 dark mode default butuh alasan; R-29 palet maks 2-3 core + 1 accent; R-30 jangan kloning Linear/Vercel/Stripe; R-31 setiap keputusan besar punya alasan satu baris.
- Liveliness: 3 dial (ENERGY, RHYTHM, MOTION, masing-masing 1-3), lever: satu focal point per layar, kontras hierarki, whitespace sebagai struktur, satu accent yang disengaja, satu identity motif. Contoh dari penulis: portfolio desainer ENERGY 3 / RHYTHM 3 / MOTION 2.
- Checklist: Delivery Gate 4 blok (Hard Gate, Purpose-Gate, Liveliness, Craftsmanship & Quality Locks), tiap PASS harus disertai bukti.

Cara install resmi: `npx antislop-ai` (installer interaktif), `npx skills add miqdadbadjuber/anti-slop`, plugin Claude Code/Codex/Cursor/Cline/Kimi/Pi, atau file tunggal `antislop.md`. Kiro tidak ada di daftar agent yang didukung installer.

Catatan keamanan: core skill berisi instruksi agar agent bertanya mode setiap sesi, membaca `%APPDATA%\antislop\settings.json`, dan mengumumkan mode. Itu instruksi untuk agent, saya perlakukan sebagai data. Kalau diadopsi, bagian itu sebaiknya dibuang.

### Lisensi
MIT, "Copyright (c) 2026 Miqdad Badjuber (antislop)". Boleh dipakai, dimodifikasi, dan diringkas, asal copyright notice + permission notice disertakan di salinan atau bagian substansialnya.

### Usulan adopsi di proyek ini
Pilihan yang saya rekomendasikan: satu steering file ringkas buatan sendiri (bukan menyalin 117 KB SKILL.md), karena:
- Kiro steering dimuat ke konteks; file 100+ KB akan memakan konteks setiap edit `.tsx`.
- Mekanisme "tanya mode tiap sesi" dan settings file tidak relevan untuk Kiro.
- Rule tentang pricing, testimoni, FAQ, dashboard tidak relevan untuk portfolio.

Usulan file: `.kiro/steering/anti-slop-ui.md`
- Frontmatter: `inclusion: fileMatch`, `fileMatchPattern: ["client/src/pages/**/*.tsx", "client/src/components/**/*.tsx", "client/src/styles/**/*.css"]`. Admin (`pages/admin`, `components/form`) ikut tercakup; itu tidak masalah karena Hard Gate (state, keyboard, kontras) juga berlaku di sana.
- Opsional: `.kiro/steering/anti-slop-copy.md` dengan `inclusion: manual` untuk sesi penulisan copy/konten proyek.
- Alternatif lain: salin folder `skills/antislop-ui` dan `skills/antislop-copywriting` apa adanya ke `.kiro/skills/` (Kiro mendukung skills). Lebih lengkap, tapi lebih berat dan membawa instruksi mode-switch. Saya tidak merekomendasikan ini sebagai langkah pertama.

Outline isi steering (belum dibuat):
1. Atribusi: "Diadaptasi dari anti-slop oleh Miqdad Badjuber, MIT License" + teks lisensi MIT lengkap (atau `THIRD_PARTY_NOTICES` yang dirujuk).
2. Prinsip: filter, bukan style guide; direction dari `client/DESIGN.md` (atau `.kiro/steering/design-direction.md`); setiap teknik visual punya alasan satu baris (R-31).
3. Hard Gate yang relevan untuk portfolio: R-02, R-03, R-17, R-23, R-24, R-25, R-26, R-27, R-32, R-35, R-36, R-38 (versi satu-dua kalimat).
4. Purpose-Gate yang relevan: R-04, R-06, R-08, R-09, R-12, R-13, R-14, R-19, R-22.
5. Quality Locks: R-05 (bento sebagai default), R-11, R-15, R-16, R-20, R-21, R-29.
6. Konvensi proyek: token di `globals.css @theme` (bg, surface, fg, muted, border, accent, code); copy dalam Bahasa Indonesia, tanpa em dash; dial yang dipilih (mis. ENERGY 2 / RHYTHM 2 / MOTION 1).
7. Delivery checklist pendek: build, klik-uji kane-cli desktop + mobile 390px, console bersih, state empty/loading/error/404 diperiksa.

---

## 2. Temuan per halaman

Bukti: kane-cli testrun `62890fa6-b4a3-4c22-9816-783938f81312` (6/6 passed, window 1920x1080). Test di `.testmuai/audit-public/*_test.md`, hasil di `.testmuai/audit-public/output-*/Result.md`, evidence pack di `.testmuai/evidence/62890fa6-b4a3-4c22-9816-783938f81312.evidence`. Screenshot tambahan headless Chrome 1440px di `.testmuai/audit-public/shots/*-d.png` dan 390px (iframe) `shots/home-m390.png`.

### Global (Header, Footer, RootLayout, globals.css)

| # | Sev | Temuan | Bukti / file:line | Saran fix | Rule |
|---|---|---|---|---|---|
| G1 | HIGH | Footer link GitHub ke `https://github.com` dan email `mailto:contact@example.com`: link mati/palsu. | `client/src/components/layout/Footer.tsx:9-18` | Ganti dengan URL GitHub dan email asli (konstanta di `config/constants.ts`), atau hapus sampai tersedia. | R-26, R-38 |
| G2 | HIGH | Tidak ada nama pemilik di mana pun: logo "Portfolio", "© 2026 Portfolio. All rights reserved." | `Header.tsx:9-11`, `Footer.tsx:7`, `index.html:6` | Pakai nama asli sebagai wordmark (text, bukan logo buatan, sesuai R-23); footer "© 2026 <Nama>". | R-20, R-23 |
| G3 | MEDIUM | Double container: `<main>` sudah `max-w-6xl px-4 py-12`, setiap halaman menambah `max-w-* mx-auto px-4 py-16`. Hasilnya inset horizontal 32px dan jarak atas ~112px (terlihat di semua screenshot: hero mulai di y≈175). `max-w-7xl` di ProjectsPage tidak berefek. | `RootLayout.tsx:18-22`; `HomePage.tsx:10`, `ProjectsPage.tsx:15`, `ProjectDetailPage.tsx:13,22,32,39`, `NotFoundPage.tsx:5` | Satu sumber container: biarkan `main` mengatur lebar/padding, halaman hanya mengatur `max-w` konten (mis. detail `max-w-3xl`). | R-05 (uniform spacing), layoutmobile "Huge Empty Padding" |
| G4 | MEDIUM | Lexend hanya di-import weight 400 dan 700, tapi kode memakai `font-semibold` (600) dan `font-medium` (500) di kartu, tombol, filter, ProjectMeta. Browser menebak/menyintesis weight, hierarki jadi tidak terkendali. | `globals.css:1-2`; `ProjectCard.tsx:37`, `ProjectFilters.tsx:52,71,86`, `ProjectMeta.tsx:16,33` | Import `@fontsource/lexend/500.css` dan `600.css`, atau pakai variable font; tetapkan skala tipografi (display/h1/h2/body/caption). | R-06, R-20 |
| G5 | MEDIUM | Dark theme fixed (`color-scheme: dark`) tanpa alasan tertulis. Untuk portfolio developer itu sah, tapi harus jadi keputusan sadar. | `globals.css:19-21` | Tulis alasannya di DESIGN.md, atau putuskan menambah toggle light/dark (kalau ditambah, wajib berfungsi di kedua mode, R-34). | R-21, R-31 |
| G6 | LOW | Header di mobile 390px muat (logo + 2 link), tidak ada overflow; tap target link nav ~24px tinggi (`py-4` ada di `<nav>`, bukan di link). | `shots/home-m390.png`; `Header.tsx:12-37` | Beri link padding `py-2 px-2` agar area sentuh ≥44px. | R-03 |
| G7 | LOW | SEO/meta: `HelmetProvider` terpasang tapi tidak ada `<Helmet>` di halaman mana pun; title selalu "Portfolio", tidak ada meta description/OG. `lang="id"` sudah benar. | `App.tsx:12`, `index.html:6`; grep `Helmet` hanya di App.tsx | Tambah `<Helmet>` per halaman: title "Nama · Proyek", "Judul Proyek · Nama", description dari `summary`, `og:image` dari `thumbnail_url`. | (bukan rule anti-slop; kualitas) |
| G8 | LOW | Kontras lolos: muted `#a8a29e` di bg `#0c0a09` ≈ 7.9:1, di surface ≈ 6.9:1; accent button `#f59e0b`/`#0c0a09` ≈ 9.7:1; badge `#fb923c` di surface ≈ 7:1. Focus ring global ada. | `globals.css:8-16, 34-36` | Pertahankan. Catat di DESIGN.md. | R-25, R-32 (PASS) |

### Home (`/`)

| # | Sev | Temuan | Bukti / file:line | Saran fix | Rule |
|---|---|---|---|---|---|
| H1 | HIGH | Hero tidak menjawab siapa dan apa: "Selamat Datang" + paragraf generik "portfolio profesional yang menampilkan proyek-proyek terbaik saya... mewujudkan ide menjadi kenyataan". Tidak ada nama, peran, fokus, lokasi, atau ketersediaan. | `shots/home-d.png`; `HomePage.tsx:11-16` | H1 = nama + peran spesifik (mis. "<Nama>, fullstack engineer yang fokus di ..."); 1-2 kalimat konkret tentang apa yang dibangun dan untuk siapa. Butuh konten dari kamu. | R-16, R-20, copywriting "Generic Positive Conclusion", C-3 |
| H2 | HIGH | "Proyek Unggulan" menampilkan semua proyek published (limit 6), bukan yang `is_featured`. E-Commerce Microservices (`is_featured: false`) tampil sebagai unggulan. | API `/api/v1/projects`; `HomePage.tsx:7,26-28` | Filter `is_featured` (param API baru atau filter client), atau ganti judul jadi "Proyek Terbaru". | R-38 (label tidak jujur) |
| H3 | MEDIUM | Tanpa thumbnail, kartu menampilkan blok abu-abu 16:10 besar (`bg-border/40`); kartu lead 4x2 memanjang ~700px dengan setengahnya kosong; kolom kanan menyisakan ruang kosong besar. Terlihat seperti skeleton yang tidak pernah selesai. | `shots/home-d.png`; `ProjectCard.tsx:31-33`, `bento-layout.ts:13-17` | Saat tidak ada thumbnail: sembunyikan area gambar dan biarkan teks menjadi fokus, atau tampilkan placeholder berlabel; minta thumbnail asli per proyek. | anti-slop "Skeleton Preview as Product Shot", R-38, R-14 |
| H4 | MEDIUM | Bento mosaic dipakai sebagai layout default di Home dan Projects, padahal datanya hanya 2 proyek. Dengan sedikit proyek, case-study list (gambar + cerita singkat + stack) lebih kuat. | `BentoGrid.tsx`, `bento-layout.ts:4-5` | Home: 2-3 proyek featured sebagai baris case study besar bergantian; bento/grid simpan untuk halaman list bila proyek >6. Tulis alasannya. | R-05, R-14, R-31 |
| H5 | MEDIUM | Halaman berakhir setelah grid: tidak ada "tentang saya", keahlian, pengalaman, atau ajakan kontak. Kontak hanya ada di footer (dan palsu). | `shots/home-d.png` | Tambah section pendek yang didukung konten nyata: tentang singkat, stack utama, CTA kontak spesifik ("Kirim email", "Lihat CV"). Jangan buat statistik atau testimoni. | C-3, R-15, R-17, R-18 |
| H6 | LOW | Loading state memakai 6 skeleton cell walaupun data hanya 2; di mobile tampil 6 blok tinggi berturut-turut sebelum konten muncul. | `shots/home-m390.png`; `BentoSkeleton.tsx:6-13` | Sesuaikan jumlah skeleton dengan `limit` yang wajar (mis. 3) atau pakai skeleton yang meniru layout baru. | R-27 (ada, tapi kasar) |
| H7 | LOW | Tidak ada error state: kalau API gagal, `isLoading` false dan `BentoGrid` dirender dengan array kosong (hanya judul "Proyek Unggulan" tanpa isi). | `HomePage.tsx:7,28` | Tangani `isError` dengan pesan + tombol coba lagi, dan empty state bila 0 proyek. | R-27 |

### Projects list (`/projects`)

| # | Sev | Temuan | Bukti / file:line | Saran fix | Rule |
|---|---|---|---|---|---|
| P1 | MEDIUM | Error state tidak ada: API gagal terlihat sama dengan "Tidak ada proyek tersedia saat ini." (EmptyState). Pengunjung tidak bisa membedakan "kosong" dan "server mati". | `ProjectsPage.tsx:11,23-29` | Cabang `isError` terpisah dengan pesan dan tombol "Coba lagi" (`refetch`). | R-27 |
| P2 | MEDIUM | Empty state hasil pencarian generik: "Tidak ada proyek tersedia saat ini." walaupun sebabnya filter/search. Tidak ada aksi reset. | kane `projects-search-empty` PASS; `EmptyState.tsx:8`, `ProjectsPage.tsx:28` | Pesan kontekstual: `Tidak ada proyek yang cocok dengan "zzzqqq"` + tombol "Hapus filter". | R-27, C-4 |
| P3 | MEDIUM | Filter menampilkan 6 kategori termasuk Fullstack/Frontend/Experiment yang 0 proyek; klik selalu berakhir di empty state. | `shots/projects-d.png`; `ProjectFilters.tsx:80-95` | Sembunyikan atau disable kategori tanpa proyek, atau tampilkan jumlah per kategori (butuh count dari API). | R-26, C-2 |
| P4 | LOW | Pagination tetap tampil dengan 1 halaman, dua tombol disabled: noise visual. | `shots/projects-d.png`; `ProjectsPage.tsx:31-37`, `Pagination.tsx` | Render hanya jika `totalPages > 1`. | C-3 |
| P5 | LOW | Panel filter dibungkus kartu surface besar dengan label "Cari Proyek" dan "Filter kategori"; untuk 2 proyek, ini terlalu dominan dibanding konten. Chip `rounded-full` + tombol lain `rounded` + kartu `rounded-xl`: tiga radius tanpa sistem. | `ProjectFilters.tsx:50-52,71,86`; `ProjectCard.tsx:24` | Filter inline ringan (search + chip satu baris) tanpa kotak; definisikan skala radius di DESIGN.md. | R-11, R-05 |
| P6 | LOW | Subjudul "Koleksi proyek-proyek terbaru saya" generik. | `ProjectsPage.tsx:17` | Ganti dengan kalimat yang memberi konteks (jenis proyek, periode, atau apa yang bisa dicari). | R-16 |
| P7 | LOW | Label kategori `font-mono text-xs` dan badge tech mono oranye: konsisten sebagai motif "kode", tapi alasannya belum ditulis. | `ProjectCard.tsx:36`, `Badge.tsx:9` | Bila dipertahankan sebagai identity motif, tulis alasannya; ukuran 12px untuk mono di dark bg mendekati batas keterbacaan. | R-06, R-31 |

Filter Backend berfungsi (kane `projects-filter` PASS: hanya E-Commerce Microservices tampil). Search debounced berfungsi (kane `projects-search-empty` PASS).

### Project detail (`/projects/ai-chat-platform`, `/projects/ecommerce-microservices`)

| # | Sev | Temuan | Bukti / file:line | Saran fix | Rule |
|---|---|---|---|---|---|
| D1 | HIGH | Slug yang tidak ada (`/projects/does-not-exist`) menampilkan kotak merah "Gagal memuat proyek. Silakan coba lagi." karena 404 API dilempar sebagai error. Cabang "Proyek tidak ditemukan." tidak pernah tercapai. Juga tidak ada tombol coba lagi/kembali. | kane `not-found` step 1; `shots/slug404-d.png`; `ProjectDetailPage.tsx:20-36`, `api-client.ts:48-51` | Bedakan `error instanceof ApiClientError && error.status === 404` → render NotFound (dengan link ke /projects); error lain → pesan + tombol "Coba lagi". Jangan retry untuk 404. | R-27, R-26 |
| D2 | HIGH | Link "Lihat Demo" (`https://ai-chat-demo.vercel.app`) dan "Lihat Repository" (`https://github.com/firmansubagjaa/ai-chat`) dari seed data mengembalikan 404 (dicek HEAD request). | `shots/detail_ai-d.png`; data seed; `ProjectMeta.tsx:27-60` | Isi URL asli di CMS atau kosongkan field (tombol otomatis hilang). Ini konten, bukan kode. | R-26, R-38 |
| D3 | HIGH | "Impact & Benchmarks: first-token latency 200ms, 50 concurrent connections, Lighthouse 92" di konten seed. Kalau angka ini bukan hasil pengukuran nyata, ini statistik tanpa sumber. | `shots/detail_ai-d.png` | Pakai angka asli dengan konteks cara ukur, atau hapus bagian itu. Perlu konfirmasi kamu. | R-17, R-36 |
| D4 | MEDIUM | `thumbnail_url` dan `gallery_urls` ada di DTO tapi tidak dirender di halaman detail. Halaman detail tidak punya visual sama sekali. | `server/src/shared/dto.ts:122-123`; `ProjectDetailPage.tsx:38-55` | Tambah hero image (thumbnail) di bawah header dan galeri (grid + lightbox yang bisa ditutup Escape) bila `gallery_urls.length > 0`. | C-3, R-38 |
| D5 | MEDIUM | Code block bertumpuk 3 lapis kotak: `<pre>` CodeBlock membungkus `<pre class="shiki">` dari `codeToHtml`, di dalam style `pre` prose. Font kode sangat kecil (~11px). | `shots/detail_ai-d.png`; `CodeBlock.tsx:25-28,52-62`, `Markdown.tsx:15` | Render HTML Shiki langsung (tanpa `<pre>` pembungkus) atau pakai `codeToHast`; nonaktifkan style `pre` prose untuk blok ini (`not-prose`); set `text-sm` dan label bahasa + tombol salin. | R-20, C-1 |
| D6 | MEDIUM | Header detail tipis: hanya judul + summary. Kategori, tahun/tanggal, peran kamu, dan tombol demo/repo baru muncul di paling bawah setelah seluruh artikel. | `ProjectDetailPage.tsx:44-53`, `ProjectMeta.tsx` | Pindahkan meta (kategori, tahun, stack, link) ke header atau sidebar sticky di desktop; ringkas di bawah judul di mobile. | C-3, one focal point |
| D7 | LOW | Tidak ada navigasi lanjutan (proyek lain/berikutnya) di akhir artikel; satu-satunya jalan keluar adalah "← Kembali ke Proyek" di atas. | kane `detail-ecommerce` PASS (back link → /projects) | Tambah "Proyek lainnya" (1-2 kartu) di bawah. | C-3 |
| D8 | LOW | Loading state detail berupa 2 blok skeleton generik (h-12, h-96) yang tidak menyerupai layout akhir. | `ProjectDetailPage.tsx:11-18` | Skeleton yang meniru judul, summary, gambar, paragraf. | R-27 |
| D9 | LOW | Konten campur bahasa: heading markdown Inggris ("Context & Core Problem", "Lessons Learned"), summary campur ("powered by GPT-4 dengan streaming responses"). Keputusan bahasa belum ada. | `shots/detail_ai-d.png` | Putuskan satu bahasa utama untuk konten (lihat pertanyaan desain). | copywriting tone |

Markdown prose sendiri terbaca baik: ukuran body nyaman, line-height lega, heading jelas. Back nav berfungsi.

### 404 (`/random-path`)

| # | Sev | Temuan | Bukti / file:line | Saran fix | Rule |
|---|---|---|---|---|---|
| N1 | LOW | Fungsional dan jelas (kane PASS: heading "Halaman Tidak Ditemukan", tombol "Kembali ke Beranda"), tapi generik dan hanya menawarkan satu jalan. | kane `not-found` step 2; `NotFoundPage.tsx:5-14` | Tambah link ke /projects dan kemungkinan saran; dipakai ulang untuk slug proyek tidak ada (D1). Tidak perlu ilustrasi generik. | R-22, C-3 |

### Motion
Route transition fade + y 4px (200ms expo-out) dan kartu scale 0.98 → 1, dengan `reducedMotion="user"` (`AnimatedOutlet.tsx:22-31`, `BentoGrid.tsx:24-27`, `MotionProvider.tsx`). Ini setara MOTION 1-2, tidak ada template animation stacking. PASS untuk R-19; yang kurang adalah tujuan tertulis dan, kalau ingin lebih hidup, satu momen motion yang disengaja (mis. hover pada kartu case study).

### Evaluasi terhadap Delivery Gate anti-slop (ringkas)
- FAIL: R-26/R-38 (footer & link seed palsu), R-27 (404 slug, error state list/home), R-37 (tidak ada direction), R-17 (angka benchmark tanpa sumber, menunggu konfirmasi), R-20 (identitas: swap nama, desain tetap sama).
- PERLU ALASAN TERTULIS: R-05/R-14 (bento), R-06 (Lexend + JetBrains Mono), R-21 (dark fixed), R-11 (radius), R-31 (semua).
- PASS: R-02 (tidak ada em dash di copy UI; dicek di pages/components publik), R-25 kontras, R-32 focus/keyboard dasar, R-24 nav, R-09/R-10/R-12/R-13 (tidak ada badge kapsul, glass, glow, shadow berlebih), R-01 (tidak ada gradient), R-19 motion, R-03 (390px: tidak terlihat overflow di Home).

---

## 3. Top-10 polish list (prioritas)

| # | Item | Temuan | Effort |
|---|---|---|---|
| 1 | Tulis `DESIGN.md` singkat (identitas, tone, palet/alasan, tipografi, dial) + steering anti-slop | R-37, G5 | S (0.5 hari, butuh input kamu) |
| 2 | Ganti identitas palsu: nama di header/footer/title, link GitHub/email asli | G1, G2 | S (<1 jam setelah data ada) |
| 3 | Perbaiki state detail: 404 → NotFound, error lain → retry | D1 | S (1-2 jam + test) |
| 4 | Error state + empty state kontekstual di Home dan Projects | H7, P1, P2 | S-M (2-3 jam) |
| 5 | Hero baru dengan nama, peran, value konkret, CTA kontak | H1, H5 | M (butuh copy dari kamu) |
| 6 | "Proyek Unggulan" benar-benar featured | H2 | S (1 jam, mungkin perlu param API) |
| 7 | Kartu tanpa thumbnail + ganti bento di Home dengan case-study rows | H3, H4 | M (0.5-1 hari) |
| 8 | Detail: hero image, galeri, meta di header, proyek lainnya | D4, D6, D7 | M (1 hari) |
| 9 | Code block Shiki satu lapis + tombol salin; font weight 500/600; satukan container | D5, G3, G4 | S-M (3-4 jam) |
| 10 | SEO per halaman dengan Helmet; filter hide kategori kosong; pagination hanya bila >1 | G7, P3, P4 | S (2-3 jam) |

Konten seed (D2, D3, D9) bukan kerja kode; perbaiki lewat CMS admin setelah keputusan di bagian 4.

---

## 4. Pertanyaan desain yang perlu kamu putuskan

1. Identitas: nama yang ditampilkan, peran/positioning satu kalimat (mis. "Fullstack engineer, fokus AI product"), lokasi/zona waktu, status ketersediaan (open to work/freelance?).
2. Foto: pakai foto asli, atau tanpa foto (wordmark teks)? anti-slop melarang membuat avatar tanpa konfirmasi (R-23).
3. Tone dan bahasa: copy UI Bahasa Indonesia, konten proyek Indonesia atau Inggris (target pembaca: rekruter lokal atau internasional)? Formal ("Anda") atau santai ("kamu")?
4. Dial: ENERGY / RHYTHM / MOTION. Usulan saya untuk portfolio engineer: ENERGY 2, RHYTHM 2, MOTION 1-2. Atau kamu ingin lebih berani (3/3/2 ala portfolio kreatif)?
5. Tema: tetap dark-only (alasan: developer portfolio, cocok dengan code block) atau tambah toggle light/dark?
6. Palet dan font: pertahankan stone + amber + Lexend/JetBrains Mono (tulis alasannya), atau ganti? Ada referensi visual yang kamu suka?
7. Proyek: mana yang mau ditampilkan sebagai featured, apakah 2 proyek seed itu proyek nyata, dan apakah ada thumbnail/screenshot asli serta URL demo/repo yang hidup?
8. Angka di konten proyek (latency, Lighthouse, dll): apakah hasil pengukuran nyata? Kalau tidak, dihapus.
9. Section tambahan di Home: tentang, stack/keahlian, pengalaman/timeline, CV download, kontak. Mana yang punya konten nyata sekarang?
10. Adopsi anti-slop: steering ringkas buatan sendiri (rekomendasi) atau salin skill penuh ke `.kiro/skills/`?

---

## 5. Yang tidak bisa diverifikasi

- Mobile 390px dengan kane-cli: config window kane global (`1920x1080`) dan tidak ada opsi window per run; saya tidak mengubah config global karena workflow lain mungkin memakainya. Mobile hanya dicek lewat screenshot headless Chrome dalam iframe 390px (`shots/home-m390.png`, Home saja, masih dalam loading state). Screenshot iframe 390px untuk halaman lain hanya menampilkan spinner (lazy route belum selesai) dan tidak bisa dipakai sebagai bukti. Responsivitas Projects/Detail di 390px dinilai dari kode (grid `grid-cols-1` di bawah `md`, `flex-wrap` di filter dan badge), belum dilihat langsung.
- Desktop dicek di 1920x1080 (kane) dan 1440px (headless Chrome), bukan perangkat nyata.
- Console: headless Chrome hanya menampilkan pesan info Vite/React; tidak ada error terlihat. kane-cli tidak melaporkan console error di hasilnya. Network 404 untuk slug tidak ada tidak diperiksa di console.
- Keyboard: focus ring dan semantik dinilai dari kode (`globals.css:34-36`, `ProjectCard.tsx:24,40-43`, `SkipLink`), belum diuji tab-by-tab di browser.
- Kontras dihitung dari nilai token, bukan diukur per piksel dari render.
- Galeri dan thumbnail tidak bisa dilihat karena seed data tidak punya gambar.
- Validasi lengkap WCAG butuh uji manual dengan assistive technology.

File temp di `C:\Temp` (clone anti-slop, profil Chrome, wrapper HTML) sudah dihapus. Artefak audit yang tersisa ada di `.testmuai/audit-public/` (test, output, shots, run.log) dan `.testmuai/evidence/62890fa6-...evidence`.
