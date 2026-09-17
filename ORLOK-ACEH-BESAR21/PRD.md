# Product Requirements Document (PRD)
## ORLOK Aceh Besar - Portal Informasi, Keanggotaan, Transaksi, Berita & Galeri

**Status:** Draft untuk review final  
**Author:** Teuku Faisal Jumaidin (Pak Faisal)  
**Project folder:** `/Users/tfj/Documents/Projek Hermes/ORLOK-ACEH-BESAR`  
**Version:** 1.0  
**Source:** Keputusan dan implementasi yang telah dibahas pada sesi ini

---

## 1. Tujuan

ORLOK Aceh Besar menyediakan portal web untuk:

1. Memublikasikan berita, pengumuman, dan agenda kegiatan kepada anggota maupun publik.
2. Menampilkan galeri foto kegiatan dengan gambar/foto yang diunggah bersama konten.
3. Mengelola data anggota dan status keanggotaan.
4. Menerima pendaftaran anggota baru dan bukti pembayaran iuran secara online.
5. Memverifikasi bukti transfer secara manual oleh admin.
6. Menyediakan dashboard untuk anggota dan panel administrasi.

Sistem menggunakan frontend Next.js dan backend FastAPI. Backend sebelumnya menggunakan Flask; Flask tidak lagi menjadi stack utama.

---

## 2. Stakeholder dan Persona

### Admin Organisasi

- Mengelola berita, galeri, pengumuman, dan kegiatan.
- Mengelola daftar anggota.
- Menyetujui atau menolak bukti transfer.
- Melihat statistik dashboard.

### Anggota Aktif

- Login dengan akun anggota.
- Memperbarui profil.
- Melihat status keanggotaan.
- Mengajukan iuran atau donasi.
- Melihat riwayat transaksi dan status verifikasi.

### Calon Anggota

- Membuka landing page tanpa login.
- Mendaftar sebagai pengguna baru.
- Melihat informasi pendaftaran.

### Publik

- Membuka landing page.
- Membaca pengumuman, agenda, berita, dan galeri yang dipublikasikan.

---

## 3. Ruang Lingkup

### Termasuk v1

- Landing page publik.
- Registrasi dan login.
- JWT authentication.
- Role-based access: `UMUM`, `ANGGOTA`, dan `ADMIN`.
- Profil anggota.
- Daftar dan pengelolaan anggota.
- Transaksi pendaftaran, iuran, donasi, dan merchandise.
- Bukti transfer manual.
- Verifikasi transaksi oleh admin.
- Berita dengan gambar/foto.
- Galeri dengan gambar/foto wajib.
- Pengumuman.
- Agenda kegiatan.
- Dashboard statistik.
- Environment-based API configuration.

### Tidak termasuk v1

- Payment gateway otomatis.
- Pembayaran otomatis terverifikasi tanpa pemeriksaan admin.
- Email notifikasi otomatis.
- Mobile application.
- Export laporan Excel/PDF.
- Import massal konten atau data anggota.
- Merchandise catalog lengkap.

---

## 4. Keputusan Produk dan Teknis

1. Backend utama: **FastAPI**.
2. Database development: SQLite melalui `aiosqlite`.
3. Database production: PostgreSQL melalui `asyncpg`.
4. ORM: SQLAlchemy 2.x.
5. Authentication: JWT dengan role-based access.
6. Password: hash menggunakan Werkzeug.
7. Frontend: Next.js, React, Tailwind CSS.
8. API frontend membaca nilai `NEXT_PUBLIC_API_URL`.
9. Berita dan Galeri menggunakan multipart file upload.
10. Galeri mewajibkan gambar/foto.
11. Berita dapat dibuat tanpa gambar, tetapi produk menargetkan setiap berita/informasi memiliki gambar.
12. File upload disimpan secara lokal di direktori kategori.
13. Filename upload menggunakan UUID.
14. Batas ukuran file konfigurasi: `10 MB`.
15. Transaksi pembayaran tetap manual; bukti transfer diperiksa admin.

---

## 5. Functional Requirements

### 5.1 Landing Page

Halaman publik `/` harus menampilkan:

