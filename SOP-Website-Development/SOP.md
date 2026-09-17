# SOP Pengembangan Website (End-to-End)

## Tujuan
Memastikan pengembangan website memenuhi spesifikasi 100%, aman, terukur, dan siap produksi melalui proses terstruktur yang melibatkan semua pihak terkait.

## Lingkup
Meliputi semua tahap dari pengumpulan kebutuhan hingga deploy dan monitoring pasca-deploy.

## Definisi
- **CEO**: Pengambil keputusan final, memantau keseluruhan proses.
- **Product Manager (PM)**: Menjembatani antara stakeholder dan tim teknis, bertanggung jawab atas PRD, struktur file, dan koordinasi tim.
- **Backend Engineer**: Mengembangkan logika server, API, basis data, dan integrasi layanan.
- **Frontend Engineer**: Mengembangkan antarmuka pengguna, interaksi, dan konsumsi API.
- **QA Engineer**: Melakukan pengujian fungsional, non-fungsional, dan keamanan.
- **Designer (UI/UX)**: Membuat wireframe, mockup, design system, dan memastikan aksesibilitas serta usability.
- **DevOps (opsional)**: Mengelola CI/CD, infrastruktur, dan monitoring.

## Fase-Fase Pengembangan

### Fase 0: Kickoff & Alignment
1. **Pertemuan Kickoff**
   - Peserta: CEO, PM, stakeholder (jika ada), lead teknis (backend/frontend).
   - Agenda:
     - Tujuan bisnis dan sukses metriks.
     - Batasan waktu, anggaran, dan sumber daya.
     - Keputusan awal tentang tech stack (jika belum ditentukan).
     - Penugasan peran dan jadwal rutin (misal: daily standup 15 menit).
2. **Output**
   - Dokumen Kickoff Minutes (disimpan di `/docs/kickoff.md`).
   - Daftar keputusan awal (tech stack, timeline kasar, channel komunikasi).

### Fase 1: Pengumpulan Kebutuhan (Requirement Gathering)
1. **Teknik**
   - Wawancara mendalam dengan stakeholder (minimal 2 sesi).
   - Survei atau analisis kompetitor (jika relevan).
   - PM harus bisa membantah anggapan yang tidak berbasis data.
2. **Output**
   - **PRODUCT.md** (disimpan di `/docs/PRODUCT.md`):
     - Vision dan tujuan produk.
     - User personas dan journey map.
     - Functional requirements (fitur-fitur yang diperlukan).
     - Non-functional requirements (performa, keamanan, skalabilitas, dll).
     - Assumptions, constraints, dan open questions.
   - Daftar keputusan yang disetujui oleh CEO (jika ada perdebatan).

### Fase 2: Perancangan Desain & Teknis
#### 2.1 Desain UI/UX
1. **Input**: PRODUCT.md, guidelines dari skill `impeccable` dan `ui-ux-pro-max`.
2. **Langkah**
   - Wireframe low-fidelity (sketfigma atau excalidraw).
   - Review oleh PM dan stakeholder (bisa melalui sesi feedback singkat).
   - High-fidelity mockup (Figma atau tool serupa).
   - Design system: warna, tipografi, spacing, komponen reuse.
   - Aksesibilitas (WCAG 2.1 AA) dan responsivitas dicek sejak awal.
3. **Output**
   - **DESIGN.md** (disimpan di `/docs/DESIGN.md`):
     - Gaya visual dan prinsip desain.
     - Komponen UI dengan spesifikasi (ukuran, state, variasi).
     - Alur pengguna (user flow) dalam diagram.
     - Link ke file desain (Figma file, assets).
   - Semua file desain disimpan di `/design/`.

#### 2.2 Perancangan Teknis
1. **Input**: PRODUCT.md, DESIGN.md, keputusan tech stack dari Fase 0.
2. **Langkah**
   - **API Contract**: OpenAPI/Swagger spec (REST) atau GraphQL schema.
   - **Database Schema**: ERD dan skema migrasi (jika menggunakan relational DB) atau model dokumentasi (NoSQL).
   - **Arsitektur Sistem**: diagram komponen, layanan eksternal, alur data.
   - **Teknik khusus**: strategi caching, autentikasi (JWT/OAuth), penyimpanan file.
3. **Output**
   - **TECH.md** (disimpan di `/docs/TECH.md`):
     - API endpoints dengan method, request/response contoh, kode status.
     - Skema basis data (DDL atau skema model).
     - Diagram arsitektur (diarsirkan atau ditulis dalam Mermaid/PlantUML).
     - Keputusan teknis yang diambil (alasan memilih library X, struktur folder, dll).
   - File OpenAPI disimpan di `/api/openapi.yaml` (atau serupa).
   - Skema basis data disimpan di `/db/schema.sql` (atau migrasi script).

### Fase 3: Persiapan Lingkungan & Infrastruktur
1. **Langkah**
   - Siapkan repositori git (misal: GitHub/GitLab) dengan aturan branching (misal: GitFlow atau trunk-based dengan PR).
   - Tambahkan file `.gitignore`, `README.md` awal, dan lisensi.
   - Konfigurasikan CI/CD dasar (misal: GitHub Actions) untuk lint, unit test, dan build.
   - Siapkan environment lokal (dev), staging, dan production (jika belum ada).
   - Tambahkan pre-commit hooks (misal: husky + lint-staged) untuk formatting dan lint.
