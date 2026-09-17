# SIMPEG USK 2027 Backend Architecture

## 1.3 System Overview

FastAPI backend for the SIMPEG USK 2027 system, supporting four core domains:
- **Pegawai** (employees)
- **Jabatan** (positions/departments)
- **Kehadiran** (attendance)
- **Gaji** (payroll)
- **Evaluasi** (performance reviews)
- **Pelatihan** (training)
- **BKN Sync** (external BKN integration)

Architecture follows **CQRS** (Command Query Responsibility Segregation) with event-driven BKN synchronization, Redis caching, and connection pooling.

## 1.4 Database Models (SQLAlchemy 2.0)

### Core Entities

| Table | Purpose | Key Columns |
|--------|---------|-------------|
| `simpeg_fillable.fill` | Employee records | `id`, `nip`, `nama`, `status_kepegawaian`, `is_active` |
| `simpeg_jabatan` | Positions/departments | `id`, `nama_jabatan`, `unit_kerja`, `level`, `parent_id` |
| `simpeg_kehadiran` | Attendance logs | `id`, `peg_id`, `tanggal`, `jam_masuk`, `jam_pulang`, `status` |
| `simpeg_gaji` | Payroll entries | `id`, `peg_id`, `periode`, `bruto`, `netto`, `status` |
| `simpeg_evaluasi` | Performance reviews | `id`, `peg_id`, `period`, `skor_kinerja`, `rekomendasi` |
| `simpeg_pelatihan` | Training catalog | `id`, `nama`, `penyelenggara`, `durasi_jam`, `biaya` |
| `simpeg_bkn` | BKN sync audit log | `id`, `entity`, `entity_id`, `direction`, `status` |

### Partitioning
- `kehadiran` partitioned by month (`dating` range) for time-series queries
- `fill` and `gaji` are relatively static and don't need partitioning

### Read Models (Denormalized)
- `simpeg_read.pegawai` – materialized employee view
- `simpeg_read.kehadiran_rekap` – daily/weekly attendance aggregates
- `simpeg_read.gaji_summary` – periodic payroll summaries

## 1.5 API Endpoints

### Resource Structure
All endpoints are prefixed with `/api/v1/` and follow REST conventions.

| Resource | Methods | Description |
|----------|---------|-------------|
| `pegawai` | GET, POST, PATCH, DELETE | Employee CRUD |
| `jabatan` | GET, POST, GET tree, PATCH | Position hierarchy |
| `kehadiran` | GET, POST, PATCH, bulk import | Attendance management |
| `gaji` | GET, POST, PATCH, approve, pay | Payroll lifecycle |
| `evaluasi` | GET, POST, PATCH, submit, approve | Performance reviews |
| `pelatihan` | GET, POST, PATCH, register | Training catalog & enrollment |
| `bkn` | POST push, POST pull, GET logs | External BKN integration |
| `health` | GET | Liveness probe |
| `ready` | GET | Readiness probe |
| `docs` | GET | OpenAPI specification |

### Filtering & Pagination
- Cursor-based pagination for large lists (`?cursor=x&limit=50`)
- Query filters: `status`, `unit_kerja`, `period`, `date range`
- Sorting by `created_at`, `date`, `peg_id`

## 2.5 CQRS Pattern

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Commands    │────▶│  Write Model │────▶│  Domain Events│
│  (POST/PATCH)│     │  (FastAPI)   │     │  (Redis Streams)│
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                │
                                                ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Queries     │◀────│  Read Models │◀────│  Event Bus   │
