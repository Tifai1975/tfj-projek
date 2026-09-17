# ORARI Aceh Besar — Technical Blueprint

> File ini adalah **source of truth** teknis untuk AI agent. Jangan edit manual tanpa update kedua state (backend + frontend). Semua konteks arsitektur, database, routing, dan keputusan teknis ada di sini.

---

## 1. IDENTITAS PROYEK

| Atribut          | Nilai                                                  |
| ---------------- | ------------------------------------------------------ |
| Nama             | ORARI Aceh Besar Web Portal                            |
| Direktori        | `/Users/tfj/Documents/Projek Hermes/ORLOK-ACEH-BESAR` |
| Status           | Development (berjalan)                                 |
| Tujuan           | Portal informasi + transaksi anggota ORARI Lokal Aceh Besar |
| Target Deploy    | Self-hosted VPS, Docker Compose                        |
| User Final       | ORARI Lokal Aceh Besar (organisasi amatir radio)       |
| Bahasa Konten    | Bahasa Indonesia (seluruh UI)                          |

---

## 2. ARSITEKTUR

```
Browser ──HTTP──> Next.js (frontend :3000) ──API──> FastAPI (backend :8000) ──SQL──> PostgreSQL
```

- **Frontend**: Next.js 14 (pages router), React 18, Tailwind CSS
- **Backend**: Python FastAPI 0.100+, SQLAlchemy 2.0 async, Pydantic v2
- **Database**: PostgreSQL (production env), SQLite (dev)
- **ORM**: SQLAlchemy (runtime), Prisma schema (deploy reference only)
- **Auth**: JWT (access token), bcrypt password hashing via Werkzeug

---

## 3. STRUKTUR FILE LENGKAP

```text
orari-aceh-besar/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI app, CORS, JWT init
│   │   ├── core/
│   │   │   ├── database.py          # async SQLAlchemy engine, session
│   │   │   ├── config.py            # Pydantic settings
│   │   │   └── security.py          # JWT create/verify
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py              # User model
│   │   │   ├── transaksi.py         # Transaksi model
│   │   │   ├── pengumuman.py        # Pengumuman model
│   │   │   ├── kegiatan.py          # Kegiatan model
│   │   │   ├── berita.py            # Berita model (with image upload)
│   │   │   └── galeri.py            # Galeri model (with image upload)
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py              # Auth router (/api/auth/*)
│   │   │   ├── users.py             # User router (/api/users/*)
│   │   │   ├── pembayaran.py        # Transaction router (/api/transactions/*)
│   │   │   ├── admin.py             # Admin stats router (/api/admin/*)
│   │   │   ├── pengumuman.py        # Announcements router (/api/pengumuman/*)
│   │   │   ├── kegiatan.py          # Activities router (/api/kegiatan/*)
│   │   │   ├── berita.py            # Berita router (/api/berita/*)
│   │   │   └── galeri.py            # Galeri router (/api/galeri/*)
│   │   ├── services/
│   │   │   └── upload.py            # File upload handling
│   │   ├── prisma/
│   │   │   └── schema.prisma        # Prisma schema (PostgreSQL) — untuk deploy DB
│   │   ├── .env.example             # Template env vars
│   │   ├── requirements.txt         # Python deps (FastAPI, SQLAlchemy, JWT, etc.)
│   │   └── venv/                    # Virtual environment (Python 3.13)
│   │
│   ├── uploads/                     # Directory for uploaded files
│   │   ├── berita/                  # Images for Berita
│   │   └── galeri/                  # Images for Galeri
│   └── tests_app.py                 # Pytest test suite
│
├── frontend/
│   ├── src/app/
│   │   ├── layout.js                # Root layout (metadata title)
│   │   ├── globals.css              # Tailwind directives
│   │   ├── page.js                  # Landing page (publik)
│   │   ├── login/page.js            # Login form
│   │   ├── register/page.js         # Register form (daftar anggota baru)
│   │   └── dashboard/page.js        # Dashboard anggota + panel admin
│   ├── .env.local                   # NEXT_PUBLIC_API_URL
│   ├── package.json                 # Next.js 14, React 18, Tailwind
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── README.md                        # Dokumentasi manusia
└── Antigravity.md                   # File ini (teknis AI)
```