2. **Output**
   - Repositori terisi dengan struktur dasar dan dokumentasi awal.
   - File `.github/workflows/ci.yml` (atau equivalente).
   - Instruksi setup lokal di `README.md`.

### Fase 4: Pengembangan (Development Sprint)
1. **Metodologi**
   - Kerja secara iteratif (misal: sprint 1 minggu) dengan tujuan tiap sprint: increment yang dapat di-demo.
   - Daily standup 15 menit (PM sebagai fasilitator).
   - Semua perubahan harus melalui Pull Request (PR) dengan code review wajib.
2. **Backend Engineer**
   - Implementasikan API sesuai kontrak di TECH.md.
   - Tulis unit test dan integration test untuk logika kunci.
   - Pastikan validasi input, penanganan error, dan logging yang cukup.
   - Dokumentasikan API yang sudah selesai (bisa di-generate dari kode atau update manualOpenAPI).
3. **Frontend Engineer**
   - Bangun UI sesuai mockup dan design system di DESIGN.md.
   - Konsumsi API yang telah disepakati (mock API dulu jika backend belum siap).
   - Implementasikan state management, routing, dan penanganan loading/error.
   - Tulis unit test untuk komponen dan integration test untuk alur pengguna kritis.
4. **Designer (jika terlibat langsung)**
   - Berikan aset visual (ikon, ilustrasi) yang diperlukan.
   - Lakukan design handoff ke frontend engineer (specificasi spacing, warna, dll).
   - Ikuti perkembangan UI dan beri masukan jika ada penyimpangan dari desain.
5. **Output per PR**
   - Code yang telah passing CI (lint, unit test, build).
   - Deskripsi perubahan yang jelas di PR.
   - Setidaknya satu orang lain (selain pengirim) telah melakukan approve lewat code review.
   - Jika ada perubahan desain, DESIGN.md diperbarui; jika ada perubahan API, TECH.md dan openapi.yaml diperbarui.

### Fase 5: Pengujian Komprehensif (QA)
1. **Jenis Pengujian**
   - **Fungsional**: setiap fitur sesuai PRODUCT.md dan alur pengguna.
   - **Regression**: memastikan fitur lama tidak rusak karena perubahan baru.
   - **UI/UX**: kecocokan dengan mockup, responsivitas, dan aksesibilitas (gunakan skill `impeccable` audit dan `ui-ux-pro-max` check).
   - **Performance**: waktu muat halaman, respons API di bawah ambang yang ditetapkan (misal: LCP < 2.5s).
   - **Keamanan**: pemindaian dasar (misal: OWASP ZAP atau dependencies check), validasi input/output, dan autentikasi/otorisasi.
   - **Compatibility**: uji di browser utama (Chrome, Firefox, Safari, Edge) dan perangkat (mobile/desktop).
2. **Prosedur**
   - QA menerima build dari branch `develop` atau hasil CI dari branch fitur yang siap di-merge.
   - Buat test case berbasis PRODUCT.md dan alur pengguna.
   - Log setiap bug ke issue tracker (misal: GitHub Issues) dengan langkah reproduksi, harapan, dan fakta.
   - Bug harus diperbaiki dan diverifikasi kembali sebelum dianggap "Done".
3. **Output**
   - Test Report (disimpan di `/docs/qa/test-report-<tanggal>.md` atau serupa):
     - Ringkasan jumlah test case, passed, failed, dan bug yang ditemukan.
     - Daftar terbuka (jika ada) dan rencana perbaikan.
   - Setiap bug yang diperbaiki mereferensi commit yang menyelesaikannya.
   - Kriteria keluar: **semua test case harus passed** dan **zero critical/high severity bug** (bisa diskusikan dengan CEO jika ada bug low yang boleh dibiarkan untuk nanti).

### Fase 6: Review & Persetujuan Final
1. **Pertemuan Review**
   - Peserta: PM, lead teknis (backend/frontend), QA lead, dan CEO (optional tapi diundang).
   - Agenda:
     - Walkthrough PRD vs hasil akhir (apa yang built, apa yang di-deprioritaskan dengan alasan).
     - Demo akhir dari fitur-fitur utama.
     - Review test report dan open issues.
     - Konfirmasi bahwa semua non-functional requirement terpenuhi.
2. **Keputusan**
   - Jika 100% sesuai PRD dan kriteria keluar terpenuhi → **CEO memberikan persetujuan final untuk deploy**.
   - Jika ada gap:
     - Jika gap adalah fitur yang dapat di-postpon: buat issue di backlog, update PRODUCT.md bila perlu, dan lanjutkan deploy untuk versi MVP.
     - Jika gap adalah bug atau ketidakpatuhan requirement: kembalikan ke fase pengembangan/perbaikan.
