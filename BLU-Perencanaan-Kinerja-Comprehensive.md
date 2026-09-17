# Proposal: Aplikasi Perencanaan BLU Berbasis Kinerja
## Universitas Teuku Umar (UTU) – Referensi UTU, UNAIR, UB, UM

---

## 1. Latar Belakang

### 1.1 Universitas Teuku Umar (UTU)
- UTU ditetapkan sebagai Instansi Pemerintah yang menerapkan Pengelolaan Keuangan BLU (Badan Layanan Umum) berdasarkan Keputusan Menteri Keuangan RI.
- Sistem pengelolaan keuangan UTU perlu disempurnakan dengan pendekatan berbasis kinerja.
- Proses alokasi dana belum terintegrasi dengan indikator kinerja unit terkecil (Jurusan/Departemen/Prodi).

### 1.2 Referensi SAKTI Kemenkeu
- **SAKTI** adalah Sistem Aplikasi Keuangan Tingkat Instansi yang mengintegrasikan proses perencanaan, penganggaran, pelaksanaan, dan pertanggungjawaban anggaran.
- Semua transaksi entitas akuntansi dan pelaporan dilakukan secara elektronik melalui single database.
- **Referensi**: [SAKTI - DJPb Kemenkeu](https://djpb.kemenkeu.go.id/kppn/barabai/id/layanan/layanan-satker/3008-sakti.html)

### 1.3 Universitas Airlangga (UNAIR)
- **BPP UNAIR** (Badan Perencanaan dan Pengembangan) mengembangkan sistem perencanaan terintegrasi untuk meningkatkan efisiensi pengelolaan pendidikan.
- **SIMGO** (Sistem Informasi Manajemen Global) digunakan untuk pelaporan dan verifikasi Indikator Kinerja Utama (IKU).
- **SKP** (Sistem Penilaian Kinerja) untuk evaluasi kinerja pegawai.
- **Benchmark UNAIR 2026**: Penguatan sistem informasi terintegrasi berbasis AI, pengelolaan keuangan satu pintu.
- **Referensi**: [BPP UNAIR](https://bpp.unair.ac.id/benchmark/)

### 1.4 Universitas Brawijaya (UB)
- **eKinerja BKN** untuk pengisian SKP pengelolaan kinerja pegawa.
- **SK BLU UB** ditetapkan berdasarkan Keputusan Menteri Keuangan.
- UB menerapkan pendekatan anggaran berbasis kinerja untuk reformasi pengelolaan keuangan.
- **Referensi**: [SK BLU UB](https://www.ub.ac.id/unduhan/sk-blu-ub/)

### 1.5 Universitas Negeri Malang (UM)
- UM ditetapkan sebagai BLU sejak 2008 (Keputusan Menteri Keuangan No. 279/KMK.05/2008).
- **Sistem Perencanaan Anggaran Berbasis Kinerja** dibangun dengan pendekatan modern.
- **Laporan Kinerja LAKIN 2023 UM**: Sistem perencanaan anggaran berbasis kinerja terimplementasi.
- **Referensi**: [LAKIN UM 2023](https://um.ac.id/wp-content/uploads/2024/02/LAKIN2023.pdf)

---

## 2. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE OF BLU PLANNING SYSTEM               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  Unit Kecil  │    │  Fakultas    │    │  Rektor &    │          │
│  │  (Jurusan/    │    │  (Alokasi    │    │  KDP)        │          │
│  │   Dept/Prodi) │    │  Dana)        │    │              │          │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘          │
│         │                   │                   │                    │
│         ▼                   ▼                   ▼                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                  CENTRAL BLU PLANNING ENGINE                  │   │
│  │  • Data Ingestion (dari semua unit kecil)                    │   │
│  │  • Baselane Calculation (2-year revenue - discount %)       │   │
│  │  • Allocation Logic (proporsional/need-based)                │   │
│  │  • Distribution Engine (ke unit smallest)                    │   │
│  │  • Verification Module (Kepala Unit Kerja)                   │   │
│  │  • RKA Generation & Signing (Rektor + KDP)                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    INTEGRATION LAYER                          ││
│  │  • BLU-UNAIR (SIMGO integration)                              ││
│  │  • BLU-UB (eKinerja integration)                             ││
│  │  • BLU-UM (LAKIN integration)                                ││
│  │  • SAKTI-like core (planning, disbursement, accountability)   ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Proses Perencanaan & Pengelolaan Kinerja BLU

### 3.1 Alur Data

1. **Input Baseline** – Setiap unit kecil (Jurusan/Departemen/Prodi) mengunggah laporan pendapatan 2 tahun terakhir.
2. **Perhitungan Baselane** – Sistem menghitung:
   ```
   Baselane = Pendapatan 2 tahun - (Diskon % sesuai PMK.05/2021)
   ```
3. **Alokasi Dana** – Fakultas menerima total baseline dan membaginya ke unit kecil berdasarkan:
   - Kapasitas (jumlah mahasiswa, dosen)
   - Pandangan prioritas fakultas
   - Kebutuhan operasional
4. **Redistribusi** – Setiap fakultas membagi alokasi ke unit kecilnya (Jurusan/Departemen/Prodi).
5. **Verifikasi** – Kepala unit kecil memastikan distribusi sesuai kebutuhan.
6. **Tanda Tangan RKA** – Rektor dan Ketua Dewan Pegawas (KDP) menandatangani RKA.
7. **Implementasi** – Unit kecil menggunakan alokasi untuk kegiatan BLU mereka.

### 3.2 Referensi SAKTI Kemenkeu (PMK.05/2021)
1. **Perencanaan** – Susun RKA/Budget berbasis kinerja.
2. **Penganggaran** – Alokasi dana ke unit kerja.
3. **Pelaksanaan** – Penggunaan dana sesuai anggaran.
4. **Pertanggungjawaban** – Laporan realisasi dan akuntansi.

### 3.3 Peran & Tanggung Jawab

| Level | Peran | Tanggung Jawab |
|-------|-------|----------------|
| **Unit Kecil** (Jurusan/Departemen/Prodi) | Input data pendapatan 2 tahun | Menyediakan data akurat sebagai basis perhitungan Baselane |
| **Kepala Unit Kerja** | Verifikasi data & alokasi | Memastikan data valid dan alokasi sesuai kebutuhan |
| **Fakultas** | Alokasi dana | Membagi baseline ke unit kecil |
| **Satuan Pengawas Internal (SPI)** | Review tingkat rektorat | Verifikasi independen atas RKA |
| **Rektor** | Tanda tangan RKA | Menandatangani rekomendasi kinerja |
| **KDP (Koordinator Dewan Pegawas)** | Tanda tangan RKA | Mengawasi kepatuhan dan integritas |

### 3.4 Timeline Implementasi (7 Bulan)

| Bulan | Karya |
|-------|-------|
| **Bulan 1–2** | Rancangan sistem & standar input data (referensi SAKTI, UNAIR, UB, UM) |
| **Bulan 3** | Pilot uji coba dengan 2 fakultas |
| **Bulan 4** | Perbaikan & finalisasi algoritma Baselane (sesuai PMK.05/2021) |
| **Bulan 5** | Training untuk kepala unit kecil & rektor |
| **Bulan 6** | Implementasi full-scale di seluruh universitas |
| **Bulan 7** | Review & penandatanganan RKA oleh Rektor & KDP |

---

## 4. KPIs Indikator Keberhasilan

- **Transparansi**: 100% unit kecil dapat mengirim data pendapatan 2 tahun.
- **Akurasi**: Baselane dihitung dengan diskon % yang disepakati (PMK.05/2021).
- **Partisipasi**: 100% unit kecil partisipasi dalam redistribusi.
- **Tanda Tangan**: RKA disetujui oleh Rektor & KDP tanpa ketentuan tambahan.
- **Efisiensi**: Peningkatan kejelasan alokasi dana dan pengelolaan BLU.

---

## 5. Rekomendasi Langsung

1. **Bentuk Tim Projekt** – Gunakan *aa-engineering-sre* untuk memastikan stabilitas sistem.
2. **Definisikan Regulasi Diskon** – Pastikan persentase diskon 2 tahun sudah disepakati oleh Dewan Pembangunan sesuai PMK.05/2021.
3. **Pilot di 2 Fakultas** – Mulai dengan fakultas yang lebih kecil untuk uji coba sebelum scale-up.
4. **Buatlah Template Formal RKA** – Sertakan referensi dari UTU, UNAIR, UB, UM.
5. **Integrasi Referensi** – Sistem akan mengintegrasikan data dari SIMGO UNAIR, eKinerja UB, dan LAKIN UM.

---

*Proposal disusun berdasarkan proses yang Andajelaskan. Untuk implementasi nyata, diperlukan kolaborasi antar unit dan persetujuan Rektor.*