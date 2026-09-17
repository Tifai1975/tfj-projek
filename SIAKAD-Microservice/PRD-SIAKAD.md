# PRD: Sistem Informasi Akademik (SIAKAD) Berbasis Microservice

**Status**: Draft  
**Author**: Product Manager SIAKAD  
**Last Updated**: 3 September 2026  
**Version**: 1.0  
**Stakeholders**: Engineering Lead, System Architect, Database Engineer, Frontend Team, Academic Operations

---

## 1. Problem Statement

### Konteks Pendidikan Tinggi Indonesia

Perguruan tinggi di Indonesia menghadapi tantangan kompleks dalam mengelola sistem akademik yang harus:
- **Terintegrasi dengan PDDIKTI**: Pelaporan ke Pangkalan Data Pendidikan Tinggi (PDDIKTI) Kemdikbudristek wajib dan berulang
- **Skala yang beragam**: Dari institusi kecil (500 mahasiswa) hingga universitas besar (50,000+ mahasiswa)
- **Proses akademik kompleks**: KRS, KHS, transkrip, kurikulum per prodi, penjadwalan, dan evaluasi pembelajaran
- **Regulasi ketat**: Standar Nasional Pendidikan Tinggi (SN-Dikti), akreditasi BAN-PT, persyaratan audit
- **Biaya tinggi sistem monolitik**: Vendor seperti Sevima menawarkan solusi lengkap namun dengan biaya lisensi tahunan yang signifikan

### Masalah Spesifik yang Diselesaikan

**Untuk Mahasiswa**:
- Proses pengisian KRS yang lambat saat peak registration (ribuan mahasiswa bersamaan)
- Kesulitan mengakses KHS dan transkrip nilai secara real-time
- Keterbatasan visibilitas jadwal kuliah dan perubahan jadwal mendadak

**Untuk Dosen**:
- Input nilai yang repetitif dan rentan error
- Kesulitan tracking kehadiran mahasiswa
- Sistem terpisah antara jadwal mengajar, materi kuliah, dan penilaian

**Untuk Admin Akademik**:
- Manual intervention untuk resolve konflik jadwal
- Kesulitan generate laporan PDDIKTI yang kompleks
- Sistem monolitik sulit disesuaikan dengan aturan akademik spesifik institusi

**Untuk Pimpinan**:
- Tidak ada real-time dashboard untuk KPI akademik
- Sulit mendapat insights untuk decision making (tingkat kelulusan, IPK rata-rata per prodi, efektivitas kurikulum)

### Evidence

**Market Signal**:
- Sevima SIAKAD Cloud mendominasi pasar dengan model SaaS tapi biaya tinggi (Rp 50-200 juta/tahun untuk institusi menengah)
- Institusi kecil kesulitan afford sistem komersial dan menggunakan spreadsheet atau sistem custom sederhana
- Vendor internasional (Canvas, Blackboard) tidak cocok untuk compliance PDDIKTI Indonesia

**Technical Pain**:
- Sistem monolitik sulit scale saat peak load (registrasi KRS, pengumuman nilai)
- Update fitur atau bug fix memerlukan downtime seluruh sistem
- Integrasi dengan sistem lain (perpustakaan, keuangan, portal) kompleks

---

## 2. Goals & Success Metrics

### North Star Metric
**Tingkat Kepuasan Pengguna Sistem Akademik**: CSAT (Customer Satisfaction Score) ≥ 4.2/5.0

### Supporting Metrics

| Goal | Metric | Current Baseline | Target | Measurement Window |
|------|--------|-----------------|--------|-------------------|
| **Performance saat Peak Load** | Response time saat 5000+ concurrent KRS submission | N/A (new system) | < 2 detik (p95) | Periode registrasi semester |
| **System Availability** | Uptime selama semester aktif | N/A | 99.5% | Per semester |
| **Adoption Rate** | % mahasiswa menggunakan sistem untuk KRS online | Asumsi 0% (sistem baru) | 95% pada semester ke-3 | 18 bulan post-launch |
| **Admin Efficiency** | Waktu generate laporan PDDIKTI | Manual ~40 jam/semester | < 4 jam (automated) | Per semester |
| **Dosen Adoption** | % dosen input nilai via sistem (vs manual spreadsheet) | Asumsi 0% | 85% pada semester ke-2 | 12 bulan |
| **Data Accuracy** | Error rate pelaporan PDDIKTI | Tidak ada baseline | < 0.5% | Per periode pelaporan |

### Business Goals

- **Cost Reduction**: Eliminasi biaya lisensi vendor eksternal (ROI positif dalam 24 bulan)
- **Scalability**: Support 10,000+ mahasiswa aktif tanpa signifikan infrastructure cost increase
- **Customization**: Institusi dapat customize workflow akademik tanpa vendor dependency

---

## 3. Arsitektur Microservice

### Prinsip Arsitektur

1. **Domain-Driven Design**: Setiap microservice mewakili bounded context dalam domain akademik
2. **Database per Service**: Setiap service memiliki database sendiri (polyglot persistence)
3. **API-First**: Semua komunikasi via REST API dengan OpenAPI specification
4. **Event-Driven**: Inter-service communication menggunakan message queue untuk eventual consistency
5. **Independent Deployment**: Setiap service dapat di-deploy dan di-scale secara independen

### Microservice Modules

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway / BFF                        │
│            (Authentication, Rate Limiting, Routing)          │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐   ┌───────▼────────┐   ┌───────▼────────┐
│  Mahasiswa     │   │    Dosen       │   │   Akademik     │
│   Service      │   │   Service      │   │ Structure Svc  │
│                │   │                │   │                │
│ - Profile      │   │ - Profile      │   │ - Fakultas     │
│ - Enrollment   │   │ - Teaching     │   │ - Jurusan      │
│ - Status       │   │ - Schedule     │   │ - Prodi        │
└────────────────┘   └────────────────┘   └────────────────┘

┌────────────────┐   ┌────────────────┐   ┌────────────────┐
│  Kurikulum     │   │    Jadwal      │   │      KRS       │
│   Service      │   │   Service      │   │    Service     │
│                │   │                │   │                │
│ - Curriculum   │   │ - Class Sched  │   │ - Registration │
│ - Courses      │   │ - Room Mgmt    │   │ - Validation   │
│ - Prerequisites│   │ - Conflict Det │   │ - Approval     │
└────────────────┘   └────────────────┘   └────────────────┘

