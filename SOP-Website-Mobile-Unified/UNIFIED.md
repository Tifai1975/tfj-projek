# SOP Pengembangan Website + Mobile App (Unified)

## 1. Tujuan
Menghasilkan **website** (Next.js/React) dan **mobile app** (iOS + Android via Flutter, atau native Swift/Kotlin) yang berbagi **backend, API contract, design system, dan PRD** — seluruhnya **100% compliance**, aman, stabil, aksesibel, dan siap produksi tanpa tahap terlewat.

## 2. Aturan Mutlak
1. CEO memvalidasi seluruh temuan kebutuhan sebelum delegasi.
2. PM tidak boleh membuat asumsi. Requirement tidak tersedia → diskusikan dengan Board.
3. PM hanya mendelegasikan setelah CEO menyetujui **PRD gabungan** dan struktur file.
4. Backend, Website Frontend, Mobile Frontend wajib koordinasi melalui PM.
5. Setiap agent wajib membuat laporan kerja di folder masing-masing.
6. PM汇总 laporan, cek gap, suruh QA testing lintas platform.
7. QA testing **seluruh PRD, seluruh test case, edge case, regression, security, a11y, performance, kompatibilitas, instalasi** di **website, iOS, Android**. Tidak ada pengecualian.
8. Bug → lapor ke PM → perbaiki → retest lintas platform.
9. Release hanya jika implementasi **100% PRD** di ketiga platform.
10. PM lapor ke CEO → CEO minta approval Board untuk testing lanjutan + perintah deploy.
11. Deploy bersifat manual, terkoordinasi (web + mobile bersamaan atau bertahap).
12. Monitoring tidak aktif sebelum Board memberi aba-aba.

## 3. Agent Profile (Gabungan)

| Peran | Skill / Agent | Tanggung Jawab |
|---|---|---|
| CEO | CEO & Strategic AI Assistant | Validasi kebutuhan, pantau progress, evaluasi laporan, rekomendasikan keputusan |
| Board | Anda | Keputusan final, approval PRD, approval release, perintah deploy, aba-aba monitoring |
| PM | `aa-project-manager-senior` | Requirement clarification, PRD gabungan, struktur file, task breakdown, koordinasi lintas platform, status tracking |
| UI Designer | `aa-design-ui-designer` | Visual system gabungan (web + mobile), komponen, asset, design handoff |
| UX Architect | `aa-design-ux-architect` | User flow lintas platform, IA, interaction pattern, technical UX foundation |
| Impeccable | `impeccable` | Validasi kualitas UX/UI web & mobile, responsive, a11y, performance, polish |
| Web Frontend Engineer | `aa-engineering-frontend-developer` | Next.js/React implementation, SSR/SSG, state management, API integration |
| Mobile App Builder | `aa-engineering-mobile-app-builder` | Flutter/Swift/Kotlin implementation, platform optimization, store readiness |
| Backend Architect | `aa-engineering-backend-architect` | API contract, authentication, database, security, scalability (shared) |
| Backend Engineer | `aa-engineering-backend-architect` | Backend implementation, API, database, integration |
| Code Reviewer | `aa-engineering-code-reviewer` | Review correctness, security, maintainability, performance, testing (semua PR) |
| QA | `aa-testing-test-automation-engineer` | Functional, regression, integration, device, performance, security, release testing (web + mobile) |
| Accessibility Auditor | `aa-testing-accessibility-auditor` | VoiceOver/TalkBack, screen reader web, touch target, focus, labels, contrast, inclusive testing |

## 4. Platform Mapping

| Permintaan | Website | Mobile |
|---|---|---|
| Default | Next.js (React, TypeScript, Tailwind) | Flutter (iOS + Android) |
| Alternatif mobile | - | Swift (iOS) + Kotlin (Android) |

## 5. Dokumentasi Wajib (Struktur Gabungan)

PM menentukan struktur final. Minimum:

