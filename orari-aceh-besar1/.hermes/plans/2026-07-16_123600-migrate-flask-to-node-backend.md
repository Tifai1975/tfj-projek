# ORARI Aceh Besar — Backend Migration: Flask → Node.js/Express/Prisma

> **Goal:** Replace Python Flask backend with Node.js + Express + Prisma, keeping existing Next.js frontend unchanged. Match all API endpoints & response shapes 1:1 so frontend works without modification.

## Current State

```
orari-aceh-besar1/
├── frontend/          ← Next.js 14 (JS), sudah jadi: landing, login, register, dashboard+admin
│   └── src/app/
│       ├── page.js           # Landing publik (fetch /api/dashboard/stats)
│       ├── login/page.js     # Login (fetch /api/auth/login)
│       ├── register/page.js  # Daftar (fetch /api/auth/register, POST /api/transactions)
│       └── dashboard/page.js # Profile, transaksi, admin panel (fetch /api/*)
├── backend/           ← Flask (MAU DIGANTI)
│   ├── app.py
│   ├── models/models.py      # SQLAlchemy → padanannya Prisma
│   ├── routes/auth.py
│   ├── routes/routes.py
│   └── prisma/schema.prisma  # SUDAH ADA (tapi khusus PostgreSQL)
├── README.md
└── Antigravity.md
```

## Target Architecture

```
Browser ──HTTP──> Next.js (:3000) ──> Node.js/Express (:5000) ──Prisma──> SQLite/PostgreSQL
```

- **Backend baru**: Node.js 18+, Express, TypeScript, Prisma ORM
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Auth**: JWT (flask-jwt-extended style — token di response `{token, user}`)
- **Frontend**: TIDAK BERUBAH — endpoints, response format, auth flow persis

## Endpoints yang WAJIB match persis

Dari frontend code, fetch calls:
1. `GET /api/dashboard/stats` → `{active_members_count, near_expired[], announcements[], activities[]}`
2. `POST /api/auth/register` → `{email, password, nama, callsign}` → `{...user}`
3. `POST /api/auth/login` → `{email, password}` → `{token, user: {...}}`
4. `GET /api/auth/me` → (Bearer token) → `{...user}`
5. `PUT /api/profile/update` → `{nama?, callsign?, alamat?, noHp?}` → `{...user}`
6. `POST /api/transactions` → `{type, jumlah, buktiTransfer?, keterangan?}` → `{...transaksi}`
7. `GET /api/transactions` → (Bearer) → `[{...transaksi}]`
8. `POST /api/admin/transactions/:id/approve` → `{action: 'APPROVE'|'REJECT'}` → `{...transaksi}`
9. `PUT /api/admin/members/:id` → `{nama?, callsign?, noAnggota?, role?, status?, expiredAt?}` → `{...user}`
10. `GET /api/members` → `?status=` → `[{...user}]`
11. `GET /api/announcements` → `[{...pengumuman}]`
12. `POST /api/announcements` → `{judul, konten}` → `{...pengumuman}`
13. `GET /api/activities` → `[{...kegiatan}]`
14. `POST /api/activities` → `{nama, tanggal, lokasi, deskripsi?}` → `{...kegiatan}`

**Response format**: Semua pake key Bahasa Indonesia (user.nama, user.callsign, user.status, user.expiredAt, transaksi.jumlah, transaksi.buktiTransfer, transaksi.status, pengumuman.judul, kegiatan.nama, etc).

---

## Fase 0: Setup Backend Node.js

### Task 0.1: Init backend directory & config

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/.env.example`
- Create: `backend/.env`

**Isi package.json:**
```json
{
  "name": "orari-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:push": "prisma db push"
  },
  "dependencies": {
    "@prisma/client": "^5.13.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/uuid": "^9.0.7",
    "typescript": "^5.3.0",
    "ts-node-dev": "^2.0.0",
    "prisma": "^5.13.0"
  }
}
```

**Isi tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Task 0.2: Init Prisma

```bash
cd backend
npx prisma init --datasource-provider sqlite
```

Ganti `prisma/schema.prisma` dengan schema baru (di Fase 1).

### Task 0.3: Buat entry point server

`backend/src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

