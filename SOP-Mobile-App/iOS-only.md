# SOP Mobile App Development (iOS Only)

## Tujuan
Memastikan pengembangan aplikasi iOS (Swift) mengikuti prosedur terstruktur, terukur, dan tervalidasi secara mendalam. Semua tugas, tanggung jawab, dan checkpoint disetujui oleh CEO sebelum deploy.

## Lingkup
Menghubungkan semua aktivitas dari pengumpulan kebutuhan hingga deploy aplikasi iOS (Swift).

## Definisi Peran (RACI)

| Aktivitas | CEO | PM | iOS (Swift) | QA | Designer |
|-----------|-----|----|--------------|----|----------|
| Kickoff & Alignment | A | R | C | I | I |
| Pengumpulan Kebutuhan | A | R | C | I | C |
| Perancangan Desain | I | A | C | C | R |
| Perancangan Teknis | I | A | R | C | C |
| Persiapan Lingkungan | I | A | C | I | I |
| Pengembangan (iOS) | I | A | R | C | C |
| Pengujian QA | I | C | C | R | C |
| Review & Persetujuan Final | A | R | C | C | C |
| Deploy & Monitoring | A | R | C | C | I |

**R = Responsible**, **A = Accountable**, **C = Consulted**, **I = Informed**

## Fase 0: Kickoff & Alignment
1. **Pertemuan Kickoff** — CEO, PM, iOS Lead, QA Lead, Designer.
2. **Output**: Kickoff Minutes (`/docs/kickoff-<nama>.md`), PRODUCT.md, RACI disetujui CEO.

## Fase 1: Pengumpulan Kebutuhan (Requirement Gathering)
1. Wawancara stakeholder (minimal 2 sesi).
2. **Output**: **PRODUCT.md** — vision, user personas, functional & non-functional requirements.

## Fase 2: Perancangan Desain & Teknis
### 2.1 Desain UI/UX (iOS)
- Mengikuti Human Interface Guidelines (Apple).
- Fokus: native look & feel, tab bar, navigation stack.
- **Output**: **DESIGN.md** — design system (colors, typography, spacing) + platform-specific mockups.

### 2.2 Perancangan Teknis (iOS)
- **API Contract**: OpenAPI/Swagger (Swift 5.9+).
- **Database**: Core Data / SwiftData.
- **Architecture**: MVVM atau Clean Architecture.
- **Output**: **TECH.md** — API spec, DB schema, architecture diagram.

## Fase 3: Persiapan Lingkungan & Infrastruktur
- Repositori git (GitHub/GitLab) dengan branching strategy (GitFlow).
- CI/CD (GitHub Actions) untuk build, test, dan deploy.
- Environment: dev, staging, production (iOS).
- Pre-commit hooks (husky + lint-staged) untuk formatting & linting.

## Fase 4: Pengembangan (Development Sprint)
### 4.1 iOS (Swift)
- Implementasi UI sesuai mockup & design system.
- Integrasi dengan API (Swift).
- Unit test (XCTest) + Integration test.
- Code review wajib (minimal 1 approval).

## Fase 5: Pengujian QA (Comprehensive)
### 5.1 Fungsional
- Setiap fitur sesuai PRODUCT.md dan alur pengguna.
- Test case disetujui QA sebelum deployment.

### 5.2 Non-Fungsional
- **Performance**: LCP < 2.5s, TTI < 3s (Google Lighthouse).
- **Security**: Validasi input, OAuth2, penyimpanan data aman.
- **Accessibility**: WCAG 2.1 AA (fokus VoiceOver).
- **Compatibility**: Uji di iOS 17+ (versi minimal).

### 5.3 Output: Test Report
- **test-report-iOS.md** — daftar bug (seperti SOP website) dengan status (open/resolved).

## Fase 6: Review & Persetujuan Final
1. **Pertemuan Review** (PM + iOS Lead + QA + CEO).
2. **Kriteria Keluar**:
   - 100% test case passed.
   - Zero critical/high severity bug.
   - Design & functionality sesuai PRODUCT.md.
   - Security & accessibility check passed.
3. **Output**: **Approval.md** (persetujuan CEO) dengan daftar fitur yang diterima dan yang dipostpon.

## Fase 7: Deploy & Monitoring Pasca-Deploy
### 7.1 Deploy
- **Staging**: Deploy ke staging → Smoke test → Approval.
- **Production**: Deploy ke App Store.
- **Rollback**: Siap rollback jika error muncul.

### 7.2 Monitoring (CEO)
- Cek monitoring via *process_manage* (CI/CD status, log aplikasi).
- Pantau metrik: uptime, response time, error rate (24 jam pertama).
- Jika ada incident, buat incident report dan post-mortem.

## Dokumen Pendukung (Disimpan di `/docs/`)

| File | Isi |
|------|-----|
| `PRODUCT.md` | Vision, user personas, functional & non-functional requirements |
| `DESIGN.md` | Design system + iOS-specific mockups |
| `TECH.md` | API spec, DB schema, architecture diagram |
| `RACI.md` | Matriks tanggung jawab (RACI) |
| `test-report-iOS.md` | Laporan pengujian iOS |
| `approval-<nama>.md` | Persetujuan CEO |
| `deploy-<nama>.log` | Log deploy |
| `post-deploy-checklist-<nama>.md` | Checklist pasca-deploy |

## Standarisasi Kualitas

1. **Code Review**: Setiap PR harus mendapat minimal 1 approval.
2. **Test Coverage**: Unit test coverage minimal 80% untuk logika kritis.
3. **Design Consistency**: UI harus sesuai DESIGN.md dan melewati audit aksesibilitas (WCAG AA).
4. **API Contract**: Frontend & backend berkomunikasi berdasarkan spesifikasi yang disetujui (tidak ada asumsi field).
5. **Deploy Hanya Setelah Persetujuan CEO**: Tidak ada deploy ke production tanpa tanda tangan akhir dari CEO.

## Penanganan Eksepsi

- Jika ada perubahan fundamental dari stakeholder, kembali ke Fase 1 atau 2 setelah mendapatkan persetujuan CEO.
- Jika terdesak karena batas waktu, buat versi MVP dengan fitur inti saja, tetap harus melewati semua tahap di atas untuk fitur yang diinkluded.

---
*Disusun untuk SOP Mobile App Development (iOS Only)*
*Versi: 1.0*
*Tanggal: 2026-09-09*