```text
docs/
├── README.md
├── ANTIGRAVITY.md
├── AGENT-HOME.md
├── PRD/
│   └── PRD.md                    # PRD gabungan (web + mobile)
├── PM/
│   ├── PM-PLAN.md
│   └── PM-STATUS.md
├── DESIGN/
│   ├── DESIGN.md                 # Design system gabungan
│   ├── DESIGN-WEB.md             # Web-specific adaptations
│   ├── DESIGN-MOBILE.md          # Mobile-specific adaptations
│   └── DESIGN-ASSETS.md
├── BACKEND/
│   ├── BACKEND-REPORT.md
│   ├── API-CONTRACT.md           # Single source of truth untuk web & mobile
│   └── DATABASE-SCHEMA.md
├── WEB/
│   ├── WEB-REPORT.md
│   └── WEB-COMPONENTS.md
├── MOBILE/
│   ├── MOBILE-REPORT.md
│   ├── MOBILE-IOS.md
│   └── MOBILE-ANDROID.md
├── QA/
│   ├── QA-PLAN.md                # Test plan lintas platform
│   ├── QA-REPORT.md
│   ├── QA-WEB.md
│   ├── QA-IOS.md
│   ├── QA-ANDROID.md
│   └── BUG-REGISTER.md
├── CODE-REVIEW/
│   ├── CODE-REVIEW-WEB.md
│   ├── CODE-REVIEW-MOBILE.md
│   └── CODE-REVIEW-BACKEND.md
├── CEO/
│   └── CEO-REPORT.md
├── BOARD/
│   ├── BOARD-APPROVAL.md
│   └── DEPLOY-COMMAND.md
└── RELEASE/
    ├── RELEASE-CHECKLIST.md
    ├── DEPLOY-WEB-LOG.md
    ├── DEPLOY-IOS-LOG.md
    ├── DEPLOY-ANDROID-LOG.md
    └── POST-DEPLOY-CHECKLIST.md
```

Ketentuan:
- `README.md`: ringkasan manusia, cara memulai, arsitektur singkat.
- `ANTIGRAVITY.md`: technical bible (stack, decisions, conventions).
- `AGENT-HOME.md`: satu file home — ringkasan seluruh agent, status, file kerja, dependency, approval.
- Setiap agent membuat file di folder kerjanya.
- Tidak ada pekerjaan selesai tanpa dokumentasi.

## 6. Workflow Gabungan

### 6.1 Requirement Gathering (Gabungan)
PM wawancara mendalam, membantah pendapat Board jika tidak berdasar.

Kumpulkan **sekaligus untuk web & mobile**:
- Tujuan bisnis & success metrics
- User personas & journey map (web & mobile)
- Fitur & prioritas per platform
- Alur pengguna lintas platform (mis. login web → buka mobile → sinkron)
- Platform target: web (desktop/mobile browser), iOS, Android
- Minimum OS/browser/device
- Backend/API (shared)
- Database (shared)
- Auth (shared: OAuth2, JWT, SSO)
- Notification (web push, mobile push)
- Payment (shared gateway)
- Camera/location/media (mobile-specific)
- Offline mode (mobile, PWA untuk web)
- Analytics (shared events)
- Privacy & compliance (GDPR, App Store, Play Store)
- Security requirements
- Content strategy (CMS, localization)
- Acceptance criteria per platform
- Constraints, risks, out-of-scope

**Output**: Laporan ke CEO → CEO approve → PM buat PRD.

### 6.2 PRD Approval (Gabungan)
PM buat `PRD/PRD.md` **satu file** yang mencakup web & mobile.

PRD wajib memuat per requirement:
- Requirement ID
- Platform(s): Web / iOS / Android / All
- User story
- Acceptance criteria (per platform jika berbeda)
- Design reference (link ke DESIGN.md)
- API reference (link ke API-CONTRACT.md)
- Data requirement
- Security requirement
- Accessibility requirement (WCAG 2.1 AA)
- Test case reference
- Status approval

CEO approve PRD. Tanpa approval → PM tidak boleh delegasi.

### 6.3 Technical Design (Gabungan + Platform-Specific)

**Backend Architect** (shared):
- API contract (OpenAPI 3.1) → `BACKEND/API-CONTRACT.md`
- Database schema → `BACKEND/DATABASE-SCHEMA.md`
- Auth/authorization spec
- Error standard, pagination, filtering
- Migration strategy
- Security standard
- Rate limiting, caching strategy