- Nama dan identitas ORARI Lokal Aceh Besar.
- Statistik anggota aktif.
- Daftar pengumuman terbaru.
- Agenda kegiatan mendatang.
- Informasi yang relevan bagi calon anggota.
- Tautan login dan registrasi.
- Tampilan responsif untuk desktop dan mobile.

Data landing page diambil dari API backend. Error loading harus ditampilkan tanpa merusak halaman.

### 5.2 Registrasi dan Login

#### Registrasi

Endpoint registrasi menerima:

- `email`
- `password`
- `nama`
- `callsign` opsional

Perilaku:

- Email harus unik.
- Email, password, dan nama wajib.
- Password tidak boleh dikirim atau disimpan dalam plaintext.
- Pengguna baru dibuat dengan role `UMUM` dan status `PENDING`.
- Registrasi calon anggota membuat transaksi `DAFTAR_BARU` dengan status `PENDING`.
- Setelah login berhasil, token dan data user disimpan di frontend.

#### Login

Endpoint login menerima email, password, dan form data OAuth2.

Perilaku:

- Credential yang salah menghasilkan respons tidak sah.
- Login berhasil menghasilkan JWT.
- JWT digunakan untuk proteksi endpoint authenticated.
- Token expiry mengikuti konfigurasi backend.

#### Current User

Endpoint authenticated mengembalikan data pengguna berdasarkan token.

### 5.3 Profil Anggota

Anggota dapat mengubah:

- `nama`
- `callsign`
- `alamat`
- `noHp`

Perubahan harus disimpan ke database dan kembali ditampilkan pada dashboard.

### 5.4 Keanggotaan

Admin dapat melihat dan mengubah:

- `nama`
- `callsign`
- `noAnggota`
- `role`
- `status`
- `expiredAt`

Status keanggotaan:

- `PENDING`
- `AKTIF`
- `EXPIRED`

Role:

- `UMUM`
- `ANGGOTA`
- `ADMIN`

### 5.5 Transaksi dan Pembayaran

Anggota dapat membuat transaksi dengan:

- `type`
- `jumlah`
- `buktiTransfer`
- `keterangan`

Status transaksi:

- `PENDING`
- `SUKSES`
- `GAGAL`

Perilaku:

- Anggota hanya melihat transaksi milik sendiri.
- Admin dapat melihat transaksi untuk verifikasi.
- Admin dapat menyetujui atau menolak transaksi.
- Setelah transaksi disetujui, status transaksi menjadi `SUKSES`.
- Setelah transaksi disetujui, user menjadi `ANGGOTA` dan status `AKTIF`.
- Masa berlaku anggota ditetapkan selama 365 hari setelah persetujuan.
- Pembayaran dilakukan secara manual melalui transfer bank.
- Detail rekening bank belum disepakati dan harus dikonfirmasi sebelum produksi.

Catatan implementasi saat ini: frontend menyimpan `buktiTransfer` sebagai teks/link. Jika bukti transfer harus berupa file upload, ini merupakan keputusan terpisah dari upload Berita/Galeri.

### 5.6 Berita

Admin dapat melakukan CRUD berita.

Data berita:

- `judul`
- `konten`
- `image_url`
- `createdAt`
- `updatedAt`

Perilaku:

- Hanya admin yang dapat membuat, mengubah, atau menghapus berita.
- Publik dapat membaca berita.
- Berita dapat memiliki gambar/foto.
- Filename file menggunakan UUID.
- File dibatasi sesuai `MAX_FILE_SIZE`.
- Berita terbaru ditampilkan berdasarkan waktu pembuatan.

### 5.7 Galeri

Admin dapat melakukan CRUD galeri.

Data galeri:

- `judul` opsional
- `deskripsi` opsional
- `image_url` wajib
- `createdAt`
- `updatedAt`

Perilaku:

- Gambar/foto wajib diunggah untuk setiap galeri.
- Publik dapat membaca galeri.
- Admin dapat membuat, mengubah, dan menghapus galeri.
- File disimpan di direktori kategori galeri.
- Filename file menggunakan UUID.

### 5.8 Pengumuman

Admin dapat membuat dan membaca pengumuman.

Data pengumuman:

