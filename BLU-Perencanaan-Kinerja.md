# Proposal: Aplikasi Perencanaan BLU Berbasis Kinerja
## Universitas Teuku Umar (UTU)

---

## 1. Latar Belakang & Tujuan

### 1.1 Latar Belakang
- Universitas Teuku Umar (UTU) memiliki sistem BLU (Badan Layanan Umum) yang perlu disempurnakan dengan pendekatan berbasis kinerja.
- Proses alokasi dana saat ini tidak terintegrasi dengan indikator kinerja unit terkecil (Jurusan/Departemen/Prodi).
- Terdapat kebutuhan untuk memastikan alokasi dana proporsional terhadap kemampuan dan kontribusi setiap unit.
- RKA (Rekomendasi Kinerja) harus memiliki transparansi dan keterlibatan semua level pembangunan.

### 1.2 Tujuan
Membangun sistem perencanaan BLU yang:
- Menggunakan data dari unit terkecil sebagai basis.
- Menghitung **Baselane 2 tahun** (pendapatan 2 tahun lalu dikurangi persentase sesuai regulasi).
- Menyediakan alokasi dana yang terdistribusi ke unit kecil.
- Memastikan verifikasi dan tanda tangan RKA.

---

## 2. Arsitektur Sistem

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────────┐
│  Unit Kecil     │────▶│   Fakultas       │────▶│  Rektor & KDP      │
│  (Jurusan/Dept/  │     │  (Alokasi        │     │  (Verifikasi &     │
│   Prodi)         │     │   Dana)          │     │   Tanda Tangan)    │
└─────────────────┘     └──────────────────┘     └────────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  BLU Perencanaan │
                       │  Berbasis Kinerja│
                       └──────────────────┘
```

### 2.1 Alur Data
1. **Input Baseline** – Setiap unit kecil (Jurusan/Departemen/Prodi) mengirim laporan pendapatan 2 tahun terakhir.
2. **Perhitungan Baselane** – Central Office menghitung:
   ```
   Baselane = Pendapatan 2 tahun - (Diskon % sesuai regulasi)
   ```
3. **Alokasi Dana** – Fakultas menerima total baseline dan membaginya ke unit kecil.
4. **Redistribusi** – Setiap unit kecil membagi alokasi fakultasnya ke unit terkecilnya (Jurusan/Departemen/Prodi).
5. **Verifikasi** – Kepala unit kecil (Kepala Unit Kerja) melakukan verifikasi.
6. **Tanda Tangan RKA** – Rektor dan Ketua Dewan Pegawas (KDP) menandatangani RKA.

---

## 3. Proses Detail

### Tahap 1: Input Data dari Unit Kecil
- **Pelaku**: Setiap unit kecil (Jurusan, Departemen, Prodi) mengirim laporan pendapatan 2 tahun terakhir.
- **Format**: Laporan keuangan sederhana (rekening bank, laporan anggaran, pendapatan non-anggaran).
- **Timeline**: Setiap 2 tahun (misal: 2024–2026).

### Tahap 2: Perhitungan Baselane
- **Rumus**: `Baselane = Pendapatan 2 tahun - (Diskon % sesuai regulasi)`
- **Diskon %**: Bisa disesuaikan berdasarkan kebijakan universitas (contoh: 10% untuk pengurangan biaya administrasi).
- **Verifikasi**: Kepala unit kecil memverifikasi data sebelum dikirim ke Fakultas.

### Tahap 3: Alokasi Dana oleh Fakultas
- Fakultas menerima total baseline dari semua unit kecil.
- Fakultas membagi baseline ke unit kecil berdasarkan kapasitas dan prioritas.
- Hasilnya menjadi **Alokasi Dana Fakultas** yang digunakan untuk operasional BLU.

### Tahap 4: Redistribusi ke Unit Kecil
- Setiap unit kecil membagi alokasi fakultasnya ke unit terkecilnya (Jurusan/Departemen/Prodi).
- Distribusi bisa bersifat proporsional atau berdasarkan kebutuhan spesifik.

### Tahap 5: Verifikasi & Tanda Tangan RKA
- **Verifikasi**: Kepala unit kecil (Kepala Unit Kerja) memastikan distribusi sesuai capacity dan prioritas.
- **Tanda Tangan**:
  - **Rektor** – Menandatangani RKA sebagai representasi tertinggi.
  - **Kepala Dewan Pegawas (KDP)** – Menandatangani sebagai organ pengawas internal.

---

## 4. Peran & Tanggung Jawab

| Level | Peran | Tanggung Jawab |
|-------|-------|----------------|
| **Unit Kecil** (Jurusan/Departemen/Prodi) | Input data pendapatan 2 tahun | Menyediakan data akurat sebagai basis |
| **Kepala Unit Kerja** | Verifikasi data | Memastikan data valid dan sesuai |
| **Fakultas** | Alokasi dana | Membagi baseline ke unit kecil |
| **Rektor** | Tanda tangan RKA | Menandatangani rekomendasi kinerja |
| **KDP (Koordinator Dewan Pegawas)** | Tanda tangan RKA | Mengawasi kepatuhan dan integritas |

---

## 5. Timeline Implementasi

| Bulan | Karya |
|-------|-------|
| **Bulan 1–2** | Rancangan sistem & definisi standar input data |
| **Bulan 3** | Pilot uji coba dengan 2 fakultas |
| **Bulan 4** | Perbaikan & finalisasi algoritma basalane |
| **Bulan 5** | Training para kepala unit kecil & rektor |
| **Bulan 6** | Implementasi full-scale di seluruh universitas |
| **Bulan 7** | Review & penandatanganan RKA |

---

## 6. Indikator Keberhasilan (KPIs)

- **Transparansi**: 100% unit kecil dapat mengirim data pendapatan 2 tahun.
- **Akurasi**: Baselane dihitung dengan diskon % yang disepakati.
- **Partisipasi**: 100% unit kecil partisipasi dalam redistribusi.
- **Tanda Tangan**: RKA disetujui oleh Rektor dan KDP tanpa ketentuan tambahan.
- **Efisiensi**: Peningkatan kejelasan alokasi dana dan pengelolaan BLU.

---

## 7. Rekomendasi Langsung

1. **Bentuk Tim Projekt** – Gunakan *aa-engineering-sre* untuk memastikan stabilitas sistem.
2. **Definisikan Regulasi Diskon** – Pastikan persentase diskon 2 tahun sudah disepakati oleh Dewan Pembangunan.
3. **Pilot di 2 Fakultas** – Mulai dengan fakultas yang lebih kecil untuk uji coba sebelum scale-up.
4. **Dokumentasi RKA** – Buat template formal RKA yang bisa ditandatangani oleh Rektor dan KDP.

---

*Proposal disusun berdasarkan proses yang Andajelaskan. Untuk implementasi nyata, diperlukan kolaborasi antar unit dan persetujuan Rektor.*