┌────────────────┐   ┌────────────────┐   ┌────────────────┐
│      KHS       │   │   Transkrip    │   │   Reporting    │
│    Service     │   │    Service     │   │    Service     │
│                │   │                │   │                │
│ - Grades       │   │ - Transcript   │   │ - PDDIKTI      │
│ - GPA Calc     │   │ - Graduation   │   │ - Analytics    │
│ - Semester Sum │   │ - Certificate  │   │ - Dashboard    │
└────────────────┘   └────────────────┘   └────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Message Bus (Event Stream)                  │
│              RabbitMQ / Kafka / Redis Streams                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Shared Infrastructure                       │
│   Auth Service, Notification Service, File Storage, Logging  │
└─────────────────────────────────────────────────────────────┘
```

### Service Ownership & Responsibilities

#### 1. **Mahasiswa Service**
- **Responsibility**: Mengelola data master mahasiswa
- **Domain**: Student lifecycle dari admission hingga graduation
- **Database**: PostgreSQL
- **Key Entities**: Mahasiswa, Student Status, Enrollment History

#### 2. **Dosen Service**
- **Responsibility**: Mengelola data dosen dan teaching assignments
- **Domain**: Lecturer profile, teaching load, academic rank
- **Database**: PostgreSQL
- **Key Entities**: Dosen, Teaching Assignment, Academic Rank

#### 3. **Akademik Structure Service**
- **Responsibility**: Struktur organisasi akademik
- **Domain**: Fakultas, Jurusan, Program Studi hierarchy
- **Database**: PostgreSQL
- **Key Entities**: Fakultas, Jurusan, Prodi, Academic Period

#### 4. **Kurikulum Service**
- **Responsibility**: Kurikulum per prodi dan mata kuliah
- **Domain**: Curriculum design, course catalog, prerequisites
- **Database**: PostgreSQL
- **Key Entities**: Kurikulum, Mata Kuliah, Prerequisite, Kompetensi

#### 5. **Jadwal Service**
- **Responsibility**: Penjadwalan kuliah dan ruang kelas
- **Domain**: Class scheduling, room allocation, conflict detection
- **Database**: PostgreSQL
- **Key Entities**: Jadwal Kuliah, Kelas, Ruang, Time Slot

#### 6. **KRS Service**
- **Responsibility**: Registrasi mata kuliah mahasiswa
- **Domain**: Course registration, validation, approval workflow
- **Database**: PostgreSQL + Redis (session cache)
- **Key Entities**: KRS, KRS Item, Registration Period, Approval Log

#### 7. **KHS Service**
- **Responsibility**: Nilai dan grade semester
- **Domain**: Grade entry, GPA calculation, academic standing
- **Database**: PostgreSQL
- **Key Entities**: Nilai, KHS, GPA Semester, Academic Warning

#### 8. **Transkrip Service**
- **Responsibility**: Transkrip akademik dan kelulusan
- **Domain**: Academic transcript, graduation requirements, degree
- **Database**: PostgreSQL
- **Key Entities**: Transkrip, Graduation Status, Degree Certificate

#### 9. **Reporting Service**
- **Responsibility**: Laporan dan analytics
- **Domain**: PDDIKTI integration, institutional reports, dashboards
- **Database**: PostgreSQL (read replicas) + TimescaleDB (metrics)
- **Key Entities**: PDDIKTI Report, KPI Metrics, Analytics Query

---

## 4. User Personas & Stories

### Persona 1: Mahasiswa (Budi, Mahasiswa Semester 5)

**Profil**:
- Usia 20 tahun, mahasiswa Teknik Informatika semester 5
- Tech-savvy, menggunakan smartphone untuk mayoritas akses
- Khawatir tentang jadwal kuliah bentrok dan batas SKS
- Ingin proses KRS cepat karena mata kuliah populer cepat penuh

**Core User Stories**:

**Story 1**: Sebagai mahasiswa, saya ingin melihat jadwal kuliah yang tersedia untuk semester depan sehingga saya bisa merencanakan KRS saya.
- **Acceptance Criteria**:
  - ✅ Given mahasiswa login, when akses halaman jadwal, then tampil daftar mata kuliah semester depan dengan waktu dan ruang
  - ✅ Given mata kuliah dengan multiple kelas, when filter berdasarkan hari/jam, then hanya tampil kelas yang sesuai
  - ✅ Performance: Load jadwal < 1.5s untuk 200+ mata kuliah

**Story 2**: Sebagai mahasiswa, saya ingin mengisi KRS online sehingga saya tidak perlu datang ke kampus dan antri.
- **Acceptance Criteria**:
  - ✅ Given periode KRS aktif, when pilih mata kuliah, then sistem validasi prerequisite dan batas SKS real-time
  - ✅ Given mata kuliah penuh, when attempt register, then tampil notifikasi dan suggest kelas alternatif
  - ✅ Given KRS di-submit, when proses approval, then mahasiswa dapat track status via dashboard
  - ✅ Performance: Submit KRS < 2s bahkan saat 1000+ concurrent users

**Story 3**: Sebagai mahasiswa, saya ingin melihat KHS saya segera setelah nilai keluar sehingga saya tahu performa akademik saya.
- **Acceptance Criteria**:
  - ✅ Given dosen sudah input nilai, when mahasiswa akses KHS, then nilai tampil real-time tanpa delay
  - ✅ Given KHS semester, when tampil, then include GPA semester dan GPA kumulatif dengan perhitungan akurat
  - ✅ Given academic warning (IP < 2.0), when akses KHS, then tampil notifikasi pembinaan akademik

### Persona 2: Dosen (Dr. Siti, Dosen Tetap)

**Profil**:
- Usia 42 tahun, dosen tetap dengan 15 tahun pengalaman
- Mengajar 3-4 mata kuliah per semester
- Tidak terlalu tech-savvy, prefer sistem yang simple dan straightforward
- Sering traveling untuk konferensi, butuh akses mobile

**Core User Stories**:

**Story 1**: Sebagai dosen, saya ingin input nilai mahasiswa secara batch sehingga saya tidak perlu input satu per satu.
- **Acceptance Criteria**:
  - ✅ Given dosen dengan kelas aktif, when upload CSV nilai, then sistem validasi format dan constraint (nilai A-E, angka 0-100)
  - ✅ Given upload successful, when preview, then dosen review semua nilai sebelum final submit
  - ✅ Given final submit, when proses, then sistem kirim notifikasi ke mahasiswa dan update KHS real-time

**Story 2**: Sebagai dosen, saya ingin melihat jadwal mengajar saya dalam satu dashboard sehingga saya tidak bentrok dengan jadwal lain.
- **Acceptance Criteria**:
  - ✅ Given dosen login, when akses dashboard, then tampil kalender mingguan dengan semua kelas yang diampu
  - ✅ Given jadwal bentrok (double booking), when terjadi, then sistem alert dan suggest perubahan
  - ✅ Given jadwal berubah (reschedule), when admin update, then dosen terima notifikasi via email

### Persona 3: Admin Akademik (Rina, Staff Akademik)

**Profil**:
- Usia 35 tahun, admin akademik fakultas dengan 8 tahun pengalaman
- Bertanggung jawab untuk KRS approval, penjadwalan, dan pelaporan
- Handle komplain mahasiswa dan dosen terkait sistem akademik
- Pressure tinggi saat periode registrasi dan pelaporan PDDIKTI

**Core User Stories**:

**Story 1**: Sebagai admin, saya ingin approve KRS mahasiswa secara batch sehingga saya tidak perlu approve satu per satu untuk 500+ mahasiswa.
- **Acceptance Criteria**:
  - ✅ Given list KRS pending approval, when filter berdasarkan criteria (prodi, semester), then tampil filtered list
  - ✅ Given bulk select KRS yang valid, when approve batch, then proses < 5s untuk 100 KRS
  - ✅ Given KRS ada isu (SKS over, prerequisite tidak meet), when review, then sistem highlight issue dengan keterangan jelas

**Story 2**: Sebagai admin, saya ingin generate laporan PDDIKTI otomatis sehingga saya tidak perlu compile data manual dari berbagai sumber.
- **Acceptance Criteria**:
  - ✅ Given periode pelaporan, when trigger PDDIKTI report, then sistem aggregate data dari semua service (mahasiswa, dosen, nilai, kurikulum)
  - ✅ Given report generated, when download, then format sesuai spesifikasi PDDIKTI (XML/JSON schema valid)
  - ✅ Given data validation, when check, then sistem tampilkan error/warning sebelum submit ke PDDIKTI

### Persona 4: Pimpinan (Prof. Ahmad, Dekan Fakultas)

**Profil**:
- Usia 55 tahun, akademisi senior dan decision maker
- Butuh insights data untuk strategic planning
- Tidak mengoperasikan sistem secara detail, butuh summary dan dashboard executive
- Focus pada akreditasi, peningkatan mutu, dan compliance

**Core User Stories**:

**Story 1**: Sebagai pimpinan, saya ingin melihat dashboard KPI akademik fakultas sehingga saya bisa monitor performa dan identifikasi area improvement.
- **Acceptance Criteria**:
  - ✅ Given pimpinan login, when akses dashboard, then tampil KPI utama: IPK rata-rata, tingkat kelulusan tepat waktu, rasio dosen:mahasiswa, distribusi nilai per prodi
  - ✅ Given filter berdasarkan prodi/periode, when apply, then dashboard update real-time
  - ✅ Given trend historical, when view, then tampil visualization (charts) 3 tahun terakhir

**Story 2**: Sebagai pimpinan, saya ingin export data akademik untuk keperluan akreditasi sehingga saya memiliki evidence-based documentation.
- **Acceptance Criteria**:
  - ✅ Given request export, when specify criteria (periode, prodi, metrics), then sistem generate comprehensive report dalam format PDF/Excel
  - ✅ Given report, when review, then include semua mandatory fields untuk borang akreditasi BAN-PT

---

## 5. Technical Considerations untuk Microservice Architecture

### 5.1 Technology Stack

**Backend Services**:
- **Language**: Node.js (TypeScript) atau Go untuk high-performance services
- **Framework**: Express.js / Fastify (Node.js) atau Gin (Go)
- **API Documentation**: OpenAPI 3.0 (Swagger)
- **Validation**: Joi / Zod (TypeScript) atau validator library

**Database Layer**:
- **Primary Database**: PostgreSQL 15+ untuk relational data
- **Caching**: Redis untuk session, rate limiting, real-time data
- **Search**: Elasticsearch untuk full-text search (transkrip, mata kuliah)
- **Analytics**: TimescaleDB atau ClickHouse untuk time-series metrics

**Message Queue & Event Streaming**:
- **Option A**: RabbitMQ (proven, simpler untuk start)
- **Option B**: Apache Kafka (scalable, untuk high-throughput events)
- **Option C**: Redis Streams (lightweight, jika already using Redis)

**API Gateway**:
- **Option A**: Kong Gateway (open-source, plugin ecosystem)
- **Option B**: Traefik (cloud-native, easy Docker integration)
- **Option C**: Custom BFF (Backend-for-Frontend) dengan Express.js

**Authentication & Authorization**:
- **Auth Protocol**: OAuth 2.0 + JWT
- **Identity Provider**: Keycloak (self-hosted) atau Auth0/Clerk (managed)
- **RBAC**: Role-Based Access Control (mahasiswa, dosen, admin, pimpinan)
- **SSO**: Support LDAP/Active Directory untuk institusi yang sudah punya

**Infrastructure**:
- **Containerization**: Docker + Docker Compose (dev), Kubernetes (production)
- **Orchestration**: Kubernetes (K8s) untuk auto-scaling dan service mesh
- **Service Mesh**: Istio atau Linkerd (optional, untuk advanced observability)
- **Load Balancer**: Nginx atau HAProxy

**Observability**:
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana) atau Loki + Grafana
- **Monitoring**: Prometheus + Grafana
- **Tracing**: Jaeger atau Zipkin untuk distributed tracing
- **APM**: New Relic atau Datadog (managed) atau Elastic APM (self-hosted)

**CI/CD**:
- **Version Control**: Git + GitHub/GitLab
- **CI/CD Pipeline**: GitHub Actions / GitLab CI / Jenkins
- **Container Registry**: Docker Hub / Harbor (self-hosted) / AWS ECR
- **Deployment**: GitOps dengan ArgoCD atau FluxCD

### 5.2 Data Consistency Patterns

**Challenge**: Microservice architecture with separate databases introduces eventual consistency challenges.

**Strategies**:

1. **Saga Pattern untuk Distributed Transactions**:
   - Contoh: KRS registration melibatkan KRS Service, Jadwal Service (check kapasitas), dan Mahasiswa Service (validate student status)
   - Implementasi: Choreography-based saga dengan event sourcing
   - Rollback: Compensating transactions jika ada step yang gagal

2. **Event Sourcing**:
   - Store events (KRS.Created, KRS.Approved, KRS.Cancelled) sebagai immutable log
   - Rebuild state dari event stream
   - Benefit: Audit trail lengkap, temporal queries

3. **CQRS (Command Query Responsibility Segregation)**:
   - Separate write model (command) dan read model (query)
   - Write: Normalized database per service
   - Read: Denormalized views (materialized views atau separate read database)
   - Contoh: Transkrip Service membaca dari denormalized view yang aggregate dari KHS, Mahasiswa, Kurikulum

### 5.3 Inter-Service Communication

**Synchronous (REST API)**:
- Direct service-to-service calls untuk immediate response needed
- Contoh: KRS Service → Jadwal Service (check class capacity real-time)
- Risk: Coupling, cascading failures

**Asynchronous (Event-Driven)**:
- Services publish events to message queue
- Other services subscribe to relevant events
- Contoh: KHS Service publishes `GradeUpdated` event → Transkrip Service subscribes dan update transcript cache
- Benefit: Loose coupling, resilience, scalability

**Hybrid Approach**:
- Use sync untuk critical path (user-facing operations)
- Use async untuk background processes (notifications, reporting, analytics)

### 5.4 Service Discovery & Configuration

**Service Registry**:
- Consul, Eureka, atau Kubernetes built-in service discovery
- Services register themselves on startup
- API Gateway queries registry untuk routing

**Configuration Management**:
- Centralized config: Consul KV, etcd, atau Kubernetes ConfigMaps/Secrets
- Environment-specific configs (dev, staging, prod)
- Feature flags untuk gradual rollout

### 5.5 Scalability Considerations

**Horizontal Scaling**:
- Stateless services: Easy to replicate behind load balancer
- Stateful services (e.g., session): Use Redis untuk shared state

**Database Scaling**:
- Read replicas untuk read-heavy services (Reporting, Transkrip)
- Connection pooling (PgBouncer untuk PostgreSQL)
- Database sharding jika single instance jadi bottleneck (future consideration)

**Caching Strategy**:
- **L1 Cache**: In-memory cache per service instance
- **L2 Cache**: Shared Redis cache
- **CDN**: Static assets dan public pages
- TTL strategy: Short TTL untuk data yang sering berubah (jadwal, nilai), longer TTL untuk master data (mata kuliah, prodi)

**Peak Load Handling**:
- Auto-scaling policies (CPU/memory threshold atau queue depth)
- Rate limiting per user/IP untuk prevent abuse
- Queue-based request handling untuk KRS registration (virtual waiting room)

### 5.6 Security Considerations

**API Security**:
- HTTPS/TLS untuk all communication
- API Gateway handles authentication
- JWT tokens dengan short expiry (15 min access token, 7 day refresh token)
- Rate limiting dan throttling

**Authorization**:
- Fine-grained RBAC di setiap service
- Permission matrix:
  - Mahasiswa: Read own KRS/KHS/Transkrip, Write KRS (during registration period)
  - Dosen: Read assigned class roster, Write grades untuk assigned classes only
  - Admin: CRUD operations untuk assigned prodi/fakultas
  - Pimpinan: Read-only aggregate reports untuk assigned organizational unit

**Data Privacy**:
- PII (Personally Identifiable Information) encryption at rest
- Audit logging untuk sensitive operations (grade changes, student data access)
- GDPR/local privacy compliance (data retention policy, right to delete)

**Dependency Security**:
- Regular dependency scanning (Snyk, Dependabot)
- Container image scanning (Trivy, Clair)
- Secrets management (Vault, Kubernetes Secrets dengan encryption)

### 5.7 Failure Scenarios & Resilience

**Circuit Breaker Pattern**:
- Prevent cascading failures
- Jika downstream service down, circuit breaker trips dan return fallback response
- Implementation: Hystrix, resilience4j, atau Opossum (Node.js)

**Retry Logic**:
- Exponential backoff untuk transient failures
- Idempotency keys untuk prevent duplicate operations

**Fallback Strategies**:
- Stale data dari cache jika primary service down
- Degraded mode: Disable non-critical features untuk maintain core functionality

**Disaster Recovery**:
- Database backups (automated daily + WAL archiving untuk PostgreSQL)
- Multi-region deployment (optional, untuk critical uptime)
- RTO (Recovery Time Objective): < 4 hours
- RPO (Recovery Point Objective): < 15 minutes

---

## 6. API Contract Antar Service

### 6.1 API Design Principles

- **RESTful conventions**: Standard HTTP methods (GET, POST, PUT, DELETE, PATCH)
- **Versioning**: URL-based (`/api/v1/...`) atau header-based (`Accept: application/vnd.api.v1+json`)
- **Pagination**: Cursor-based untuk large datasets, limit/offset untuk simple cases
- **Filtering & Sorting**: Query parameters (`?prodi=TI&semester=5&sort=-created_at`)
- **Error Format**: Consistent error response structure dengan error codes
- **Rate Limiting**: Headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`)