export default app;
```

---

## Fase 1: Database Schema (Prisma)

### Task 1.1: Tulis Prisma Schema

**Padanan dari SQLAlchemy models models.py.**

Field names **Bahasa Indonesia** supaya response cocok dengan frontend:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      String   @default("UMUM")   // UMUM, ANGGOTA, ADMIN
  callsign  String?  @unique
  nama      String
  noAnggota String?  @unique
  status    String   @default("PENDING") // PENDING, AKTIF, EXPIRED
  expiredAt DateTime?
  alamat    String?
  noHp      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  transaksi Transaksi[]

  @@map("User")
}

model Transaksi {
  id            String   @id @default(cuid())
  userId        String
  type          String   // DAFTAR_BARU, IURAN, DONASI, MERCHANDISE
  jumlah        Float
  buktiTransfer String?
  keterangan    String?
  status        String   @default("PENDING") // PENDING, SUKSES, GAGAL
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("Transaksi")
}

model Pengumuman {
  id        String   @id @default(cuid())
  judul     String
  konten    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("Pengumuman")
}

model Kegiatan {
  id        String   @id @default(cuid())
  nama      String
  tanggal   DateTime
  lokasi    String
  deskripsi String?
  createdAt DateTime @default(now())

  @@map("Kegiatan")
}
```

Jalankan:
```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### Task 1.2: Buat Prisma client instance

`backend/src/utils/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
```

---

## Fase 2: Auth (JWT) — /api/auth/*

### Task 2.1: Buat JWT utility

`backend/src/utils/jwt.ts`:
```typescript
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'orari-jwt-secret-key-default-32chars';
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '1d';

export const generateToken = (payload: { userId: string; role: string }): string => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
};

export const verifyToken = (token: string): { userId: string; role: string } => {
  return jwt.verify(token, ACCESS_SECRET) as { userId: string; role: string };
};
```

### Task 2.2: Buat auth routes

`backend/src/routes/auth.ts`:

**POST /api/auth/register** — bikin User, status PENDING, return user.to_dict()
**POST /api/auth/login** — cek email+password, return `{token, user: {...}}`
**GET /api/auth/me** — (Bearer) return user objek

Response `user.to_dict()` harus:
```typescript
{
  id, email, role, callsign, nama, noAnggota, status,
  expiredAt: isoString|null, alamat, noHp, createdAt: isoString
}
```

### Task 2.3: Middleware auth

`backend/src/middleware/auth.ts`:
- `authenticate` — extract Bearer token, attach `req.user`
- `authorize(...roles)` — cek role

### Task 2.4: Daftarkan di index.ts

```typescript
import authRoutes from './routes/auth';
app.use('/api/auth', authRoutes);
```

---

## Fase 3: CRUD Routes — /api/*

Semua routes di satu file `backend/src/routes/api.ts` (seperti Flask `routes.py`).

### Task 3.1: Members & Profile

**GET /api/members** — publik, optional ?status=
**PUT /api/profile/update** — (Bearer) update nama, callsign, alamat, noHp
**PUT /api/admin/members/:id** — (Admin) update all fields + expiredAt

**Kritis — expiredAt handling:**
- Parse ISO string via `new Date(expired_str)` — Flask kirim ISO, frontend expect ISO
- Simpan sebagai DateTime di Prisma

### Task 3.2: Transactions

**POST /api/transactions** — (Bearer) create transaksi, status PENDING
**GET /api/transactions** — (Bearer) user only sees own; admin sees all
**POST /api/admin/transactions/:id/approve** — (Admin)
  - APPROVE: set status SUKSES, if type DAFTAR_BARU/IURAN → user status AKTIF, role ANGGOTA, expiredAt +365 hari
  - REJECT: set status GAGAL

**Kritis — expiredAt extend logic (sama persis Flask):**
```typescript
if (tx.type === 'DAFTAR_BARU' || tx.type === 'IURAN') {
  const base = user.expiredAt && user.expiredAt > new Date()
    ? user.expiredAt
    : new Date();
  const newExpiry = new Date(base);
  newExpiry.setFullYear(newExpiry.getFullYear() + 1);
  await prisma.user.update({
    where: { id: user.id },
    data: { status: 'AKTIF', role: 'ANGGOTA', expiredAt: newExpiry }
  });
}
```

### Task 3.3: Announcements & Activities

**GET /api/announcements** — publik, sort createdAt desc
**POST /api/announcements** — (Admin) create
**GET /api/activities** — publik, sort tanggal asc
**POST /api/activities** — (Admin) create

### Task 3.4: Dashboard Stats

**GET /api/dashboard/stats** — publik:
```typescript
{
  active_members_count: number,
  near_expired: User[],  // status=AKTIF && expiredAt <= now+30hari
  announcements: Pengumuman[], // 3 terbaru
  activities: Kegiatan[]  // upcoming, 3 terdekat
}
```

---

## Fase 4: Adaptasi Frontend

### Task 4.1: Ganti fetch URL ke environment variable

**File: `frontend/src/app/page.js`** — ganti `http://localhost:5000` → `process.env.NEXT_PUBLIC_API_URL`