- `judul`
- `konten`
- `createdAt`
- `updatedAt`

Pengumuman terbaru ditampilkan pada landing page.

### 5.9 Kegiatan

Admin dapat membuat dan membaca kegiatan.

Data kegiatan:

- `nama`
- `tanggal`
- `lokasi`
- `deskripsi`
- `createdAt`

Kegiatan ditampilkan pada landing page berdasarkan tanggal.

### 5.10 Dashboard Admin

Admin dapat melihat:

- Statistik pengguna.
- Daftar anggota.
- Daftar transaksi.
- Status transaksi.
- Aksi approve/reject.
- Form pengumuman.
- Form kegiatan.
- Form pengelolaan anggota.

Dashboard harus menyembunyikan panel admin untuk role selain `ADMIN`.

---

## 6. API Contract

### Auth

| Method | Endpoint | Role | Input | Output |
|---|---|---|---|---|
| POST | `/api/auth/register` | Public | `email`, `password`, `nama`, `callsign?` | User baru |
| POST | `/api/auth/login` | Public | OAuth2 form data | `token`, `user` |
| GET | `/api/auth/me` | Auth | JWT | User |

### Users / Members

| Method | Endpoint | Role | Input | Output |
|---|---|---|---|---|
| GET | `/api/users/me` | Auth | JWT | User |
| GET | `/api/users/members` | Auth | JWT | Daftar user |
| PUT | `/api/users/profile` | Auth | `nama?`, `callsign?`, `alamat?`, `noHp?` | User |
| PUT | `/api/users/admin/members/{member_id}` | Admin | Data anggota | User |

### Berita

| Method | Endpoint | Role | Input | Output |
|---|---|---|---|---|
| GET | `/api/berita` | Public | - | Daftar berita |
| GET | `/api/berita/{berita_id}` | Public | - | Berita |
| POST | `/api/berita` | Admin | `judul`, `konten`, `image?` | Berita baru |
| PUT | `/api/berita/{berita_id}` | Admin | Data opsional | Berita |
| DELETE | `/api/berita/{berita_id}` | Admin | - | 204 |

### Galeri

| Method | Endpoint | Role | Input | Output |
|---|---|---|---|---|
| GET | `/api/galeri` | Public | - | Daftar galeri |
| GET | `/api/galeri/{galeri_id}` | Public | - | Galeri |
| POST | `/api/galeri` | Admin | `image` wajib | Galeri baru |
| PUT | `/api/galeri/{galeri_id}` | Admin | Data opsional | Galeri |
| DELETE | `/api/galeri/{galeri_id}` | Admin | - | 204 |

### Transaksi

| Method | Endpoint | Role | Input | Output |
|---|---|---|---|---|
| POST | `/api/transaksi` | Auth | `type`, `jumlah`, `buktiTransfer?`, `keterangan?` | Transaksi baru |
| GET | `/api/transaksi` | Auth | JWT | Riwayat transaksi |
| POST | `/api/transaksi/admin/transactions/{tx_id}/approve` | Admin | `action: APPROVE|REJECT` | Transaksi |

### Pengumuman dan Kegiatan

| Method | Endpoint | Role | Input | Output |
|---|---|---|---|---|
| GET | `/api/pengumuman` | Public | - | Daftar pengumuman |
| POST | `/api/pengumuman` | Admin | `judul`, `konten` | Pengumuman |
| GET | `/api/kegiatan` | Public | - | Daftar kegiatan |
| POST | `/api/kegiatan` | Admin | `nama`, `tanggal`, `lokasi`, `deskripsi?` | Kegiatan |

### Statistik

| Method | Endpoint | Role | Output |
|---|---|---|---|
| GET | `/api/dashboard/stats` | Public | Statistik dashboard |
| GET | `/api/admin/stats` | Admin | Statistik admin |

Catatan sinkronisasi: kode frontend saat ini memanggil beberapa path berbeda, antara lain `/api/members`, `/api/admin/members/{id}`, `/api/announcements`, `/api/activities`, dan `/api/profile/update`. Contract di atas harus menjadi sumber kebenaran; frontend dan backend perlu diselaraskan sebelum production.

---

