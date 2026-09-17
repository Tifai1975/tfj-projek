# ORARI Aceh Besar — Technical Blueprint

> File ini adalah **source of truth** teknis untuk AI agent. Jangan edit manual tanpa update kedua state (backend + frontend). Semua konteks arsitektur, database, routing, dan keputusan teknis ada di sini.

---

## 1. IDENTITAS PROYEK

| Atribut          | Nilai                                                  |
| ---------------- | ------------------------------------------------------ |
| Nama             | ORARI Aceh Besar Web Portal                            |
| Direktori        | `/Users/tfj/Documents/Projek Hermes/orari-aceh-besar1` |
| Status           | Development (berjalan)                                 |
| Tujuan           | Portal informasi + transaksi anggota ORARI Lokal Aceh Besar |
| Target Deploy    | Self-hosted VPS, Docker Compose                        |
| User Final       | ORARI Lokal Aceh Besar (organisasi amatir radio)       |
| Bahasa Konten    | Bahasa Indonesia (seluruh UI)                          |

---

## 2. ARSITEKTUR

```
Browser ──HTTP──> Next.js (frontend :3000) ──API──> Flask (backend :5000) ──SQL──> PostgreSQL
```

- **Frontend**: Next.js 14 (pages router), React 18, Tailwind CSS
- **Backend**: Python Flask 3.x, Flask-SQLAlchemy, Flask-JWT-Extended
- **Database**: PostgreSQL (production env), SQLite (dev)
- **ORM**: SQLAlchemy (runtime), Prisma schema (deploy reference only)
- **Auth**: JWT (access token), bcrypt password hashing via Werkzeug

---

## 3. STRUKTUR FILE LENGKAP

```
orari-aceh-besar/
├── backend/
│   ├── app.py                          # Flask app factory, CORS, JWT init
│   ├── models/
│   │   └── models.py                   # SQLAlchemy models (4 tables)
│   ├── routes/
│   │   ├── auth.py                     # Blueprint auth (/api/auth/*)
│   │   └── routes.py                   # Blueprint routes (/api/*)
│   ├── requirements.txt                # Python deps (Flask, SQLAlchemy, JWT, etc.)
│   ├── prisma/
│   │   └── schema.prisma               # Prisma schema (PostgreSQL) — untuk deploy DB
│   ├── .env.example                    # Template env vars
│   └── venv/                           # Virtual environment (Python 3.13)
│
├── frontend/
│   ├── src/app/
│   │   ├── layout.js                   # Root layout (metadata title)
│   │   ├── globals.css                 # Tailwind directives
│   │   ├── page.js                     # Landing page (publik)
│   │   ├── login/page.js               # Login form
│   │   ├── register/page.js            # Register form (daftar anggota baru)
│   │   └── dashboard/page.js           # Dashboard anggota + panel admin
│   ├── package.json                    # Next.js 14, React 18, Tailwind
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md                           # Dokumentasi manusia
└── Antigravity.md                      # File ini (teknis AI)
```

### Konvensi Penting

1. **Frontend JS (bukan TSX)** — Semua komponen `.js`, bukan `.tsx`. 
2. **Client Components** — Semua halaman pakai `'use client'` karena state React.
3. **Hardcoded API URL** — Backend URL `http://localhost:5000` di-hardcode di semua fetch. Nanti harus diganti environment variable.
4. **No password reset** — Fitum reset password belum ada.
5. **No email service** — SMTP belum diintegrasi.
6. **Payment manual** — Belum pakai Midtrans/Xendit. Sistem: user upload bukti transfer → admin approve → status berubah.

---

## 4. DATABASE (SQLAlchemy)

### 4.1 Model: User

File: `backend/models/models.py`

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

| Field     | Type          | Constraint              |
| --------- | ------------- | ----------------------- |
| id        | String(36)    | PK, UUID                |
| judul     | String(255)   | NOT NULL                |
| konten    | Text          | NOT NULL                |
| createdAt | DateTime      | Default now()           |
| updatedAt | DateTime      | Auto-update             |

### 4.4 Model: Kegiatan

| Field     | Type          | Constraint              |
| --------- | ------------- | ----------------------- |
| id        | String(36)    | PK, UUID                |
| nama      | String(255)   | NOT NULL                |
| tanggal   | DateTime      | NOT NULL                |
| lokasi    | String(255)   | NOT NULL                |
| deskripsi | Text          | nullable                |
| createdAt | DateTime      | Default now()           |

### 4.5 Business Logic (Di Routes)

1. **Register** → User dibuat role 'UMUM', status 'PENDING'
2. **Daftar Baru** → Setelah register, langsung auto-create transaksi type 'DAFTAR_BARU' (Rp 150.000)
3. **Approve IURAN/DAFTAR_BARU** → User status jadi 'AKTIF', role 'ANGGOTA', expiredAt di-set +365 hari dari sekarang (atau dari expire sebelumnya jika masih aktif)
4. **Reject** → Transaksi status 'GAGAL'
5. **Near Expired** → Query `User.status == 'AKTIF' AND User.expiredAt <= (now + 30 days)`

---

## 5. API REFERENCE (Lengkap)

### 5.1 Auth Blueprint (`/api/auth`)

| Method | Endpoint   | Auth? | Body                              | Response                              |
| ------ | ---------- | ----- | --------------------------------- | ------------------------------------- |
| POST   | /register  | No    | `{email, password, nama, callsign?}` | `{id, email, nama, callsign}` + 201  |
| POST   | /login     | No    | `{email, password}`               | `{token, user: {...}}` + 200         |
| GET    | /me        | Yes   | -                                 | `{...user}` + 200                    |

### 5.2 Routes Blueprint (`/api`)