### 6.2 Core API Contracts

#### Mahasiswa Service API

```
# Get Mahasiswa Profile
GET /api/v1/mahasiswa/{nim}
Response: {
  "nim": "1234567890",
  "nama": "Budi Santoso",
  "email": "budi@example.com",
  "prodi_id": "TI-001",
  "angkatan": "2021",
  "status": "AKTIF",
  "ipk_kumulatif": 3.45,
  "total_sks": 110
}

# Update Mahasiswa Status
PATCH /api/v1/mahasiswa/{nim}/status
Request: { "status": "CUTI", "reason": "Sakit", "start_date": "2026-09-01" }

# Search Mahasiswa
GET /api/v1/mahasiswa?prodi=TI-001&angkatan=2021&status=AKTIF&limit=50
```

#### Dosen Service API

```
# Get Dosen Profile
GET /api/v1/dosen/{nidn}
Response: {
  "nidn": "0101018801",
  "nama": "Dr. Siti Aminah, M.Kom",
  "email": "siti@example.com",
  "prodi_id": "TI-001",
  "jabatan_akademik": "Lektor Kepala",
  "status": "AKTIF"
}

# Get Teaching Load
GET /api/v1/dosen/{nidn}/teaching-load?semester=20262
Response: {
  "dosen_nidn": "0101018801",
  "semester": "20262",
  "total_sks": 12,
  "mata_kuliah": [
    {
      "kode_mk": "TIF301",
      "nama_mk": "Basis Data",
      "sks": 3,
      "kelas": "A",
      "jumlah_mahasiswa": 42
    }
  ]
}
```