## 7. Database Schema

### User

- `id`: UUID primary key
- `email`: unique, required
- `password`: hashed, required
- `role`: `UMUM`, `ANGGOTA`, `ADMIN`
- `callsign`: unique, optional
- `nama`: required
- `noAnggota`: unique, optional
- `status`: `PENDING`, `AKTIF`, `EXPIRED`
- `expiredAt`: optional
- `alamat`: optional
- `noHp`: optional
- `createdAt`, `updatedAt`

### Transaksi

- `id`: UUID primary key
- `userId`: foreign key ke `User.id`
- `type`: `DAFTAR_BARU`, `IURAN`, `DONASI`, `MERCHANDISE`
- `jumlah`: required
- `buktiTransfer`: optional
- `keterangan`: optional
- `status`: `PENDING`, `SUKSES`, `GAGAL`
- `createdAt`, `updatedAt`

### Berita

- `id`: UUID primary key
- `judul`: required
- `konten`: required
- `image_url`: optional
- `createdAt`, `updatedAt`

### Galeri

- `id`: UUID primary key
- `judul`: optional
- `deskripsi`: optional
- `image_url`: required
- `createdAt`, `updatedAt`

### Pengumuman

- `id`: UUID primary key
- `judul`: required
- `konten`: required
- `createdAt`, `updatedAt`

### Kegiatan

- `id`: UUID primary key
- `nama`: required
- `tanggal`: required
- `lokasi`: required
- `deskripsi`: optional
- `createdAt`

---

## 8. Frontend Pages

### `/`

Landing page publik untuk statistik, pengumuman, agenda, dan tautan akses.

### `/login`

Form login anggota/admin.

### `/register`

Form registrasi calon anggota.

### `/dashboard`

Dashboard anggota dan admin:

- profil
- status keanggotaan
- riwayat transaksi
- bukti transfer
- aksi verifikasi
- pengelolaan anggota
- pengumuman
- kegiatan

### Halaman Konten

Halaman publik dan admin untuk Berita serta Galeri harus menampilkan:

- daftar konten
- detail konten
- form upload
- form edit
- aksi hapus
- validasi gambar
- fallback ketika belum ada konten

---

## 9. Acceptance Criteria

### Backend

- [ ] FastAPI application dapat dijalankan.
- [ ] Database table dibuat otomatis saat startup.
- [ ] Register, login, dan authenticated user bekerja.
- [ ] Role `ADMIN` dapat mengakses endpoint admin.
- [ ] Role non-admin tidak dapat mengakses endpoint admin.
- [ ] Password tersimpan dalam bentuk hash.
- [ ] Berita dapat dibuat, dibaca, diperbarui, dan dihapus.
- [ ] Galeri dapat dibuat, dibaca, diperbarui, dan dihapus.
- [ ] Galeri menolak konten tanpa gambar.
- [ ] File upload tidak melewati batas ukuran.
- [ ] File upload menggunakan filename aman dan UUID.
- [ ] Transaksi dapat dibuat dan dibaca oleh pemiliknya.
- [ ] Admin dapat approve/reject transaksi.
- [ ] Approve transaksi mengubah user menjadi anggota aktif.
- [ ] Pengumuman dan kegiatan dapat dibuat serta dibaca.

### Frontend

- [ ] Semua request API menggunakan `NEXT_PUBLIC_API_URL`.
- [ ] Landing page dapat diakses tanpa login.
- [ ] Login berhasil mengarahkan ke dashboard.
- [ ] Registrasi berhasil membuat akun dan transaksi pendaftaran.
- [ ] Anggota dapat mengubah profil.
- [ ] Anggota dapat melihat riwayat transaksi.
- [ ] Admin melihat seluruh transaksi.
- [ ] Panel admin hanya muncul untuk role `ADMIN`.
- [ ] Berita dan Galeri memiliki form upload.
- [ ] Galeri mewajibkan gambar/foto.
- [ ] Tampilan responsif.
- [ ] Error API ditampilkan dengan jelas.

### Security dan Operations