---

## 4. DATABASE (SQLAlchemy)

### 4.1 Model: User

File: `backend/app/models/user.py`

| Field        | Type          | Constraint              | Notes                                    |
| ------------ | ------------- | ----------------------- | ---------------------------------------- |
| id           | String(36)    | PK, UUID                | Generated via `uuid.uuid4()`             |
| email        | String(255)   | UNIQUE, NOT NULL        | Login credential                         |
| password     | String(255)   | NOT NULL                | Werkzeug `generate_password_hash`        |
| role         | String(50)    | Default 'UMUM'          | 'UMUM', 'ANGGOTA', 'ADMIN'               |
| callsign     | String(100)   | UNIQUE, nullable        | e.g. YB6XXX                              |
| nama         | String(255)   | NOT NULL                | Nama lengkap                             |
| noAnggota    | String(100)   | UNIQUE, nullable        | Nomor anggota formal                     |
| status       | String(50)    | Default 'PENDING'       | 'PENDING', 'AKTIF', 'EXPIRED'           |
| expiredAt    | DateTime      | nullable                | Tanggal expired keanggotaan              |
| alamat       | Text          | nullable                | Alamat lengkap                           |
| noHp         | String(50)    | nullable                | Nomor HP                                 |
| createdAt    | DateTime      | Default now()           |                                          |
| updatedAt    | DateTime      | Auto-update             |                                          |

Relasi: `transaksi = db.relationship('Transaksi', backref='user')`

### 4.2 Model: Transaksi

File: `backend/app/models/transaksi.py`

| Field         | Type          | Constraint              | Notes                                    |
| ------------- | ------------- | ----------------------- | ---------------------------------------- |
| id            | String(36)    | PK, UUID                |                                          |
| userId        | String(36)    | FK → User.id            |                                          |
| type          | String(50)    | NOT NULL                | 'DAFTAR_BARU', 'IURAN', 'DONASI', 'MERCHANDISE' |
| jumlah        | Float         | NOT NULL                | Nilai rupiah                             |
| buktiTransfer | String(255)   | nullable                | URL/file path bukti transfer             |
| keterangan    | String(255)   | nullable                | Catatan tambahan                         |
| status        | String(50)    | Default 'PENDING'       | 'PENDING', 'SUKSES', 'GAGAL'           |
| createdAt     | DateTime      | Default now()           |                                          |
| updatedAt     | DateTime      | Auto-update             |                                          |

### 4.3 Model: Pengumuman

File: `backend/app/models/pengumuman.py`

| Field     | Type          | Constraint              |
| --------- | ------------- | ----------------------- |
| id        | String(36)    | PK, UUID                |
| judul     | String(255)   | NOT NULL                |
| konten    | Text          | NOT NULL                |
| createdAt | DateTime      | Default now()           |
| updatedAt | DateTime      | Auto-update             |

### 4.4 Model: Kegiatan

File: `backend/app/models/kegiatan.py`

| Field     | Type          | Constraint              |
| --------- | ------------- | ----------------------- |
| id        | String(36)    | PK, UUID                |
| nama      | String(255)   | NOT NULL                |
| tanggal   | DateTime      | NOT NULL                |
| lokasi    | String(255)   | NOT NULL                |
| deskripsi | Text          | nullable                |
| createdAt | DateTime      | Default now()           |
| updatedAt | DateTime      | Auto-update             |

### 4.5 Model: Berita (NEW)

File: `backend/app/models/berita.py`

| Field     | Type          | Constraint              | Notes                                    |
| --------- | ------------- | ----------------------- | ---------------------------------------- |
| id        | String(36)    | PK, UUID                |                                          |
| judul     | String(255)   | NOT NULL                |                                          |
| konten    | Text          | NOT NULL                |                                          |
| image_url | String(500)   | nullable                | Path to uploaded image (local storage)   |
| createdAt | DateTime      | Default now()           |                                          |
| updatedAt | DateTime      | Auto-update             |                                          |

### 4.6 Model: Galeri (NEW)

File: `backend/app/models/galeri.py`