#### Akademik Structure Service API

```
# Get Prodi Details
GET /api/v1/prodi/{prodi_id}
Response: {
  "prodi_id": "TI-001",
  "nama": "Teknik Informatika",
  "jenjang": "S1",
  "jurusan_id": "JTK-01",
  "jurusan_nama": "Jurusan Teknik Komputer",
  "fakultas_id": "FT-01",
  "fakultas_nama": "Fakultas Teknik",
  "akreditasi": "A",
  "status": "AKTIF"
}

# Get Academic Periods
GET /api/v1/academic-periods?active=true
Response: {
  "items": [
    {
      "periode_id": "20262",
      "semester": "GENAP",
      "tahun_akademik": "2026/2027",
      "status": "AKTIF",
      "krs_start": "2026-08-15",
      "krs_end": "2026-09-05",
      "kuliah_start": "2026-09-10",
      "kuliah_end": "2027-01-15"
    }
  ]
}
```

#### Kurikulum Service API

```
# Get Kurikulum by Prodi
GET /api/v1/kurikulum?prodi_id=TI-001&tahun=2022
Response: {
  "kurikulum_id": "KURIKULUM-TI-2022",
  "prodi_id": "TI-001",
  "nama": "Kurikulum TI 2022",
  "tahun_berlaku": 2022,
  "total_sks": 144,
  "status": "AKTIF"
}

# Get Mata Kuliah Detail
GET /api/v1/mata-kuliah/{kode_mk}
Response: {
  "kode_mk": "TIF301",
  "nama": "Basis Data",
  "sks": 3,
  "semester": 3,
  "jenis": "WAJIB",
  "prasyarat": ["TIF201"],
  "deskripsi": "Mata kuliah ini membahas konsep...",
  "cpmk": ["Mahasiswa mampu merancang database..."]
}

# Check Prerequisites
POST /api/v1/mata-kuliah/{kode_mk}/check-prerequisite
Request: { "nim": "1234567890" }
Response: { "eligible": true, "unmet_prerequisites": [] }
```

#### Jadwal Service API

```
# Get Jadwal by Semester
GET /api/v1/jadwal?semester=20262&prodi=TI-001
Response: {
  "items": [
    {
      "jadwal_id": "JDW-001",
      "kode_mk": "TIF301",
      "nama_mk": "Basis Data",
      "kelas": "A",
      "sks": 3,
      "dosen_nidn": "0101018801",
      "dosen_nama": "Dr. Siti Aminah, M.Kom",
      "hari": "SENIN",
      "jam_mulai": "08:00",
      "jam_selesai": "10:30",
      "ruang": "Lab 201",
      "kapasitas": 50,
      "terisi": 42,
      "status": "TERSEDIA"
    }
  ]
}

# Reserve Seat (called by KRS Service)
POST /api/v1/jadwal/{jadwal_id}/reserve
Request: { "nim": "1234567890", "request_id": "uuid-idempotency-key" }
Response: { "reserved": true, "expires_at": "2026-09-03T10:15:00Z" }

# Check Conflict
POST /api/v1/jadwal/check-conflict
Request: { "jadwal_ids": ["JDW-001", "JDW-002", "JDW-003"] }
Response: { "has_conflict": false, "conflicts": [] }
```

#### KRS Service API

```
# Get KRS by Mahasiswa
GET /api/v1/krs?nim=1234567890&semester=20262
Response: {
  "krs_id": "KRS-2026-1234567890",
  "nim": "1234567890",
  "semester": "20262",
  "status": "APPROVED",
  "total_sks": 21,
  "items": [
    {
      "jadwal_id": "JDW-001",
      "kode_mk": "TIF301",
      "nama_mk": "Basis Data",
      "sks": 3,
      "kelas": "A"
    }
  ],
  "created_at": "2026-08-16T09:30:00Z",
  "approved_at": "2026-08-20T14:00:00Z",
  "approved_by": "admin-akademik-01"
}

# Submit KRS
POST /api/v1/krs
Request: {
  "nim": "1234567890",
  "semester": "20262",
  "jadwal_ids": ["JDW-001", "JDW-002", "JDW-003"]
}
Response: {
  "krs_id": "KRS-2026-1234567890",
  "status": "PENDING_APPROVAL",
  "validation_result": {
    "valid": true,
    "total_sks": 21,
    "warnings": ["Total SKS mendekati batas maksimum (24 SKS)"]
  }
}

# Approve KRS (Admin)
POST /api/v1/krs/{krs_id}/approve
Request: { "approved_by": "admin-akademik-01", "notes": "Approved" }
```

#### KHS Service API

```
# Get KHS by Mahasiswa & Semester
GET /api/v1/khs?nim=1234567890&semester=20261
Response: {
  "khs_id": "KHS-20261-1234567890",
  "nim": "1234567890",
  "semester": "20261",
  "items": [
    {
      "kode_mk": "TIF201",
      "nama_mk": "Struktur Data",
      "sks": 3,
      "nilai_huruf": "A",
      "nilai_angka": 4.0,
      "dosen_nidn": "0101018801"
    }
  ],
  "ip_semester": 3.65,
  "ipk_kumulatif": 3.45,
  "total_sks_semester": 21,
  "total_sks_kumulatif": 110,
  "status": "FINALIZED"
}

# Input Nilai (Dosen)
POST /api/v1/nilai/batch
Request: {
  "jadwal_id": "JDW-001",
  "dosen_nidn": "0101018801",
  "nilai": [
    { "nim": "1234567890", "nilai_angka": 85, "nilai_huruf": "A" },
    { "nim": "1234567891", "nilai_angka": 78, "nilai_huruf": "B+" }
  ]
}

# Finalize KHS (Admin - after all grades entered)
POST /api/v1/khs/{khs_id}/finalize
Request: { "finalized_by": "admin-akademik-01" }
```

#### Transkrip Service API

```
# Get Transkrip
GET /api/v1/transkrip/{nim}
Response: {
  "nim": "1234567890",
  "nama": "Budi Santoso",
  "prodi": "Teknik Informatika",
  "angkatan": "2021",
  "ipk": 3.45,
  "total_sks": 144,
  "status_kelulusan": "LULUS",
  "tanggal_lulus": "2025-08-30",
  "predikat": "Cum Laude",
  "mata_kuliah": [
    {
      "semester": 1,
      "kode_mk": "TIF101",
      "nama_mk": "Pengantar Informatika",
      "sks": 3,
      "nilai": "A"
    }
  ]
}

# Check Graduation Requirements
GET /api/v1/transkrip/{nim}/graduation-check
Response: {
  "eligible": true,
  "requirements": {
    "total_sks": { "required": 144, "completed": 144, "met": true },
    "ipk_minimum": { "required": 2.0, "current": 3.45, "met": true },
    "mandatory_courses": { "required": 30, "completed": 30, "met": true }
  }
}

# Generate Transcript PDF
POST /api/v1/transkrip/{nim}/generate-pdf
Response: {
  "pdf_url": "https://storage.example.com/transcripts/1234567890.pdf",
  "generated_at": "2026-09-03T10:00:00Z",
  "expires_at": "2026-09-10T10:00:00Z"
}
```

