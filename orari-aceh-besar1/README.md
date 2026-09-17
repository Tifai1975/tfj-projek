# Portal ORARI Lokal Aceh Besar

Sistem informasi dan transaksi untuk anggota **ORARI (Organisasi Amatir Radio Indonesia)** Lokal Aceh Besar.

## Tujuan

Web portal resmi ORARI Aceh Besar untuk:

- **Pendaftaran anggota baru** secara online
- **Pembayaran iuran tahunan** via bukti transfer manual (divalidasi admin)
- **Manajemen data anggota** dan callsign
- **Publikasi pengumuman** dan agenda kegiatan
- **Donasi** dan pembelian merchandise

## Fitur Utama

### Publik (Tanpa Login)
- Portal utama: info organisasi, jumlah anggota aktif, anggota hampir expired
- Pengumuman terbaru
- Agenda kegiatan mendatang
- Login dan pendaftaran anggota baru

### Anggota (Setelah Login)
- Dashboard pribadi
- Perbarui profil (nama, callsign, HP, alamat)
- Ajukan transaksi (iuran tahunan, donasi, merchandise)
- Upload bukti transfer pembayaran
- Riwayat transaksi dan status verifikasi

### Admin
- **Verifikasi bukti transfer** — Approve/reject pembayaran anggota
- **Edit detail anggota** — Atur callsign, no anggota, role, status
- **Buat pengumuman** — Publikasikan ke halaman utama
- **Buat agenda kegiatan** — Jadwalkan acara/meeting
- **Dashboard stats** — Lihat jumlah anggota aktif, hampir expired

## Tech Stack

| Layer      | Teknologi                                                                 |
| ---------- | ------------------------------------------------------------------------- |
| Frontend   | Next.js 14, React 18, Tailwind CSS, Lucide Icons                         |
| Backend    | Python Flask, Flask-SQLAlchemy, Flask-JWT-Extended                       |
| Database   | PostgreSQL (production), SQLite (development)                            |
| Auth       | JWT (JSON Web Token) + bcrypt password hashing                           |
| Payment    | Manual bank transfer — anggota upload bukti, admin verifikasi            |
| Hosting    | Self-hosted VPS via Docker Compose                                       |

## Struktur Proyek

```
orari-aceh-besar/
├── backend/                     # Python Flask API
│   ├── app.py                   # Entry point Flask
│   ├── models/
│   │   └── models.py            # SQLAlchemy models (User, Transaksi, etc.)
│   ├── routes/
│   │   ├── auth.py              # Auth endpoints (register, login, me)
│   │   └── routes.py            # CRUD endpoints (anggota, transaksi, dll)
│   ├── requirements.txt         # Python dependencies
│   └── prisma/schema.prisma     # Prisma schema untuk deploy DB production
│
├── frontend/                    # Next.js App
│   ├── src/app/
│   │   ├── page.js              # Landing page (publik)
│   │   ├── layout.js            # Root layout
│   │   ├── globals.css          # Tailwind base styles
│   │   ├── login/page.js        # Halaman login
│   │   ├── register/page.js     # Pendaftaran anggota baru
│   │   └── dashboard/page.js    # Dashboard anggota + panel admin
│   ├── package.json
│   ├── tailwind.config.js
│   └── next.config.js
│
└── README.md                    # File ini
```

## Cara Menjalankan

### Backend (Flask)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # Isi DATABASE_URL dan JWT_SECRET_KEY
python app.py
```

Backend berjalan di `http://localhost:5000`

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:3000`

### Setup Database (Production - PostgreSQL)

```bash
cd backend
# Pastikan DATABASE_URL di .env sudah指向 PostgreSQL
npx prisma db push   # Buat tabel sesuai schema.prisma
```

## API Endpoints

### Auth
| Method | Endpoint           | Deskripsi              |
| ------ | ------------------ | ---------------------- |
| POST   | `/api/auth/register` | Daftar anggota baru    |
| POST   | `/api/auth/login`    | Login, dapatkan token  |
| GET    | `/api/auth/me`       | Profil user saat ini   |

### Anggota & Transaksi
| Method | Endpoint                                | Deskripsi                       |
| ------ | --------------------------------------- | ------------------------------- |
| GET    | `/api/members`                          | Daftar anggota (publik)         |
| PUT    | `/api/profile/update`                   | Update profil sendiri            |
| POST   | `/api/transactions`                     | Ajukan transaksi + upload bukti |
| GET    | `/api/transactions`                     | Riwayat transaksi               |
| GET    | `/api/dashboard/stats`                  | Statistik dashboard publik      |

### Admin Only
| Method | Endpoint                                          | Deskripsi                         |
| ------ | ------------------------------------------------- | --------------------------------- |
| PUT    | `/api/admin/members/:id`                          | Edit detail anggota               |
| POST   | `/api/admin/transactions/:id/approve`             | Approve/reject bukti transfer     |
| POST   | `/api/announcements`                              | Buat pengumuman                   |
| POST   | `/api/activities`                                 | Buat agenda kegiatan              |

### Publik
| Method | Endpoint              | Deskripsi            |
| ------ | --------------------- | -------------------- |
| GET    | `/api/announcements`  | Daftar pengumuman    |
| GET    | `/api/activities`     | Daftar kegiatan      |

## Status Proyek

✅ Fase 1 — Landing page, auth, dashboard anggota, transaksi manual  
✅ Fase 2 — Admin panel (verifikasi transaksi, edit anggota, buat pengumuman/kegiatan)  
⬜ Fase 3 — Fitur merchandise, event registration, invoice generation  
⬜ Fase 4 — Laporan Excel/PDF, email otomatis, analytics  

---

> Proyek ini dikembangkan untuk ORARI Lokal Aceh Besar.