- [ ] JWT secret tidak hardcoded untuk production.
- [ ] CORS dibatasi sesuai domain produksi.
- [ ] Upload directory tidak dapat diakses langsung tanpa policy yang sesuai.
- [ ] MIME type dan ekstensi file divalidasi.
- [ ] File lama dibersihkan saat gambar diganti/dihapus.
- [ ] Database dan upload memiliki backup strategy.
- [ ] Environment variables dipisahkan antara development dan production.

---

## 10. Implementation Status

### Sudah diterapkan

- Folder proyek baru `ORLOK-ACEH-BESAR`.
- FastAPI application entrypoint.
- SQLAlchemy async models.
- JWT authentication.
- Role-based access pada endpoint utama.
- Berita CRUD dengan upload.
- Config upload directory dan batas ukuran.
- Frontend environment variable `NEXT_PUBLIC_API_URL`.
- Login, register, dashboard, transaksi, profil, pengumuman, dan kegiatan pada frontend.
- Dokumentasi teknis `Antigravity.md`.

### Perlu diselesaikan atau diselaraskan

- Endpoint Galeri belum lengkap pada file route saat ini.
- Path API frontend belum sesuai dengan contract backend.
- Public display Berita dan Galeri belum terlihat pada landing page saat ini.
- Update/delete Pengumuman dan Kegiatan belum tersedia.
- Bukti transfer masih berupa teks/link, bukan file upload.
- Rekening bank produksi belum dikonfirmasi.
- CORS masih `*` pada kode saat ini dan perlu dipersempit untuk produksi.
- JWT secret development masih berupa nilai default pada config.

---

## 11. Open Questions

1. Domain dan hosting produksi apa yang digunakan?
2. Spesifikasi database production: SQLite, PostgreSQL, atau managed database?
3. Nomor rekening tujuan pembayaran iuran?
4. Apakah bukti transfer juga harus menjadi file upload?
5. Apakah semua admin boleh mengelola konten, atau hanya role tertentu?
6. Apakah pengumuman dan kegiatan memerlukan update/delete?
7. Dari mana data awal berita, galeri, anggota, dan pengumuman dimasukkan?
8. Berapa lama masa berlaku keanggotaan setelah transaksi disetujui? Kode saat ini menggunakan 365 hari.
9. Apakah publik boleh melihat daftar anggota atau hanya statistik?
10. Apakah upload harus membatasi MIME type tertentu, misalnya JPG, PNG, dan WEBP?

---

## 12. Deployment and Operations

- Backend dijalankan pada port konfigurasi, saat ini `8000`.
- Frontend dijalankan pada port konfigurasi, saat ini `3000`.
- `DATABASE_URL` menentukan SQLite atau PostgreSQL.
- `JWT_SECRET_KEY` wajib diganti pada production.
- `UPLOAD_DIR` menentukan lokasi file.
- `MAX_FILE_SIZE` saat ini `10 MB`.
- Backup database dan upload file diperlukan sebelum rollout.
- Rollback harus mempertahankan versi frontend/backend yang sebelumnya stabil.

---

## 13. Appendix

### Tech Stack

- FastAPI
- SQLAlchemy 2.x
- aiosqlite development
- asyncpg production
- JWT
- Werkzeug password hashing
- Next.js
- React
- Tailwind CSS
- Python multipart file upload

### Project Structure

```text
ORLOK-ACEH-BESAR/
├── README.md
├── Antigravity.md
├── PRD.md
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   └── routes/
│   └── tests_app.py
└── frontend/
    ├── .env.local
    └── src/app/
        ├── page.js
        ├── login/page.js
        ├── register/page.js
        └── dashboard/page.js
```

### Source Files

- `backend/app/main.py`
- `backend/app/routes/auth.py`
- `backend/app/routes/users.py`
- `backend/app/routes/berita.py`
- `backend/app/routes/galeri.py`
- `backend/app/routes/pembayaran.py`
- `backend/app/routes/admin.py`
- `backend/app/routes/pengumuman.py`
- `backend/app/routes/kegiatan.py`
- `backend/app/models/user.py`
- `backend/app/models/transaksi.py`
- `backend/app/models/berita.py`
- `backend/app/models/galeri.py`
- `backend/app/models/pengumuman.py`
- `backend/app/models/kegiatan.py`