│  (GET)       │     │  (Materialized)│  │  (Celery)    │
└──────────────┘     └──────────────┘     └──────────────┘
```

- **Write side**: FastAPI routes validate input, emit domain events
- **Read side**: Asynchronous consumers update denormalized tables
- **Event bus**: Redis Streams for reliable event ordering
- **Idempotency**: Event IDs + dedup logic prevent duplicate syncs

## 3.6 Event-Driven BKN Sync

### Flow
1. Domain events (e.g., `PegawaiDibuat`, `GajiDisahkan`) are published to Redis Streams
2. Celery workers consume events via `bkn_push` queue
3. Workers call BKN API (SOAP/REST) to synchronize entities
4. Results logged to `simpeg_bnk.bkn_sync_log`
5. Success/Failure status tracked for retry/alerting

### Idempotency
- Each BKN entity has an `id` (UUID) and `status` (PENDING→SUCCESS/FAILED)
- `bkn_sync_log` tracks attempt count and error messages
- Max 3 retries with exponential backoff (60s, 120s, 240s)
- Dead-letter queue for persistent failures

## 4.7 Caching Strategy

| Layer | Technology | TTL | Invalidation |
|-------|------------|-----|--------------|
| L1 | In-process (FastAPI dependency) | 5–30 min | Manual / explicit |
| L2 | Redis (shared) | 1–60 min | Key-based (pattern match) |
| L3 | PostgreSQL | Permanent | Row-level updates |

**Cache-aside pattern** implemented via `cache` module:
- `get_or_set` for read paths
- Automatic invalidation on write events
- Structured logging of cache hits/misses

## 5.8 Connection Pooling

```python
# SQLAlchemy async engine configuration
engine = create_async_engine(
    DATABASE_URL,
    poolclass=AsyncAdaptedQueuePool,
    pool_size=20,
    max_overflow=30,
    pool_timeout=30,
    pool_recycle=3600,
    pool_pre_ping=True,
)
```

- Primary DB: 20 base connections + 30 overflow
- Read replica: 10 connections
- Celery workers: 5 connections each
- Total: ~70 connections (well under PostgreSQL 300 limit)

## 6.9 Middleware Stack

| Order | Middleware | Purpose |
|-------|------------|----------|
| 1 | `CORSMiddleware` | CORS, origin whitelist |
| 2 | `TrustedHostMiddleware` | Host validation |
| 3 | `AuthenticationMiddleware` | JWT validation, principal extraction |
| 4 | `RateLimitMiddleware` | Sliding window per user |
| 5 | `AuditMiddleware` | Structured audit log |
| 6 | `RequestLoggingMiddleware` | Request tracing with `X-Request-ID` |
| 7 | `ExceptionMiddleware` | Centralized error responses |

## 10.11 Logging

- **Structured logging** via `structlog` (JSON format)
- **Log levels**: DEBUG (dev), INFO (business events), WARN (recoverable), ERROR (failed ops), CRITICAL (service down)
- **Audit trail**: Immutable `simpeg_audit.audit_log` table
- **Metrics**: Prometheus counters for requests, DB connections, cache hits

## 12.13 OpenAPI Specification

Generated automatically from FastAPI app. Contains:
- Full endpoint definitions with request/response schemas
- Security schemes (`BearerAuth`)
- Pagination parameters (`cursor`, `limit`)
- Rate limit annotations

## 14.15 Deployment Checklist

- [ ] PostgreSQL 16 cluster (max_connections ≥ 300)
- [ ] Redis cluster (3 nodes, sentinel)
- [ ] Docker image built & pushed
- [ ] Kubernetes namespace with secrets (JWT, BKN API key, DB creds)
- [ ] HPA: min 3, max 10 API pods
- [ ] Celery workers: min 2, max 8 (scale on queue length)
- [ ] Prometheus + Grafana dashboards
- [ ] Loki + Promtail for log aggregation
- [ ] Alert rules: error rate, DB exhaustion, BKN sync failures
- [ ] SSL/TLS (Let's Encrypt for API domain)
- [ ] Security scan (Snyk/Dependabot) enabled
- [ ] CI/CD pipeline: build → test → deploy

## 16.16 Testing Strategy

- **E2E** (~2%): Playwright browser tests
- **Integration** (~15%): TestClient + real PostgreSQL
- **Unit** (~83%): Pydantic models, domain services, middleware

Each endpoint includes:
- Happy-path test
- Negative test (invalid input, missing auth)
- Concurrency stress (multiple simultaneous writes)

---

*Architecture document generated for SIMPEG USK 2027.*
*Stack: FastAPI + SQLAlchemy 2.0 + PostgreSQL + Alembic + Pydantic v2 + Redis + Celery*