#### Reporting Service API

```
# Generate PDDIKTI Report
POST /api/v1/reports/pddikti
Request: {
  "type": "MAHASISWA",
  "semester": "20262",
  "prodi_id": "TI-001"
}
Response: {
  "report_id": "REPORT-PDDIKTI-20262-001",
  "status": "PROCESSING",
  "estimated_completion": "2026-09-03T10:30:00Z"
}

# Get Report Status
GET /api/v1/reports/{report_id}
Response: {
  "report_id": "REPORT-PDDIKTI-20262-001",
  "status": "COMPLETED",
  "download_url": "https://storage.example.com/reports/pddikti-20262-001.xml",
  "validation_result": {
    "valid": true,
    "errors": [],
    "warnings": []
  }
}

# Get KPI Dashboard
GET /api/v1/analytics/kpi?prodi=TI-001&periode=20262
Response: {
  "prodi_id": "TI-001",
  "periode": "20262",
  "metrics": {
    "total_mahasiswa_aktif": 850,
    "ipk_rata_rata": 3.12,
    "tingkat_kelulusan_tepat_waktu": 0.68,
    "rasio_dosen_mahasiswa": 18.5,
    "distribusi_nilai": {
      "A": 0.25,
      "B": 0.40,
      "C": 0.28,
      "D": 0.05,
      "E": 0.02
    }
  }
}
```

### 6.3 Event Contracts (Async Communication)

```
# Event: StudentEnrolled
{
  "event_type": "student.enrolled",
  "event_id": "uuid",
  "timestamp": "2026-09-03T10:00:00Z",
  "data": {
    "nim": "1234567890",
    "prodi_id": "TI-001",
    "angkatan": "2026"
  }
}

# Event: KRSSubmitted
{
  "event_type": "krs.submitted",
  "event_id": "uuid",
  "timestamp": "2026-08-16T09:30:00Z",
  "data": {
    "krs_id": "KRS-2026-1234567890",
    "nim": "1234567890",
    "semester": "20262",
    "jadwal_ids": ["JDW-001", "JDW-002"]
  }
}

# Event: KRSApproved
{
  "event_type": "krs.approved",
  "event_id": "uuid",
  "timestamp": "2026-08-20T14:00:00Z",
  "data": {
    "krs_id": "KRS-2026-1234567890",
    "nim": "1234567890",
    "approved_by": "admin-akademik-01"
  }
}

# Event: GradeUpdated
{
  "event_type": "grade.updated",
  "event_id": "uuid",
  "timestamp": "2027-01-20T16:00:00Z",
  "data": {
    "nim": "1234567890",
    "kode_mk": "TIF301",
    "semester": "20262",
    "nilai_huruf": "A",
    "nilai_angka": 4.0,
    "updated_by": "dosen-0101018801"
  }
}

# Event: KHSFinalized
{
  "event_type": "khs.finalized",
  "event_id": "uuid",
  "timestamp": "2027-01-25T10:00:00Z",
  "data": {
    "khs_id": "KHS-20262-1234567890",
    "nim": "1234567890",
    "semester": "20262",
    "ip_semester": 3.65,
    "ipk_kumulatif": 3.45
  }
}
```

---

## 7. Data Model untuk Setiap Service

### 7.1 Mahasiswa Service - Data Model

```sql
-- Table: mahasiswa
CREATE TABLE mahasiswa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nim VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  no_hp VARCHAR(20),
  tanggal_lahir DATE NOT NULL,
  jenis_kelamin ENUM('L', 'P') NOT NULL,
  prodi_id VARCHAR(50) NOT NULL, -- Foreign key to Akademik Structure Service
  angkatan VARCHAR(4) NOT NULL,
  jalur_masuk ENUM('SNMPTN', 'SBMPTN', 'MANDIRI') NOT NULL,
  status ENUM('AKTIF', 'CUTI', 'NON_AKTIF', 'LULUS', 'DO') NOT NULL DEFAULT 'AKTIF',
  tanggal_masuk DATE NOT NULL,
  tanggal_lulus DATE,
  ipk_kumulatif DECIMAL(3,2) DEFAULT 0.00,
  total_sks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_mahasiswa_prodi ON mahasiswa(prodi_id);
CREATE INDEX idx_mahasiswa_angkatan ON mahasiswa(angkatan);
CREATE INDEX idx_mahasiswa_status ON mahasiswa(status);

-- Table: mahasiswa_status_history
CREATE TABLE mahasiswa_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mahasiswa_id UUID REFERENCES mahasiswa(id),
  status_before VARCHAR(20),
  status_after VARCHAR(20) NOT NULL,
  reason TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  changed_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 7.2 Dosen Service - Data Model

```sql
-- Table: dosen
CREATE TABLE dosen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nidn VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  no_hp VARCHAR(20),
  tanggal_lahir DATE NOT NULL,
  jenis_kelamin ENUM('L', 'P') NOT NULL,
  prodi_id VARCHAR(50) NOT NULL,
  jabatan_akademik ENUM('ASISTEN_AHLI', 'LEKTOR', 'LEKTOR_KEPALA', 'GURU_BESAR') NOT NULL,
  pendidikan_terakhir ENUM('S2', 'S3') NOT NULL,
  bidang_keahlian VARCHAR(255),
  status ENUM('AKTIF', 'NON_AKTIF', 'PENSIUN') NOT NULL DEFAULT 'AKTIF',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: teaching_assignment (relasi dosen dengan jadwal mengajar)
