# PROJECT_CONSTITUTION.md
## [PROJECT NAME] — Konstitusi Proyek

> File ini menjadi hukum utama proyek.
> Setiap keputusan harus selaras dengan konstitusi ini.

---

| Field | Isi |
|---|---|
| **Project Name** | [Isi] |
| **Project Purpose** | [Isi] |
| **Project Owner** | [Isi] |
| **Business Objective** | [Isi] |
| **Technology Stack** | React/Next.js, Node/Express, Python/Django, PostgreSQL |
| **Architecture Rules** | Lihat `ARCHITECTURE.md` |
| **Coding Rules** | Standar coding Hermes SOP-07, SOP-08 |
| **Security Rules** | Mandatory pre-release review (SOP-11) |
| **Database Rules** | ERD → Constraint → Index → Migration → Seed → Test (SOP-09) |
| **Testing Rules** | Unit → Integration → API → UI → E2E → Security → Performance (SOP-12) |
| **Deployment Rules** | Backup → Migration → Deploy → Health Check → Smoke Test → Monitoring → Rollback (SOP-23) |
| **Approval Rules** | Owner approval gate untuk: architecture, database destructive change, business rule, security, tech stack, major UI/UX, data migration, production deploy, deletion (SOP-18) |
| **Forbidden Actions** | 1. Ubah requirement tanpa approval owner. 2. Hapus data production tanpa approval. 3. Destructive migration tanpa approval. 4. Ganti tech stack utama tanpa approval. 5. Semua business rule penting harus ada test. 6. API harus ada authorization. 7. Secret tidak boleh di source code. 8. Jangan nyatakan fitur selesai sebelum acceptance criteria terpenuhi. 9. Jangan mengarang requirement. 10. Requirement ambigu → minta klarifikasi. 11. Perubahan harus terdokumentasi. 12. Jangan perbaiki satu modul → rusak modul lain. |

---

## MODE Operasional

Setiap tahap menggunakan MODE:

```text
ANALYSIS → ARCHITECTURE → DATABASE → CODING → API →
TESTING → REVIEW → SECURITY_AUDIT → DEVOPS → DOCUMENTATION
```

Agent yang aktif per MODE:

| MODE | Agent |
|---|---|
| ANALYSIS | aa-product-manager, aa-business-strategist |
| ARCHITECTURE | aa-engineering-software-architect |
| DATABASE | aa-engineering-database-optimizer |
| CODING | aa-engineering-frontend-developer, aa-engineering-backend-architect |
| API | aa-engineering-api-platform-engineer |
| TESTING | aa-testing-test-automation-engineer, e2e-testing-automation |
| REVIEW | aa-engineering-code-reviewer |
| SECURITY_AUDIT | aa-security-architect, aa-security-appsec-engineer |
| DEVOPS | aa-engineering-devops-automator |
| DOCUMENTATION | aa-specialized-document-generator |

---

## SOP Reference

- SOP Master: `HERMES_SOP.md`
- Requirements: `REQUIREMENTS.md`
- Business Rules: `BUSINESS_RULES.md`
- Architecture: `ARCHITECTURE.md`
- Database: `DATABASE.md`
- API: `API.md`
- Security: `SECURITY.md`
- Testing: `TESTING.md`
- Deployment: `DEPLOYMENT.md`
- Changelog: `CHANGELOG.md`
- ADR: `ADR/ADR-001.md`, `ADR-002.md`, ...

---

**Dibuat:** [Tanggal]
**Owner:** [Nama]
**Last Updated:** [Tanggal]