| Method | Endpoint                    | Auth? | Role   | Body / Params                       | Response                              |
| ------ | --------------------------- | ----- | ------ | ----------------------------------- | ------------------------------------- |
| GET    | /members                    | No    | -      | `?status=AKTIF`                     | `[{...User}, ...]`                   |
| PUT    | /profile/update             | Yes   | ANY    | `{nama?, callsign?, alamat?, noHp?}` | `{...User}`                         |
| POST   | /transactions               | Yes   | ANY    | `{type, jumlah, buktiTransfer?, keterangan?}` | `{...Transaksi}` + 201   |
| GET    | /transactions               | Yes   | ANY    | -                                   | `[{...Transaksi}]` (admin: semua, member: milik sendiri) |
| POST   | /admin/transactions/:id/approve | Yes | ADMIN | `{action: 'APPROVE' \| 'REJECT'}`  | `{...Transaksi}`                    |
| PUT    | /admin/members/:id          | Yes   | ADMIN  | `{nama?, callsign?, noAnggota?, role?, status?, expiredAt?}` | `{...User}` |
| GET    | /announcements              | No    | -      | -                                   | `[{...Pengumuman}]`                 |
| POST   | /announcements              | Yes   | ADMIN  | `{judul, konten}`                   | `{...Pengumuman}` + 201             |
| GET    | /activities                 | No    | -      | -                                   | `[{...Kegiatan}]`                   |
| POST   | /activities                 | Yes   | ADMIN  | `{nama, tanggal (ISO), lokasi, deskripsi?}` | `{...Kegiatan}` + 201         |
| GET    | /dashboard/stats            | No    | -      | -                                   | `{active_members_count, near_expired[], announcements[], activities[]}` |

### 5.3 Error Response Format

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

Semua fetch menggunakan **hardcoded URL**: `http://localhost:5000/api/...`

Pattern:
```js
const res = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
const data = await res.json()
if (!res.ok) throw new Error(data.error)
```

---

## 7. ENVIRONMENT VARIABLES

File: `backend/.env`

| Variable        | Contoh                                      | Wajib? |
| --------------- | ------------------------------------------- | ------ |
| DATABASE_URL    | `postgresql://user:pass@localhost:5432/orari` | Ya   |
| JWT_SECRET_KEY  | `minimal-32-karakter-untuk-sha256-xyz`      | Ya     |
| TESTING         | `true` (untuk test, pakai SQLite memory)     | Tidak  |

Catatan: `app.py` handle otomatis:
- `postgres://` → diganti `postgresql://` untuk SQLAlchemy compatibility
- Schema parameter (`?schema=`) di-strip dari URL
- JWT_SECRET_KEY < 32 byte di-pad otomatis

---

## 8. KEPUTUSAN TEKNIS & ALASAN

### 8.1 Flask + SQLAlchemy vs Node.js/Prisma
**Keputusan**: Flask + SQLAlchemy (runtime), Prisma schema (deploy only)

**Alasan**: 
- Awalnya direncanakan Node.js/Prisma (lihat `PROJECT_STRUCTURE.md` di repo `orari-aceh-besar`), tapi beralih ke Flask karena:
  - Python lebih ringan untuk VPS dengan RAM terbatas
  - SQLAlchemy lebih mature untuk ORM
  - Developer familiarity
- Prisma schema dipakai untuk **setup tabel PostgreSQL production** via `npx prisma db push`
- Backend Flask pakai SQLite di dev, PostgreSQL di prod

### 8.2 Pembayaran Manual (Belum Gateway)
- User upload bukti transfer → Admin verifikasi → Status berubah
- Tidak ada integrasi Midtrans/Xendit **saat ini** (tapi sudah ada reserved `xenditId` di plan awal)
- `DAFTAR_BARU`: Rp 150.000 (auto-created on register)
- `IURAN`: Rp 100.000 / tahun
- `DONASI`: nominal bebas
- `MERCHANDISE`: belum ada catalog

### 8.3 Auth JWT Sederhana
- Access token saja (no refresh token)
- Expiry: default 15-60 menit (via flask-jwt-extended config)
- Role-based access: ADMIN vs non-ADMIN (via `is_admin()` helper)

### 8.4 Frontend Monolitik (Belum Split)
- Semua logic dashboard di satu file `page.js` (~550 line)
- Belum ada komponen modular
- Style: Tailwind utility classes langsung di JSX

---

## 9. BELUM DIKERJAKAN (Backlog)

Prioritas berdasarkan rencana awal:

| Prioritas | Fitur                       | Detail                                                     |
| --------- | --------------------------- | ---------------------------------------------------------- |
| P0        | Replace hardcoded API URL   | Ganti `http://localhost:5000` dengan env `NEXT_PUBLIC_API_URL` |
| P1        | Setup Docker Compose        | Dockerfile backend + frontend + PostgreSQL + Nginx          |
| P1        | Deploy ke VPS               | Setup domain, SSL, reverse proxy                           |
| P2        | Integrasi Payment Gateway   | Midtrans/Xendit API untuk pembayaran otomatis              |
| P2        | Upload file nyata           | Ganti input text bukti transfer dengan file upload (multer) |
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
2. **`app.py` strip `?schema=` dari DATABASE_URL** — Jika pakai Prisma dengan schema parameter, Flask tidak bisa parse. Handle ini sengaja.
3. **Hardcoded `expiredAt` +1 tahun** — Di `routes.py` line 128, approve IURAN/DAFTAR_BARU set expired +365 hari. Review apakah ini benar untuk semua case.
4. **Tidak ada validasi jumlah IURAN minimal** — User bisa input jumlah berapa saja. Belum ada ceiling/floor.
5. **`editMemberId` modal di dashboard** — Tidak ada validasi admin strict di frontend untuk modal edit. Hanya hidden by conditional render `user.role === 'ADMIN'`.