3. **Output**
   - Dokumen Keputusan Persetujuan (disimpan di `/docs/approval-<tanggal>.md`):
     - Pernyataan bahwa versi X.Y.Z siap untuk deploy ke production.
     - Daftar fitur yang termasuk dan yang di-postpon.
     - Tanda tangan atau persetujuan dari CEO (dalam bentuk komentar atau approval di issue).

### Fase 7: Deploy & Monitoring Pasca-Deploy
1. **Langkah Deploy**
   - PM memicu proses deploy (misal: melalui workflow GitHub Actions ke environment staging terlebih dahulu, lalu production setelah approbasi tambahan jika diperlukan).
   - Deploy ke staging dulu, lakukan smoke test di sana oleh QA atau PM.
   - Jika staging OK, lanjutkan ke production.
   - Proses deploy harus otomatis dan dapat dirollback (misal: menggunakan blue/green atau canadian jika menggunakan layanan yang mendukung).
2. **Monitoring (ditangani oleh CEO via alat yang ada)**
   - Setelah deploy, CEO menggunakan alat seperti `process_manage` untuk memastikan layanan berjalan.
   - Cek log aplikasi (jika tersedia via dashboard atau file) untuk error awal.
   - Pantau metrik dasar: uptime, respons time, dan error rate selama 24 jam pertama.
   - Jika ada incident, buat incident report dan lakukan post-mortem.
3. **Output**
   - Deployment Log (disimpan di `/docs/deploy-<tanggal>.log` atau via CI artifact).
   - Post-deploy Checklist (disimpan di `/docs/post-deploy-checklist-<tanggal>.md`):
     - Versi yang dideploy.
     - Waktu deploy dan durasi.
     - Hasil smoke test.
     - Catatan masalah yang ditemukan dan tindakan yang dilakukan.

## Dokumen yang Diperlukan (Single Source of Truth)
Semua dokumen harus disimpan di folder `/docs/` dengan format Markdown untuk konsistensi.
- `PRODUCT.md` – Kebutuhan bisnis dan fungsional.
- `DESIGN.md` – Spesifikasi visual dan UX.
- `TECH.md` – Keputusan teknis, API contract, dan skema basis data.
- `README.md` – Panduan setup lokal dan kontribusi.
- Lain-lain: kickoff minutes, test report, approval, deployment log, dll.

## Peran dan Tanggung Jawab (RACI Ringkas)
| Aktivitas                  | CEO | PM | Backend | Frontend | QA | Designer |
|----------------------------|-----|----|---------|----------|----|----------|
| Kickoff & Alignment        | A   | R  | C       | C        | I  | I        |
| Pengumpulan Kebutuhan      | A   | R  | C       | C        | I  | C        |
| Perancangan Desain         | I   | A  | C       | C        | C  | R        |
| Perancangan Teknis         | I   | A  | R       | R        | C  | C        |
| Persiapan Lingkungan       | I   | A  | R       | R        | I  | I        |
| Pengembangan Sprint        | I   | A  | R       | R        | C  | C        |
| Pengujian QA               | I   | C  | C       | C        | R  | C        |
| Review & Persetujuan Final | A   | R  | C       | C        | C  | C        |
| Deploy & Monitoring        | A   | R  | C       | C        | C  | I        |
**Keterangan**: R = Responsible, A = Accountable, C = Consulted, I = Informed.

## Standar Kualitas yang Wajib Dipatuhi
1. **Code Review**: Setiap PR harus mendapat minimal satu approval sebelum di-merge.
2. **Test Coverage**: Unit test coverage minimal 80% untuk logika kritis (bisa diskusikan lebih detail).
3. **Desain Consistency**: UI harus sesuai DESIGN.md dan melewati audit aksesibilitas (tidak ada violation WCAG AA).
4. **API Contract**: Frontend dan backend harus berkomunikasi berdasarkan spesifikasi yang disetujui (tidak ada asumsi field).
5. **Dokumentasi Setiap Perubahan**: Jika ada perubahan signifikan pada requirement, arsitektur, atau desain, dokumen terkait harus diupdate sebelum pekerjaan lanjut.
6. **Deploy Hanya Setelah Persetujuan CEO**: Tidak ada deploy ke production tanpa tanda tangan akhir dari CEO.

## Penanganan Eksepsi
- Jika ada ketidakpastian besar selama proses (misal: perubahan fundamental dari stakeholder), kembali ke Fase 1 atau 2 setelah mendapat persetujuan CEO.
- Jika terdesak karena batas waktu, bisa menyusun versi MVP dengan fitur inti saja, tetap harus melewati semua tahap di atas untuk fitur yang di-include.
- Semua eksepsi harus dicatat dan diapprove oleh CEO.

## Lampiran
- Lampiran A: Glosari Istilah
- Lampiran B: Contoh Struktur Folder Proyek
- Lampiran C: Checklist Harian untuk Setiap Peran
- Lampiran D: Referensi Template (PRODUCT.md, DESIGN.md, TECH.md)

--- 
*Disusun oleh: CEO (Anda) berdasarkan input dari tim dan praktik industri terbaik.*
*Versi: 1.0*
*Tanggal: $(date +%Y-%m-%d)*