| Field     | Type          | Constraint              | Notes                                    |
| --------- | ------------- | ----------------------- | ---------------------------------------- |
| id        | String(36)    | PK, UUID                |                                          |
| judul     | String(255)   | nullable                |                                          |
| deskripsi | Text          | nullable                |                                          |
| image_url | String(500)   | NOT NULL                | Path to uploaded image (local storage)   |
| createdAt | DateTime      | Default now()           |                                          |
| updatedAt | DateTime      | Auto-update             |                                          |

---

## 5. API REFERENCE (Lengkap)

### 5.1 Auth Blueprint (`/api/auth`)

| Method | Endpoint   | Auth? | Body                              | Response                              |
| ------ | ---------- | ----- | --------------------------------- | ------------------------------------- |
| POST   | /register  | No    | `{email, password, nama, callsign?}` | `{id, email, nama, callsign}` + 201  |
| POST   | /login     | No    | `{email, password}`               | `{token, user: {...}}` + 200         |
| GET    | /me        | Yes   | -                                 | `{...user}` + 200                    |

### 5.2 Users Blueprint (`/api/users`)

| Method | Endpoint         | Auth? | Role   | Body / Params                       | Response                              |
| ------ | ---------------- | ----- | ------ | ----------------------------------- | ------------------------------------- |
| GET    | /me              | Yes   | ANY    | -                                   | `{...User}`                           |
| PUT    | /profile/update  | Yes   | ANY    | `{nama?, callsign?, alamat?, noHp?}` | `{...User}`                           |

### 5.3 Transactions Blueprint (`/api/transactions`)

| Method | Endpoint                     | Auth? | Role   | Body / Params                       | Response                              |
| ------ | ---------------------------- | ----- | ------ | ----------------------------------- | ------------------------------------- |
| POST   | /                            | Yes   | ANY    | `{type, jumlah, buktiTransfer?, keterangan?}` | `{...Transaksi}` + 201   |
| GET    | /                            | Yes   | ANY    | -                                   | `[{...Transaksi}]` (admin: semua, member: milik sendiri) |
| POST   | `/admin/transactions/:id/approve` | Yes | ADMIN | `{action: 'APPROVE' \| 'REJECT'}`  | `{...Transaksi}`                    |

### 5.4 Admin Statistics (`/api/admin`)

| Method | Endpoint      | Auth? | Role   | Body / Params | Response                              |
| ------ | ------------- | ----- | ------ | ------------- | ------------------------------------- |
| GET    | /stats        | Yes   | ADMIN  | -             | `{active_members_count, near_expired[], announcements[], activities[]}` |

### 5.5 Announcements (`/api/pengumuman`)

| Method | Endpoint      | Auth? | Role   | Body / Params       | Response                              |
| ------ | ------------- | ----- | ------ | ------------------- | ------------------------------------- |
| GET    | /             | No    | -      | -                   | `[{...Pengumuman}]`                  |
| POST   | /             | Yes   | ADMIN  | `{judul, konten}`   | `{...Pengumuman}` + 201             |

### 5.6 Activities (`/api/kegiatan`)

| Method | Endpoint      | Auth? | Role   | Body / Params                                   | Response                              |
| ------ | ------------- | ----- | ------ | ----------------------------------------------- | ------------------------------------- |
| GET    | /             | No    | -      | -                                               | `[{...Kegiatan}]`                   |
| POST   | /             | Yes   | ADMIN  | `{nama, tanggal (ISO), lokasi, deskripsi?}`     | `{...Kegiatan}` + 201         |

### 5.7 Berita (`/api/berita`)

| Method | Endpoint         | Auth? | Role   | Body / Params                                   | Response                              |
| ------ | ---------------- | ----- | ------ | ----------------------------------------------- | ------------------------------------- |
| GET    | /                | No    | -      | -                                               | `[{...Berita}]` (sorted by createdAt desc) |
| GET    | `/:berita_id`    | No    | -      | -                                               | `{...Berita}` + 404 if not found    |
| POST   | /                | Yes   | ADMIN  | `{judul, konten, image: UploadFile?}`           | `{...Berita}` + 201                 |
| PUT    | `/:berita_id`    | Yes   | ADMIN  | `{judul?, konten?, image: UploadFile?}`         | `{...Berita}` + 200                 |
| DELETE | `/:berita_id`    | Yes   | ADMIN  | -                                               | 204 No Content                      |