**Design Team** (gabungan + adaptasi):
- `DESIGN/DESIGN.md` — design system gabungan: color, typography, spacing, iconography, component library (web + mobile variants)
- `DESIGN/DESIGN-WEB.md` — web adaptations: responsive breakpoints, hover states, keyboard nav, SSR considerations
- `DESIGN/DESIGN-MOBILE.md` — mobile adaptations: touch targets 44×44pt, gesture patterns, platform nav (tab bar vs bottom nav), safe areas, native components
- User flow diagrams (web & mobile)
- Wireframe → high-fidelity mockup (web, iOS, Android)
- Component specification dengan platform variants
- Interaction states (hover/web, press/mobile, focus/keyboard)
- Empty/loading/error states
- Accessibility spec (WCAG AA, VoiceOver, TalkBack)

PM pastikan backend, web frontend, mobile frontend pakai **contract yang sama**.

### 6.4 Development (Parallel Sprints)

PM delegasikan task ke **tiga tim paralel** via task breakdown:

#### Backend Engineer
- Implement API sesuai `API-CONTRACT.md`
- Validasi input, handle error, authorization
- Database migration
- Unit + integration test
- Dokumentasi perubahan → `BACKEND/BACKEND-REPORT.md`
- PR → code review

#### Web Frontend Engineer (`aa-engineering-frontend-developer`)
- Next.js/React + TypeScript + Tailwind
- Implement UI sesuai `DESIGN-WEB.md`
- State management (React Query / Zustand / Redux)
- API integration (shared contract)
- SSR/SSG/ISR sesuai kebutuhan
- Responsive (mobile-first breakpoints)
- A11y: semantic HTML, ARIA, keyboard nav, focus management
- Unit test (Vitest/Jest), integration test (Playwright)
- Dokumentasi → `WEB/WEB-REPORT.md`, `WEB/WEB-COMPONENTS.md`
- PR → code review

#### Mobile Frontend Engineer (`aa-engineering-mobile-app-builder`)
**Flutter (default untuk iOS + Android):**
- Shared logic (business logic, state management, API client)
- Platform-specific UI: `lib/src/presentation/ios/`, `lib/src/presentation/android/`
- Native modules (channel) dengan contract & dokumen terpisah
- iOS & Android diuji **terpisah** (tidak ada cross-platform testing shortcut)
- Unit test, widget test, integration test
- Dokumentasi → `MOBILE/MOBILE-REPORT.md`, `MOBILE/MOBILE-IOS.md`, `MOBILE/MOBILE-ANDROID.md`
- PR → code review

**Alternatif Native (jika diminta):**
- iOS: Swift/SwiftUI, Human Interface Guidelines
- Android: Kotlin/Jetpack Compose, Material Design 3
- Masing-masing codebase terpisah, PR terpisah, review terpisah

### 6.5 Code Review (Wajib Semua PR)
Setiap PR (backend, web, mobile) lewat `aa-engineering-code-reviewer`.

Review checklist:
- Correctness vs PRD & API contract
- Security (injection, XSS, auth bypass, data leakage)
- Data integrity & race condition
- Error handling & logging
- Performance (N+1, bundle size, memory, battery)
- Maintainability (naming, structure, duplication)
- Test coverage (≥80% critical logic)
- Accessibility (semantic, labels, contrast, focus)
- Platform behavior (HIG / Material 3 / Web standards)
- Dokumentasi updated

PR tidak merge sebelum:
- Minimal 1 reviewer approve
- CI lulus (lint, typecheck, test, build)
- Semua blocker selesai
- Perubahan terdokumentasi

### 6.6 QA Planning (Lintas Platform)
Setelah dev + code review selesai, PM buat `QA/QA-PLAN.md`.

QA plan wajib mencakup **per platform**:

**Shared (Backend/API):**
- API contract test (request/response, status codes, auth)
- Database test (migration, query, constraint)
- Auth/authorization test (role, permission, token refresh)
- Rate limiting, caching, security headers

**Web (`QA/QA-WEB.md`):**
- Functional test per feature (desktop + mobile browser)
- Responsive test (320px – 1920px+)
- Cross-browser (Chrome, Firefox, Safari, Edge)
- PWA test (install, offline, update, cache)
- Performance (LCP < 2.5s, TTI < 3s, CLS < 0.1)
- Accessibility (axe-core, keyboard, screen reader NVDA/VoiceOver)
- Security (CSP, HSTS, XSS, CSRF)
- SEO basics (meta, sitemap, robots)