**File: `frontend/src/app/login/page.js`** — sama

**File: `frontend/src/app/register/page.js`** — sama

**File: `frontend/src/app/dashboard/page.js`** — sama

Fallback: `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'`

Tambahkan ke `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Task 4.2: Adaptasi response shape untuk login

Login frontend expect: `{token, user: {...}}` — adjust auth route.

### Task 4.3: Test full flow

- Register → login → dashboard muncul
- Ajukan transaksi → admin approve → status berubah
- Buat pengumuman → muncul di landing
- Buat kegiatan → muncul di landing

---

## Fase 5: Docker & Production

### Task 5.1: Dockerfile backend

`backend/Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Task 5.2: Dockerfile frontend

`frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

### Task 5.3: docker-compose.yml

```yaml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: orari
      POSTGRES_USER: orari
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    build: ./backend
    depends_on: [db]
    environment:
      DATABASE_URL: postgresql://orari:${DB_PASSWORD}@db:5432/orari
      JWT_ACCESS_SECRET: ${JWT_SECRET}
      FRONTEND_URL: https://orari.example.com
    ports:
      - "5000:5000"
    restart: unless-stopped

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: https://api.orari.example.com
    ports:
      - "3000:3000"
    restart: unless-stopped

volumes:
  pgdata:
```

---

## Perubahan File Summary

| File | Action |
|------|--------|
| `backend/package.json` | CREATE (baru) |
| `backend/tsconfig.json` | CREATE |
| `backend/.env.example` | CREATE |
| `backend/.env` | CREATE |
| `backend/prisma/schema.prisma` | OVERWRITE (sudah ada dari Flask) |
| `backend/src/index.ts` | CREATE |
| `backend/src/utils/prisma.ts` | CREATE |
| `backend/src/utils/jwt.ts` | CREATE |
| `backend/src/middleware/auth.ts` | CREATE |
| `backend/src/routes/auth.ts` | CREATE |
| `backend/src/routes/api.ts` | CREATE |
| `backend/app.py` | DELETE (Flask) |
| `backend/models/` | DELETE |
| `backend/routes/` | DELETE |
| `backend/requirements.txt` | DELETE |
| `backend/venv/` | DELETE |
| `frontend/.env.local` | CREATE |
| `frontend/src/app/page.js` | MODIFY (ganti hardcode URL) |
| `frontend/src/app/login/page.js` | MODIFY |
| `frontend/src/app/register/page.js` | MODIFY |
| `frontend/src/app/dashboard/page.js` | MODIFY |

---

## Verification Checklist

Setelah semua task selesai:

- [ ] `npm run dev` di backend jalan tanpa error
- [ ] `npm run dev` di frontend jalan
- [ ] Register user baru → muncul di dashboard
- [ ] Login → dashboard muncul dengan data user
- [ ] Update profile → tersimpan
- [ ] Ajukan transaksi iuran → masuk riwayat
- [ ] Admin approve transaksi → SUKSES, user jadi AKTIF + ANGGOTA
- [ ] Admin reject transaksi → GAGAL
- [ ] Buat pengumuman → muncul di landing
- [ ] Buat kegiatan → muncul di landing
- [ ] Landing page stats jalan (active count, near expired)

---

## Risks & Pitfalls

1. **Bahasa Indonesia field names** — Prisma default camelCase. Pakai `@@map("User")` dan field names tetap bahasa Indonesia.
2. **`expiredAt` parsing** — Frontend kirim ISO string, simpan sebagai `DateTime?`. Pastikan format cocok.
3. **`jumlah` → Float** — Flask kirim `float`, Prisma `Float`. Frontend panggil `tx.jumlah.toLocaleString()` jadi harus number.
4. **UUID format** — Flask pakai `uuid4()` string, Prisma `cuid()`. Sama-sama string, frontend cuma pake sebagai key.
5. **Server port 5000** — Flask dan Express sama-sama 5000. Matikan Flask sebelum jalanin Node.