### 5.8 Galeri (`/api/galeri`)

| Method | Endpoint         | Auth? | Role   | Body / Params                                   | Response                              |
| ------ | ---------------- | ----- | ------ | ----------------------------------------------- | ------------------------------------- |
| GET    | /                | No    | -      | -                                               | `[{...Galeri}]` (sorted by createdAt desc) |
| GET    | `/:galeri_id`    | No    | -      | -                                               | `{...Galeri}` + 404 if not found    |
| POST   | /                | Yes   | ADMIN  | `{judul?, deskripsi?, image: UploadFile (required)}` | `{...Galeri}` + 201                 |
| PUT    | `/:galeri_id`    | Yes   | ADMIN  | `{judul?, deskripsi?, image: UploadFile?}`      | `{...Galeri}` + 200                 |
| DELETE | `/:galeri_id`    | Yes   | ADMIN  | -                                               | 204 No Content                      |

### 5.9 Error Response Format

Semua error: `{error: "Pesan error"}`

HTTP Status:
- 400 — Bad request (missing fields, duplicate)
- 401 — Unauthorized (no token, invalid credentials)
- 403 — Forbidden (bukan admin)
- 404 — Not found

---

## 6. FRONTEND STATE & LOGIC

### 6.1 Auth Flow
1. Login → simpan `token` + `user` (JSON) ke `localStorage`
2. Dashboard cek `localStorage('token')` — redirect ke `/login` jika tidak ada
3. Logout → `localStorage.clear()` → redirect ke `/`

### 6.2 Dashboard State (`dashboard/page.js`)
Semua state di satu komponen (belum di-split):
- `user` — objek user dari localStorage
- `token` — JWT token
- `transactions` — riwayat transaksi user
- `txType, jumlah, bukti, keterangan` — form transaksi baru
- `nama, callsign, alamat, noHp` — form edit profil
- `allUsers, allTransactions` — admin: data semua anggota + transaksi
- `editMemberId, editMemberData` — admin: form edit anggota
- `annJudul, annKonten` — admin: form pengumuman baru
- `actNama, actTanggal, actLokasi, actDeskripsi` — admin: form kegiatan baru
- `error, success` — notifikasi

### 6.3 Halaman yang Ada

| Route         | File                          | Deskripsi                        |
| ------------- | ----------------------------- | -------------------------------- |
| `/`           | `src/app/page.js`             | Landing page publik              |
| `/login`      | `src/app/login/page.js`       | Login form                       |
| `/register`   | `src/app/register/page.js`    | Register anggota baru            |
| `/dashboard`  | `src/app/dashboard/page.js`   | Dashboard + admin panel          |

### 6.4 Fetch Pattern
Semua fetch menggunakan environment variable `NEXT_PUBLIC_API_URL`.

Contoh:
```js
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
```

---

## 7. ENVIRONMENT VARIABLES

File: `backend/.env`

| Variable        | Contoh                                      | Wajib? |
| --------------- | ------------------------------------------- | ------ |
| DATABASE_URL    | `postgresql://user:***@localhost:5432/orari` | Ya   |
| JWT_SECRET_KEY  | `minimal-32-karakter-untuk-sha256-xyz`      | Ya     |
| UPLOAD_DIR      | `uploads`                                   | Tidak  |
| MAX_FILE_SIZE   | `10485760` (10MB)                           | Tidak  |

File: `frontend/.env.local`

| Variable                 | Contoh               | Wajib? |
| ------------------------ | -------------------- | ------ |
| NEXT_PUBLIC_API_URL      | `http://localhost:8000` | Ya   |

Catatan: `backend/app/core/config.py` handle otomatis:
- `postgres://` → diganti `postgresql+asyncpg://` untuk SQLAlchemy compatibility
- JWT_SECRET_KEY < 32 byte di-pad otomatis

---

## 8. KEPUTUSAN TEKNIS & ALASAN

### 8.1 FastAPI + SQLAlchemy vs Node.js/Prisma
**Keputusan**: FastAPI + SQLAlchemy (runtime), Prisma schema (deploy only)