CREATE TABLE teaching_assignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dosen_id UUID REFERENCES dosen(id),
  jadwal_id VARCHAR(50) NOT NULL, -- Foreign key to Jadwal Service
  semester VARCHAR(10) NOT NULL,
  status ENUM('ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_teaching_assignment_dosen ON teaching_assignment(dosen_id);
CREATE INDEX idx_teaching_assignment_semester ON teaching_assignment(semester);
```

### 7.3 Akademik Structure Service - Data Model

```sql
-- Table: fakultas
CREATE TABLE fakultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fakultas_id VARCHAR(50) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  dekan_nidn VARCHAR(20),
  status ENUM('AKTIF', 'NON_AKTIF') DEFAULT 'AKTIF',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: jurusan
CREATE TABLE jurusan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurusan_id VARCHAR(50) UNIQUE NOT NULL,
  fakultas_id VARCHAR(50) REFERENCES fakultas(fakultas_id),
  nama VARCHAR(255) NOT NULL,
  ketua_jurusan_nidn VARCHAR(20),
  status ENUM('AKTIF', 'NON_AKTIF') DEFAULT 'AKTIF',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: prodi (program studi)
CREATE TABLE prodi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prodi_id VARCHAR(50) UNIQUE NOT NULL,
  jurusan_id VARCHAR(50) REFERENCES jurusan(jurusan_id),
  nama VARCHAR(255) NOT NULL,
  jenjang ENUM('D3', 'D4', 'S1', 'S2', 'S3') NOT NULL,
  kaprodi_nidn VARCHAR(20),
  akreditasi ENUM('A', 'B', 'C', 'Unggul', 'Baik Sekali', 'Baik') NOT NULL,
  status ENUM('AKTIF', 'NON_AKTIF') DEFAULT 'AKTIF',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: academic_period
CREATE TABLE academic_period (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periode_id VARCHAR(10) UNIQUE NOT NULL, -- Format: YYYYS (e.g., 20262 = 2026 Genap)
  semester ENUM('GANJIL', 'GENAP') NOT NULL,
  tahun_akademik VARCHAR(9) NOT NULL, -- Format: 2026/2027
  status ENUM('PLANNING', 'AKTIF', 'COMPLETED') NOT NULL,
  krs_start_date DATE NOT NULL,
  krs_end_date DATE NOT NULL,
  perkuliahan_start_date DATE NOT NULL,
  perkuliahan_end_date DATE NOT NULL,
  uts_start_date DATE,
  uts_end_date DATE,
  uas_start_date DATE,
  uas_end_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 7.4 Kurikulum Service - Data Model

```sql
-- Table: kurikulum
CREATE TABLE kurikulum (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kurikulum_id VARCHAR(50) UNIQUE NOT NULL,
  prodi_id VARCHAR(50) NOT NULL,
  nama VARCHAR(255) NOT NULL,
  tahun_berlaku INTEGER NOT NULL,
  total_sks INTEGER NOT NULL,
  status ENUM('DRAFT', 'AKTIF', 'NON_AKTIF') DEFAULT 'DRAFT',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: mata_kuliah
CREATE TABLE mata_kuliah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_mk VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  nama_inggris VARCHAR(255),
  sks INTEGER NOT NULL CHECK (sks > 0),
  semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 14),
  jenis ENUM('WAJIB', 'PILIHAN', 'MKWU') NOT NULL, -- MKWU = Mata Kuliah Wajib Umum
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: kurikulum_mata_kuliah (many-to-many)
CREATE TABLE kurikulum_mata_kuliah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kurikulum_id VARCHAR(50) REFERENCES kurikulum(kurikulum_id),
  mata_kuliah_kode VARCHAR(20) REFERENCES mata_kuliah(kode_mk),
  semester_ideal INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(kurikulum_id, mata_kuliah_kode)
);

-- Table: prerequisite
CREATE TABLE prerequisite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mata_kuliah_kode VARCHAR(20) REFERENCES mata_kuliah(kode_mk),
  prasyarat_kode VARCHAR(20) REFERENCES mata_kuliah(kode_mk),
  jenis ENUM('PREREQUISITE', 'COREQUISITE') DEFAULT 'PREREQUISITE',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(mata_kuliah_kode, prasyarat_kode)
);

-- Table: cpmk (Capaian Pembelajaran Mata Kuliah)
CREATE TABLE cpmk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mata_kuliah_kode VARCHAR(20) REFERENCES mata_kuliah(kode_mk),
  kode_cpmk VARCHAR(10) NOT NULL,
  deskripsi TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 7.5 Jadwal Service - Data Model

```sql
-- Table: ruang
CREATE TABLE ruang (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_ruang VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  gedung VARCHAR(100),
  kapasitas INTEGER NOT NULL CHECK (kapasitas > 0),
  fasilitas TEXT[], -- Array of facilities: ['PROYEKTOR', 'AC', 'KOMPUTER']
  status ENUM('TERSEDIA', 'MAINTENANCE', 'NON_AKTIF') DEFAULT 'TERSEDIA',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: jadwal_kuliah
CREATE TABLE jadwal_kuliah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jadwal_id VARCHAR(50) UNIQUE NOT NULL,
  semester VARCHAR(10) NOT NULL,
  mata_kuliah_kode VARCHAR(20) NOT NULL, -- Reference to Kurikulum Service
  kelas VARCHAR(5) NOT NULL, -- A, B, C, etc.
  dosen_nidn VARCHAR(20) NOT NULL, -- Reference to Dosen Service
  ruang_kode VARCHAR(20) REFERENCES ruang(kode_ruang),
  hari ENUM('SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU') NOT NULL,
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  kapasitas INTEGER NOT NULL,
  terisi INTEGER DEFAULT 0,
  status ENUM('DRAFT', 'PUBLISHED', 'CANCELLED') DEFAULT 'DRAFT',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_terisi_not_exceed_kapasitas CHECK (terisi <= kapasitas)
);

CREATE INDEX idx_jadwal_semester ON jadwal_kuliah(semester);
CREATE INDEX idx_jadwal_mk ON jadwal_kuliah(mata_kuliah_kode);
CREATE INDEX idx_jadwal_dosen ON jadwal_kuliah(dosen_nidn);
CREATE INDEX idx_jadwal_ruang_hari ON jadwal_kuliah(ruang_kode, hari, jam_mulai);

-- Table: seat_reservation (untuk handle concurrent KRS registration)
CREATE TABLE seat_reservation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jadwal_id VARCHAR(50) REFERENCES jadwal_kuliah(jadwal_id),
  nim VARCHAR(20) NOT NULL,
  request_id VARCHAR(100) UNIQUE NOT NULL, -- Idempotency key
  status ENUM('RESERVED', 'CONFIRMED', 'EXPIRED', 'CANCELLED') DEFAULT 'RESERVED',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_seat_reservation_jadwal ON seat_reservation(jadwal_id);
CREATE INDEX idx_seat_reservation_nim ON seat_reservation(nim);
```

### 7.6 KRS Service - Data Model

```sql
-- Table: krs
CREATE TABLE krs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  krs_id VARCHAR(50) UNIQUE NOT NULL,
  nim VARCHAR(20) NOT NULL, -- Reference to Mahasiswa Service
  semester VARCHAR(10) NOT NULL,
  total_sks INTEGER DEFAULT 0,
  status ENUM('DRAFT', 'SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
  submitted_at TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by VARCHAR(100),
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(nim, semester)
);

CREATE INDEX idx_krs_nim ON krs(nim);
CREATE INDEX idx_krs_semester ON krs(semester);
CREATE INDEX idx_krs_status ON krs(status);

-- Table: krs_item
CREATE TABLE krs_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  krs_id VARCHAR(50) REFERENCES krs(krs_id),
  jadwal_id VARCHAR(50) NOT NULL, -- Reference to Jadwal Service
  mata_kuliah_kode VARCHAR(20) NOT NULL,
  sks INTEGER NOT NULL,
  kelas VARCHAR(5) NOT NULL,
  status ENUM('ACTIVE', 'DROPPED', 'COMPLETED') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(krs_id, jadwal_id)
);

CREATE INDEX idx_krs_item_krs ON krs_item(krs_id);

-- Table: krs_approval_log
CREATE TABLE krs_approval_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  krs_id VARCHAR(50) REFERENCES krs(krs_id),
  action ENUM('SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL,
  performed_by VARCHAR(100) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 7.7 KHS Service - Data Model

```sql
-- Table: khs
CREATE TABLE khs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  khs_id VARCHAR(50) UNIQUE NOT NULL,
  nim VARCHAR(20) NOT NULL, -- Reference to Mahasiswa Service
  semester VARCHAR(10) NOT NULL,
  ip_semester DECIMAL(3,2),
  ipk_kumulatif DECIMAL(3,2),
  total_sks_semester INTEGER DEFAULT 0,
  total_sks_kumulatif INTEGER DEFAULT 0,
  status ENUM('DRAFT', 'FINALIZED', 'LOCKED') DEFAULT 'DRAFT',
  finalized_at TIMESTAMP,
  finalized_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(nim, semester)
);

CREATE INDEX idx_khs_nim ON khs(nim);
CREATE INDEX idx_khs_semester ON khs(semester);

-- Table: nilai
CREATE TABLE nilai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nim VARCHAR(20) NOT NULL,
  semester VARCHAR(10) NOT NULL,
  mata_kuliah_kode VARCHAR(20) NOT NULL,
  jadwal_id VARCHAR(50) NOT NULL,
  dosen_nidn VARCHAR(20) NOT NULL,
  nilai_angka DECIMAL(5,2),
  nilai_huruf VARCHAR(2), -- A, A-, B+, B, B-, C+, C, D, E
  nilai_index DECIMAL(2,1), -- 4.0, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, 1.0, 0.0
  sks INTEGER NOT NULL,
  status ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'LOCKED') DEFAULT 'DRAFT',
  khs_id VARCHAR(50) REFERENCES khs(khs_id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(nim, semester, mata_kuliah_kode)
);

CREATE INDEX idx_nilai_nim ON nilai(nim);
CREATE INDEX idx_nilai_semester ON nilai(semester);
CREATE INDEX idx_nilai_mk ON nilai(mata_kuliah_kode);

-- Table: nilai_component (untuk komponen nilai: tugas, UTS, UAS)
CREATE TABLE nilai_component (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nilai_id UUID REFERENCES nilai(id),
  component_type VARCHAR(50) NOT NULL, -- 'TUGAS', 'QUIZ', 'UTS', 'UAS', 'PRAKTIKUM'
  component_weight DECIMAL(5,2) NOT NULL, -- Bobot dalam %
  component_score DECIMAL(5,2), -- Nilai komponen
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 7.8 Transkrip Service - Data Model

```sql
-- Table: transkrip
CREATE TABLE transkrip (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nim VARCHAR(20) UNIQUE NOT NULL, -- Reference to Mahasiswa Service
  ipk DECIMAL(3,2) NOT NULL,
  total_sks INTEGER NOT NULL,
  status_kelulusan ENUM('BELUM_LULUS', 'LULUS', 'DO') DEFAULT 'BELUM_LULUS',
  tanggal_lulus DATE,
  predikat ENUM('Cum Laude', 'Sangat Memuaskan', 'Memuaskan', 'Tidak Memuaskan'),
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: transkrip_item (denormalized untuk performance)
CREATE TABLE transkrip_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nim VARCHAR(20) REFERENCES transkrip(nim),
  semester INTEGER NOT NULL,
  semester_periode VARCHAR(10) NOT NULL,
  mata_kuliah_kode VARCHAR(20) NOT NULL,
  mata_kuliah_nama VARCHAR(255) NOT NULL,
  sks INTEGER NOT NULL,
  nilai_huruf VARCHAR(2) NOT NULL,
  nilai_index DECIMAL(2,1) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transkrip_item_nim ON transkrip_item(nim);

-- Table: graduation_requirement_check
CREATE TABLE graduation_requirement_check (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nim VARCHAR(20) REFERENCES transkrip(nim),
  requirement_type VARCHAR(100) NOT NULL, -- 'TOTAL_SKS', 'IPK_MINIMUM', 'MANDATORY_COURSES'
  required_value VARCHAR(50) NOT NULL,
  current_value VARCHAR(50) NOT NULL,
  is_met BOOLEAN NOT NULL,
  checked_at TIMESTAMP DEFAULT NOW()
);
```

### 7.9 Reporting Service - Data Model

```sql
-- Table: report_queue
CREATE TABLE report_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id VARCHAR(50) UNIQUE NOT NULL,
  report_type VARCHAR(100) NOT NULL, -- 'PDDIKTI_MAHASISWA', 'PDDIKTI_DOSEN', 'KPI_DASHBOARD'
  requested_by VARCHAR(100) NOT NULL,
  parameters JSONB NOT NULL, -- Report-specific parameters
  status ENUM('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'QUEUED',
  result_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_report_queue_status ON report_queue(status);
CREATE INDEX idx_report_queue_type ON report_queue(report_type);

-- Table: kpi_metrics (time-series data)
CREATE TABLE kpi_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prodi_id VARCHAR(50) NOT NULL,
  periode VARCHAR(10) NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  metadata JSONB,
  recorded_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(prodi_id, periode, metric_name)
);

CREATE INDEX idx_kpi_metrics_prodi_periode ON kpi_metrics(prodi_id, periode);

-- Table: pddikti_sync_log
CREATE TABLE pddikti_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_id VARCHAR(50) UNIQUE NOT NULL,
  sync_type VARCHAR(50) NOT NULL, -- 'MAHASISWA', 'DOSEN', 'NILAI', 'KURIKULUM'
  periode VARCHAR(10) NOT NULL,
  total_records INTEGER,
  success_records INTEGER,
  failed_records INTEGER,
  status ENUM('IN_PROGRESS', 'COMPLETED', 'FAILED') DEFAULT 'IN_PROGRESS',
  error_log TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

---

## 8. Referensi Sistem Sevima sebagai Benchmark

### 8.1 Sevima SIAKAD Cloud - Overview

**Source**: https://sevima.com/siakadcloud/

Sevima adalah vendor sistem akademik terbesar di Indonesia dengan **1,500+ institusi klien** (per 2023). SiAkad Cloud adalah produk SaaS flagship mereka.

**Key Features**:
- Cloud-based (multi-tenant SaaS)
- Terintegrasi penuh dengan PDDIKTI
- Coverage lengkap: admission, akademik, keuangan, alumni
- Support mobile app (iOS/Android)
- Compliance dengan standar BAN-PT dan regulasi Kemdikbudristek

### 8.2 Feature Comparison

| Feature Category | Sevima SIAKAD Cloud | SIAKAD Microservice (Our System) | Notes |
|-----------------|---------------------|----------------------------------|-------|
| **Architecture** | Monolith SaaS (proprietary) | Microservice (open architecture) | Kami prioritas modular & customizable |
| **PDDIKTI Integration** | Native, auto-sync | Batch export (MVP), API integration (roadmap) | Sevima advantage: maturity |
| **KRS Online** | ✅ Real-time | ✅ Real-time dengan queue system | Comparable |
| **Grade Entry** | ✅ Web + bulk upload | ✅ Web + bulk upload + API | Comparable |
| **Mobile App** | ✅ Native iOS/Android | ⚠️ Responsive web (MVP), native app (roadmap) | Sevima advantage |
| **Reporting** | ✅ 50+ pre-built reports | ⚠️ Core reports (MVP), custom via API | Sevima advantage: maturity |
| **Multi-campus** | ✅ Supported | ⚠️ Roadmap (via tenant isolation) | Sevima advantage |
| **Customization** | ❌ Limited (vendor-dependent) | ✅ Full control (open source potential) | **Our advantage** |
| **Cost Model** | Subscription (Rp 50-200 juta/tahun) | Open-source/self-hosted | **Our advantage** |
| **Deployment** | Managed SaaS only | Self-hosted, cloud, hybrid | **Our advantage** |

### 8.3 Lessons from Sevima

**What Sevima Does Well** (kita harus match):
1. **User Experience**: Clean, intuitive UI untuk non-technical users
2. **Reliability**: 99.9%+ uptime SLA (mereka invest heavily di infrastructure)
3. **Documentation**: Comprehensive training materials dan video tutorials
4. **Support**: Dedicated CS team dengan understanding tentang regulasi akademik Indonesia
5. **Compliance**: Always up-to-date dengan perubahan regulasi PDDIKTI

**Our Differentiation Strategy**:
1. **Open Architecture**: Institusi tidak terkunci dengan vendor
2. **Cost Efficiency**: Eliminasi biaya lisensi tahunan (TCO lebih rendah untuk long-term)
3. **Customization**: Institusi dapat customize sesuai unique workflow mereka
4. **Data Ownership**: Full control atas data institusi (penting untuk institusi dengan kebijakan data ketat)
5. **Integration Flexibility**: API-first design memudahkan integrasi dengan sistem existing (perpustakaan, LMS, keuangan)

### 8.4 Target Market Positioning

**Primary Target**:
- Institusi menengah (5,000-15,000 mahasiswa) yang butuh sistem modern tapi cost-conscious
- Institusi yang sudah ada IT team internal dan ingin kontrol penuh
- Perguruan tinggi baru yang membangun sistem dari zero

**Secondary Target**:
- Institusi besar yang ingin migrate dari sistem legacy vendor-locked
- Perguruan tinggi dengan workflow akademik unik yang tidak di-cover oleh sistem off-the-shelf

**Avoid**:
- Institusi sangat kecil (<500 mahasiswa) yang butuh managed service tanpa IT capacity
- Institusi yang prioritas zero-effort implementation (Sevima lebih cocok untuk mereka)

---

## 9. Implementation Phases & Roadmap

### Phase 1 — MVP Core Services (6 bulan)

**Goal**: Deliver minimal viable product untuk satu siklus akademik penuh

**Services to Build**:
- ✅ Mahasiswa Service (core profile management)
- ✅ Dosen Service (core profile management)
- ✅ Akademik Structure Service (fakultas, jurusan, prodi)
- ✅ Kurikulum Service (mata kuliah, prerequisite)
- ✅ Jadwal Service (basic scheduling, no conflict detection yet)
- ✅ KRS Service (registration, validation, approval)
- ✅ KHS Service (grade entry, GPA calculation)
- ⚠️ Transkrip Service (basic transcript view only)
- ⚠️ Reporting Service (minimal: KPI dashboard)

**Frontend**:
- Web responsive untuk mahasiswa, dosen, admin
- Basic dashboard untuk pimpinan

**Infrastructure**:
- Docker Compose untuk development
- Kubernetes deployment untuk production
- PostgreSQL + Redis
- RabbitMQ untuk async events

**Success Criteria**:
- Mahasiswa bisa submit KRS online
- Admin bisa approve KRS
- Dosen bisa input nilai
- Mahasiswa bisa lihat KHS
- System handle 1,000 concurrent users saat peak

### Phase 2 — Enhanced Features (3 bulan)

**New Features**:
- Jadwal conflict detection & optimization algorithm
- KRS waiting list & automatic seat allocation
- Notifikasi real-time (email, push notification)
- Transkrip PDF generation
- Advanced reporting (PDDIKTI export format)

**Infrastructure Enhancements**:
- Auto-scaling policies
- Distributed tracing (Jaeger)
- Enhanced monitoring dashboards

### Phase 3 — Scalability & Polish (3 bulan)

**Focus**:
- Performance optimization (query tuning, caching strategy)
- Mobile-responsive UI refinement
- Comprehensive documentation (user guide, API docs)
- Security audit & penetration testing
- Load testing untuk 10,000+ concurrent users

### Phase 4 — Advanced Features (Future)

- Native mobile app (iOS/Android)
- AI-powered: recommendation system untuk pemilihan mata kuliah
- Multi-campus/multi-tenant support
- Advanced analytics & predictive insights (risk of dropout, etc.)
- Integration marketplace (LMS, library systems, payment gateways)

---

## 10. Launch Plan

### Pre-Launch Checklist

**Engineering**:
- [ ] All core services deployed dan passing health checks
- [ ] Database migrations tested di staging environment
- [ ] Rollback procedures documented dan tested
- [ ] Load testing completed: 5,000 concurrent users
- [ ] Security audit completed (no P0/P1 vulnerabilities)

**Product**:
- [ ] User acceptance testing (UAT) dengan pilot institution
- [ ] Admin training materials prepared (video tutorials, written guides)
- [ ] FAQ document untuk common scenarios
- [ ] In-app help tooltips implemented

**Operations**:
- [ ] 24/7 on-call rotation scheduled untuk launch window
- [ ] Incident response runbook prepared
- [ ] Support ticket system ready (e.g., Zendesk, Freshdesk)
- [ ] Monitoring dashboards dengan alert thresholds configured

### Launch Strategy

**Pilot Phase** (1 institusi, 1 semester):
- Partner dengan institusi menengah (3,000-5,000 mahasiswa)
- Full support dari engineering team on-site
- Daily sync dengan admin akademik
- Hotfix window: 4-hour SLA untuk P0 bugs

**Beta Launch** (3-5 institusi, 1 semester):
- Expand to multiple institution profiles (teknik, sosial, kesehatan)
- Remote support dengan guaranteed response time
- Weekly feedback sessions

**General Availability** (Open to all):
- Public documentation dan open-source release (if applicable)
- Self-service onboarding
- Community support forum
- Paid support tier untuk institutions butuh SLA

### Success Metrics (Post-Launch)

| Timeframe | Metric | Target |
|-----------|--------|--------|
| **Week 1** | System uptime | > 99% |
| **Week 1** | P0 incidents | 0 |
| **Week 2** | KRS completion rate | > 90% mahasiswa |
| **Month 1** | Admin CSAT | > 4.0/5.0 |
| **Month 3** | Mahasiswa CSAT | > 4.0/5.0 |
| **Month 3** | Dosen adoption (input nilai via sistem) | > 80% |
| **Semester 1** | Zero-data-loss incidents | 100% |

---

## 11. Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| **PDDIKTI format changes** | High | High | Monitor PDDIKTI documentation, build abstraction layer untuk export format, maintain flexibility via config |
| **Peak load overwhelm (KRS period)** | Medium | High | Load testing sebelum launch, auto-scaling policies, queue-based registration, virtual waiting room |
| **Data migration issues** (untuk institutions migrate dari sistem lama) | High | High | Robust ETL pipeline, validation scripts, dry-run migrations, rollback plan |
| **User resistance to new system** | Medium | Medium | Comprehensive training, gradual rollout, in-app guidance, dedicated support team |
| **Microservice complexity** | Medium | Medium | Strong DevOps culture, comprehensive monitoring, documentation, incident response runbooks |
| **Vendor lock-in fears** (cloud provider) | Low | Medium | Multi-cloud compatibility, infrastructure-as-code (Terraform), avoid proprietary services where possible |
| **Security breach / data leak** | Low | Critical | Regular security audits, penetration testing, encryption at rest/transit, RBAC, audit logging, incident response plan |

---

## 12. Open Questions & Decisions Needed

**Pre-Development**:
- [ ] **Decision**: Primary programming language? (Node.js/TypeScript vs Go vs Python/FastAPI)
  - **Owner**: Engineering Lead
  - **Deadline**: Before sprint planning
  - **Consideration**: Team expertise, ecosystem maturity, performance requirements

- [ ] **Decision**: Message queue technology? (RabbitMQ vs Kafka vs Redis Streams)
  - **Owner**: System Architect
  - **Deadline**: Architecture review
  - **Consideration**: Scale requirements, operational complexity, team expertise

- [ ] **Decision**: Authentication provider? (Keycloak self-hosted vs Auth0/Clerk managed)
  - **Owner**: Security Engineer + Product Manager
  - **Deadline**: Before auth implementation
  - **Consideration**: Cost, compliance, LDAP integration requirement

**Pre-Launch**:
- [ ] **Question**: Bagaimana model pricing/licensing jika sistem ini di-commercialize?
  - **Owner**: Business Development
  - **Options**: Open-source + paid support vs proprietary dengan license tiers

- [ ] **Question**: Support untuk institusi multi-kampus di MVP atau roadmap?
  - **Owner**: Product Manager
  - **Impact**: Data model design (tenant isolation)

- [ ] **Question**: Standar SLA untuk pilot institutions?
  - **Owner**: Operations + Product
  - **Consider**: Uptime guarantee, response time, support hours

---

## 13. Appendix

### A. Glossary (Terminologi Akademik Indonesia)

- **PDDIKTI**: Pangkalan Data Pendidikan Tinggi — national higher education database maintained by Kemdikbudristek
- **SKS**: Satuan Kredit Semester — credit unit (typically 1 SKS = 170 minutes per week for one semester)
- **KRS**: Kartu Rencana Studi — study plan card (course registration)
- **KHS**: Kartu Hasil Studi — grade report card (semester grades)
- **IP**: Indeks Prestasi — GPA for one semester
- **IPK**: Indeks Prestasi Kumulatif — cumulative GPA
- **Prodi**: Program Studi — study program/major
- **NIDN**: Nomor Induk Dosen Nasional — national lecturer identification number
- **NIM**: Nomor Induk Mahasiswa — student identification number
- **BAN-PT**: Badan Akreditasi Nasional Perguruan Tinggi — national accreditation board
- **SN-Dikti**: Standar Nasional Pendidikan Tinggi — national higher education standards

### B. References

- Sevima SIAKAD Cloud: https://sevima.com/siakadcloud/
- PDDIKTI: https://pddikti.kemdikbud.go.id/
- Standar Nasional Pendidikan Tinggi (Permendikbud No. 3 Tahun 2020)
- Microservice Architecture Patterns: https://microservices.io/patterns/
- Domain-Driven Design (Eric Evans)
- Building Microservices (Sam Newman)

### C. Related Documentation

- [TECHNICAL_ARCHITECTURE.md] — Detail teknis arsitektur sistem
- [API_SPECIFICATION.md] — OpenAPI 3.0 specification untuk semua services
- [DEPLOYMENT_GUIDE.md] — Infrastructure setup dan deployment procedures
- [ONBOARDING_GUIDE.md] — User onboarding dan training materials
- [SECURITY_POLICY.md] — Security best practices dan compliance requirements

---

**Document End**

---

## Next Steps

1. **Review & Approval**: Stakeholder review meeting (Engineering Lead, System Architect, Product Owner)
2. **Technical Spike**: Week 1 — Prototype proof-of-concept untuk KRS registration flow end-to-end
3. **Architecture Deep Dive**: Finalize technology stack dan design detailed service contracts
4. **Sprint Planning**: Break down Phase 1 (MVP Core Services) into 2-week sprints
5. **Kickoff**: Development start

**Contact**: Product Manager SIAKAD (product@example.com)