**iOS (`QA/QA-IOS.md`):**
- Functional test per feature (iPhone/iPad)
- Device/OS matrix (iOS 17+, iPhone SE – Pro Max)
- Install/uninstall/update test (TestFlight → App Store)
- Orientation, split screen, multitasking
- Background/foreground, crash recovery
- Permission (camera, location, notification, photo)
- Network: slow, offline, timeout, API error
- VoiceOver, Dynamic Type, Reduce Motion, Switch Control
- Performance (launch time, memory, battery, scroll 60fps)
- Security (Keychain, App Transport Security, biometric)
- Deep link, Universal Link
- App Store submission test

**Android (`QA/QA-ANDROID.md`):**
- Functional test per feature (phone/tablet/foldable)
- Device/OS matrix (Android 14+, various OEM)
- Install/uninstall/update (Play Store internal → production)
- Orientation, split screen, multi-window
- Background/foreground, crash recovery
- Permission (runtime, special)
- Network: slow, offline, timeout, API error
- TalkBack, font scale, high contrast, reduce motion
- Performance (launch, memory, battery, jank)
- Security (Keystore, network security config, biometric)
- Deep link, App Link
- Play Store submission test

**Lintas Platform (Integration):**
- Auth flow konsisten (login web → buka mobile auto-login)
- Data sync real-time / background
- Notification konsisten (web push ↔ mobile push)
- Deep link / universal link / app link
- Offline → online sync
- Account deletion / logout semua device

Tidak ada kategori ditiadakan. Fitur tidak ada → QA dokumentasikan bukti out-of-scope.

### 6.7 QA Execution
QA testing **seluruh PRD, seluruh test case, semua platform**.

QA wajib:
- Tidak melewatkan test, tidak pakai asumsi
- Device/OS/browser nyata (tidak hanya simulator/emulator)
- Uji install, open, update, logout, login, crash recovery
- Uji slow network, no network, timeout, API error
- Uji permission deny/grant
- Uji background/foreground, orientation, split screen
- Uji assistive technology (VoiceOver, TalkBack, NVDA, keyboard-only)
- Uji performance, memory, battery
- Uji security
- Uji crash-free experience
- **Tidak boleh ada fitur lewat pengujian tanpa alasan tertulis**

Hasil QA → lapor ke PM → PM sempurnakan laporan.

### 6.8 Bug Fix & Retest (Lintas Platform)
PM kirim bug report ke engineer terkait (backend/web/mobile).
Engineer perbaiki → PR → code review → merge.
QA retest **di platform yang terpengaruh + regression lintas platform**.
Pastikan fix tidak bikin regression baru di platform lain.

### 6.9 Review & Persetujuan Final
PM lapor hasil QA + bug fix ke CEO.
CEO evaluasi: implementasi **100% PRD di web, iOS, Android**.
Gap < 100% → kembali ke pengembangan/perbaikan.

### 6.10 Deploy & Monitoring (Terkoordinasi)

**Staging Deploy (Manual, Terkoordinasi):**
1. PM deploy backend staging → QA smoke test API.
2. PM deploy web staging → QA smoke test web.
3. PM deploy mobile staging (TestFlight + Play Internal) → QA smoke test iOS & Android.
4. Semua staging OK → PM lapor ke CEO.

**Production Deploy (Manual, Bersamaan/Bertahap):**
- CEO minta persetujuan Board untuk deploy production.
- Board approve → PM eksekusi manual deploy terkoordinasi:
  - Backend production (drain connection, migrate, verify)
  - Web production (Vercel/Netlify/self-hosted, cache purge, verify)
  - iOS production (App Store Connect, phased release, verify)
  - Android production (Play Console, staged rollout, verify)
- Rollback plan siap per platform.

**Monitoring:**
- Board perintah monitoring → CEO aktifkan via `process_manage`.
- Pantau: uptime, response time, error rate, crash rate (mobile), Core Web Vitals (web) — 24 jam pertama.
- Incident → incident report + post-mortem.
- Monitoring non-aktif tanpa perintah Board.

---

*Disusun untuk SOP Website + Mobile App Development (Unified)*
*Versi: 1.0*
*Tanggal: 2026-09-09*