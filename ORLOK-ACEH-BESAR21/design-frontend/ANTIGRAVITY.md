# ANTIGRAVITY — Landing Page ORLOK Aceh Besar

## Identitas
- Proyek: ORLOK Aceh Besar Web Portal
- Halaman: Landing Page Publik (desain-frontend/landing-page.jsx)
- Stack: Next.js 14 (pages router), Tailwind CSS, React 18
- API: FastAPI backend :8000 (NEXT_PUBLIC_API_URL)

## Keputusan Desain
1. **Hero asimetris**: teks kiri, visual kanan (bendera ORARI + radio imagery)
2. **Warna ORARI**: merah #CC0000, putih, biru tua #1E3A5F, aksen kuning #F5B800
3. **3 kolom fitur**: Berita, Galeri, Transaksi (icon + label + deskripsi)
4. **Statistik**: angka besar dari API admin/stats
5. **Footer**: kontak organisasi, alamat, copyright

## Komponen
- `<HeroSection />`: headline, subtext, dua CTA
- `<FeatureGrid />`: 3 fitur utama
- `<StatsRow />`: angka dari backend
- `<AnnouncementSection />`: daftar pengumuman
- `<ActivitySection />`: agenda kegiatan
- `<Footer />`: kontak & copyright

## Anti-Pola (Dilarang)
- Tidak ada em-dash (—) di teks
- Tidak ada gradient mesh berlebihan
- Tidak ada glassmorphism di atas fotografi tanpa fallback
- Tidak ada placeholder div fake-screenshot
- Tidak ada versi label di hero (v0.6, BETA)
- Tidak ada scroll cue ("Scroll to explore")

## Responsive
- Mobile: single column, padding 16px
- Tablet: 2 kolom fitur
- Desktop: 3 kolom fitur, hero split 50/50

## Aksesibilitas
- Contrast 4.5:1 minimum
- Focus ring pada semua interactive element
- Alt text pada gambar
- Semantic HTML (h1 > h2 > h3)
- Keyboard navigable

## Changelog
- 2026-09-15: Draft awal landing page
- 2026-09-15: Update warna ORARI (merah putih)