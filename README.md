# VIMCS Offline - Sounding Tera Tangki Jetty

Aplikasi web **React + Tailwind CSS** yang dirancang dengan pendekatan **Offline-First** untuk operasional lapangan di Jetty. Memungkinkan operator/checker mengukur ketinggian sounding (cm) tiap tangki, menghitung volume berdasarkan faktor tera master tangki (misal: 1 cm = 66 L atau 1 cm = 67 L), dan mengakumulasikan volume keseluruhan secara langsung di browser tanpa memerlukan koneksi internet, lalu menyinkronkannya ke backend Django saat online.

---

## 🚀 Fitur Utama

1. **Offline-First Storage**:
   - Berjalan 100% offline di browser (HP, tablet, maupun laptop lapangan) menggunakan LocalStorage terstruktur.
   - Master tangki bawaan sudah ter-seed secara otomatis (`TK-JETTY-01` @ 66 L/cm dan `TK-JETTY-02` @ 67 L/cm).
   - Data riwayat sounding tetap aman tersimpan meskipun browser ditutup atau HP direstart.

2. **Live Auto-Calculation (Real-time)**:
   - Input nilai sounding dalam centimeter (cm) untuk masing-masing tangki.
   - Volume tiap tangki dihitung secara instan: $\text{Volume (L)} = \text{sounding (cm)} \times \text{liter per cm}$.
   - Kotak akumulasi menampilkan **Total Sounding (cm)** dan **Total Akumulasi Volume (Liter)** secara real-time.

3. **CRUD Master Tangki Jetty**:
   - Kelola daftar tangki, ubah nilai konversi tera per centimeter (misal dari 66 L/cm ke 67 L/cm).
   - Tambah tangki baru di Jetty kapan saja.
   - Tarik master tangki terbaru dari Django server dengan 1 klik.

4. **Riwayat Sounding & Manajemen Data**:
   - Daftar riwayat sesi sounding per shift, tanggal, dan nama checker.
   - Status badge yang jelas: **🟡 Offline (Belum Disinkron)** vs **🟢 Tersinkron**.
   - Edit, hapus, dan lihat modal rincian kalkulasi.

5. **Sinkronisasi Dua Arah dengan Django Backend**:
   - Mendukung endpoint `GET /api/jetty-tanks/` untuk update master tangki.
   - Mendukung endpoint `POST /api/jetty-calculations/bulk-sync/` untuk mengirim batch rekaman offline ke server.
   - Tombol manual sync & auto-sync ketika mendeteksi koneksi online.
   - Fitur ekspor backup lokal ke file `.json`.

6. **Desain Ringan & Mobile-Responsive**:
   - Dibuat dengan Tailwind CSS yang ringan dan bersih (*clean admin style*).
   - Navigasi responsif dengan *bottom navigation bar* khusus tampilan smartphone.

---

## 🛠️ Cara Menjalankan

### Prasyarat
- Node.js (v18+)
- Backend Django (`fmsbot-backend`) berjalan di `http://127.0.0.1:8000` (opsional jika ingin sync)

### Menjalankan Development Server
```bash
cd vimcs-offline
npm run dev
```
Aplikasi akan terbuka di `http://localhost:5174`.

### Membangun Production Build
```bash
npm run build
```
Hasil build siap saji berada di folder `dist/` (dapat di-host via Nginx, Caddy, atau Webview Mobile).
