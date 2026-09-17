# SOP Mobile App Development (iOS + Android - Flutter)

## 1. Tujuan

Menghasilkan aplikasi mobile untuk **iOS dan Android** (via Flutter) sesuai **100% PRD**, aman, stabil, aksesibel, konsisten dengan desain, dan siap dirilis tanpa tahap terlewat.

## 2. Aturan Mutlak

1. CEO memvalidasi seluruh temuan kebutuhan sebelum delegasi.
2. PM tidak boleh membuat asumsi. Requirement tidak tersedia wajib didiskusikan dengan Board.
3. PM hanya boleh mendelegasikan pekerjaan setelah CEO menyetujui PRD dan struktur file.
4. Backend dan frontend wajib berkoordinasi melalui PM.
5. Setiap agent wajib membuat laporan kerja.
6. PM汇总 laporan, memeriksa gap, lalu menyuruh QA testing.
7. QA testing seluruh PRD, seluruh test case, edge case, regression, keamanan, aksesibilitas, performa, kompatibilitas, dan instalasi. **Tidak ada pengecualian.**
8. Bug wajib lapor ke PM, diperbaiki, lalu diuji ulang.
9. Release hanya boleh jika implementasi sesuai PRD **100%**.
10. PM melapor ke CEO. CEO melapor ke Board untuk testing lanjutan dan perintah deploy.
11. Deploy bersifat manual.
12. Monitoring tidak boleh aktif sebelum Board memberi aba-aba.

## 3. Agent Profile

| Peran | Skill / Agent | Tanggung Jawab |
|---|---|---|
| CEO | CEO & Strategic AI Assistant | Validasi kebutuhan, pantau progress, evaluasi laporan, rekomendasikan keputusan |
| Board | Anda | Keputusan final, approval PRD, approval release, perintah deploy, aba-aba monitoring |
| PM | `aa-project-manager-senior` | Requirement clarification, PRD, struktur file, task breakdown, koordinasi, status tracking |
| UI Designer | `aa-design-ui-designer` | Visual system, komponen, asset, design handoff |
| UX Architect | `aa-design-ux-architect` | User flow, information architecture, interaction pattern, technical UX foundation |
| Impeccable | `impeccable` | Validasi kualitas UX/UI, responsive behavior, accessibility, performance, polish |
| Mobile App Builder | `aa-engineering-mobile-app-builder` | Flutter implementation, platform optimization, store readiness |
| Backend Architect | `aa-engineering-backend-architect` | API contract, authentication, database, security, scalability |
| Backend Engineer | `aa-engineering-backend-architect` | Backend implementation, API, database, integration |
| Frontend Engineer | `aa-engineering-mobile-app-builder` | Flutter UI implementation dan state management |
| Code Reviewer | `aa-engineering-code-reviewer` | Review correctness, security, maintainability, performance, testing |
| QA | `aa-testing-test-automation-engineer` | Functional, regression, integration, device, performance, security, release testing |
| Accessibility Auditor | `aa-testing-accessibility-auditor` | VoiceOver/TalkBack, touch target, focus, labels, contrast, inclusive testing |

## 4. Platform Mapping

| Permintaan | Platform | Implementation |
|---|---|---|
| iOS + Android | iOS dan Android | Flutter |
| iOS saja | iOS | Swift |
| Android saja | Android | Kotlin |

## 5. Dokumentasi Wajib

PM menentukan struktur final. Struktur minimum:

```text
docs/
├── README.md
├── ANTIGRAVITY.md
├── AGENT-HOME.md
├── PRD/
│   └── PRD.md
├── PM/
│   ├── PM-PLAN.md
│   └── PM-STATUS.md
├── DESIGN/
│   ├── DESIGN.md
│   └── DESIGN-ASSETS.md
├── BACKEND/
│   ├── BACKEND-REPORT.md
│   └── API-CONTRACT.md
├── FRONTEND/
│   └── FRONTEND-REPORT.md
├── QA/
│   ├── QA-PLAN.md
│   ├── QA-REPORT.md
│   └── BUG-REGISTER.md
├── CODE-REVIEW/
│   └── CODE-REVIEW.md
├── CEO/
│   └── CEO-REPORT.md
├── BOARD/
│   ├── BOARD-APPROVAL.md
│   └── DEPLOY-COMMAND.md
└── RELEASE/
    ├── RELEASE-CHECKLIST.md
    └── DEPLOY-LOG.md
```

Ketentuan:

- `README.md`: ringkasan manusia dan cara memulai.
- `ANTIGRAVITY.md`: technical bible.
- `AGENT-HOME.md`: satu file home berisi ringkasan seluruh agent, status, file kerja, dependency, dan approval.
- Setiap agent membuat file di folder kerjanya.
- Tidak ada pekerjaan dianggap selesai tanpa dokumentasi.

## 6. Workflow

### 6.1 Requirement Gathering

PM melakukan wawancara mendalam dan membantah pendapat Board jika tidak berdasar.

PM mengumpulkan:

- tujuan bisnis;
- user dan use case;
- fitur;
- alur pengguna;
- platform;
- minimum OS/device;
- backend/API;
- database;
- autentikasi;
- notification;
- pembayaran;
- camera/location/media;
- offline mode;
- analytics;
- privacy;
- keamanan;
- content;
- acceptance criteria;
- constraint;
- risiko;
- hal yang tidak termasuk scope.