**Alasan**:
- Python lebih ringan untuk VPS dengan RAM terbatas
- SQLAlchemy 2.0 async lebih mature untuk ORM dengan dukungan baik untuk PostgreSQL
- Developer familiarity dengan Python/FastAPI
- Prisma schema dipakai untuk **setup tabel PostgreSQL production** via `npx prisma db push`
- Backend FastAPI pakai SQLite di dev, PostgreSQL di prod

### 8.2 Pembayaran Manual (Belum Gateway)
- User upload bukti transfer → Admin verifikasi → Status berubah
- Tidak ada integrasi Midtrans/Xendit **saat ini** (tapi sudah ada reserved `xenditId` di plan awal)
- `DAFTAR_BARU`: Rp 150.000 (auto-created on register)
- `IURAN`: Rp 100.000 / tahun
- `DONASI`: nominal bebas
- `MERCHANDISE`: belum ada catalog

### 8.3 Auth JWT Sederhana
- Access token saja (no refresh token)
- Expiry: default 60 menit (via `ACCESS_TOKEN_EXPIRE_MINUTES`)
- Role-based access: ADMIN vs non-ADMIN (via `verify_access_token` dan pengecekan role di route)

### 8.4 Frontend Monolitik (Belum Split)
- Semua logic dashboard di satu file `page.js` (~550 line)
- Belum ada komponen modular
- Style: Tailwind utility classes langsung di JSX

---

## 9. BELUM DIKERJAKAN (Backlog)

Prioritas berdasarkan rencana awal:

| Prioritas | Fitur                       | Detail                                                     |
| --------- | --------------------------- | ---------------------------------------------------------- |
| P0        | Replace hardcoded API URL   | ✅ Sudah diganti dengan env `NEXT_PUBLIC_API_URL`         |
| P1        | Setup Docker Compose        | Dockerfile backend + frontend + PostgreSQL + Nginx          |
| P1        | Deploy ke VPS               | Setup domain, SSL, reverse proxy                           |
| P2        | Integrasi Payment Gateway   | Midtrans/Xendit API untuk pembayaran otomatis              |
| P2        | Upload file nyata           | ✅ Sudah implementasi upload file untuk Berita dan Galeri   |
| P2        | Email service               | SMTP untuk notifikasi approve/reject, password reset       |
| P3        | Laporan Excel/PDF           | Export transaksi, anggota                                   |
| P3        | Merchandise catalog         | CRUD produk, cart, checkout                                |
| P3        | Event registration          | Daftar event, kapasitas, pembayaran                        |
| P3        | Invoice generation          | Generate invoice PDF otomatis                              |
| P3        | Audit log                   | Catat semua perubahan admin                                |
| P4        | Migrasi ke TypeScript       | Frontend .js → .tsx, Backend .py → tambah type hints       |
| P4        | Responsive mobile           | Optimasi layout mobile                                     |
| P4        | Analytics dashboard         | Grafik anggota, transaksi, dll                             |

---

## 10. PERINGATAN & PITFALLS

1. **`register/page.js` auto-create transaction DAFTAR_BARU Rp 150.000** — Terjadi setiap registrasi. Pastikan amount ini sesuai kebijakan ORARI.
2. **`main.py` strip `postgres://` dari DATABASE_URL** — Jika pakai Prisma dengan schema parameter, FastAPI tidak bisa parse. Handle ini sengaja.
3. **Hardcoded `expiredAt` +1 tahun** — Di `routes.py` line 128, approve IURAN/DAFTAR_BARU set expired +365 hari. Review apakah ini benar untuk semua case.
4. **Tidak ada validasi jumlah IURAN minimal** — User bisa input jumlah berapa saja. Belum ada ceiling/floor.
5. **`editMemberId` modal di dashboard** — Tidak ada validasi admin strict di frontend untuk modal edit. Hanya hidden by conditional render `user.role === 'ADMIN'`.
6. **Image upload storage** — Gambar disimpan di `uploads/berita` dan `uploads/galeri` di filesystem lokal. Untuk produksi, pertimbangkan penggunaan cloud storage (S3, etc.) atau layanan CDN.
7. **File size limit** — Maksimal file upload adalah 10MB (dapat diubah via `MAX_FILE_SIZE` di `.env`).
8. **JWT token expiry** — Token kadaluarsa setelah 60 menit; pengguna perlu login kembali.

---