Setiap temuan PM wajib dilaporkan ke CEO. CEO menyetujui atau menolak sebelum PM membuat PRD.

### 6.2 PRD Approval

PM membuat `PRD/PRD.md`.

PRD wajib memuat:

- requirement ID;
- user story;
- acceptance criteria;
- design reference;
- API reference;
- data requirement;
- security requirement;
- accessibility requirement;
- test case reference;
- status approval.

CEO menyetujui PRD. Tanpa approval, PM tidak boleh mendelegasikan pekerjaan.

### 6.3 Technical Design

PM membuat struktur file dan task breakdown.

Backend Architect membuat:

- API contract;
- database schema;
- authentication/authorization;
- error standard;
- pagination/filtering;
- migration strategy;
- security standard.

Design team membuat:

- user flow;
- wireframe;
- high-fidelity design;
- component specification;
- interaction state;
- empty/loading/error state;
- responsive/platform adaptation;
- accessibility specification.

PM memastikan backend dan frontend memakai contract yang sama.

### 6.4 Development

PM mendelegasikan task ke Backend Engineer dan Frontend Engineer.

Backend Engineer wajib:

- implement API sesuai contract;
- validasi input;
- handle error;
- implement authorization;
- implement database migration;
- tambahkan test;
- dokumentasikan perubahan;
- buat PR.

Frontend Engineer wajib:

- implement UI sesuai design;
- ikuti platform pattern;
- implement state management;
- integrasi API;
- handle loading/error/empty;
- tambahkan test;
- dokumentasikan perubahan;
- buat PR.

Flutter:

- shared logic boleh dipakai;
- platform-specific implementation wajib dipisahkan;
- native module harus punya contract dan dokumentasi;
- iOS dan Android tetap diuji terpisah (tidak ada cross-platform testing shortcut).

Swift:

- ikuti Human Interface Guidelines;
- gunakan Swift/SwiftUI atau UIKit sesuai keputusan PM.

Kotlin:

- ikuti Material Design 3;
- gunakan Kotlin/Jetpack Compose atau View sesuai keputusan PM.

### 6.5 Code Review

Setiap PR wajib melalui `aa-engineering-code-reviewer`.

Review wajib memeriksa:

- correctness;
- security;
- API contract;
- data integrity;
- race condition;
- error handling;
- performance;
- maintainability;
- test coverage;
- accessibility;
- platform behavior;
- dokumentasi.

PR tidak boleh digabung sebelum:

- minimal satu reviewer approve;
- CI wajib lulus;
- semua blocker review selesai;
- perubahan didokumentasikan.

### 6.6 QA Planning

Setelah development dan code review selesai, PM membuat `QA/QA-PLAN.md`.

QA plan wajib mencakup:

- requirement traceability matrix;
- functional test;
- API test;
- database test;
- regression test;
- install/uninstall/update test;
- authentication test;
- authorization test;
- permission test;
- offline/network test;
- crash test;
- performance test;
- battery/memory test;
- security test;
- accessibility test;
- responsive/device test;
- notification test;
- payment test jika ada;
- deep link test jika ada;
- store submission test jika ada.

Tidak ada kategori yang boleh ditiadakan. Jika suatu fitur tidak ada, QA tetap mendokumentasikan bukti bahwa fitur tersebut tidak termasuk PRD.

### 6.7 QA Execution

QA testing seluruh PRD dan seluruh test case.

QA wajib:

- tidak melewatkan test;
- tidak memakai asumsi;
- memakai device/OS nyata;
- menguji semua supported platforms;
- menguji install, open, update, logout, login, crash recovery;
- menguji slow network, no network, timeout, API error;
- menguji permission deny/grant;
- menguji background/foreground;
- menguji orientation/split screen;
- menguji assistive technology;
- menguji performance dan memory;
- menguji security;
- menguji crash free user experience;
- tidak boleh ada fitur yang lewat pengujian tanpa alasan.

Setiap QA result wajib dilaporkan ke PM. PM menyempurnakan laporan.

### 6.8 Bug Fix & Retest

Setelah QA menemukan bug, PM mengirimkan laporan ke Backend/Frontend Engineer.

Engineer memperbaiki bug.

Setelah diperbaiki, QA melakukan retest dan memastikan fix tidak membuat regression baru.

### 6.9 Review & Persetujuan Final

PM melaporkan hasil QA dan bug fix ke CEO.

CEO menilai apakah implementasi sesuai 100% PRD.

Jika ada gap di bawah 100% PRD, dikembalikan ke pengembangan/perbaikan.

### 6.10 Deploy & Monitoring

Setelah CEO persetujuan:

- PM melakukan manual deploy staging.
- QA melakukan smoke test staging.
- Jika staging OK, PM melaporkan ke CEO.
- CEO meminta persetujuan deploy ke production (baik iOS maupun Android).
- Setelah CEO sign-off: **manual deploy** ke App Store & Play Store.
- Monitoring diaktifkan oleh CEO jika Board memerintahkan.

Monitoring diaktifkan oleh Board via process_manage. Tidak boleh aktif sebelum perintah Board.

---

*Disusun untuk SOP Mobile App Development (iOS + Android - Flutter)*
*Versi: 1.0*
*Tanggal: 2026-09-09*