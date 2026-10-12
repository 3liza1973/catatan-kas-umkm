# Catatan Kas UMKM

Aplikasi web untuk mencatat pemasukan dan pengeluaran usaha kecil (warung, toko, jasa). Data tersimpan di perangkat pengguna, jadi **tidak perlu akun, server, atau internet**. Aplikasi bisa dipasang di layar utama ponsel (PWA).

## Fitur
- **Beranda:** saldo kas, ringkasan bulan ini, grafik laba 7 hari, dan transaksi terbaru.
- **Catat transaksi:** pemasukan atau pengeluaran, nominal berformat Rupiah, kategori, catatan, dan tanggal.
- **Riwayat:** pencarian, filter jenis, dan pengelompokan per tanggal.
- **Detail transaksi:** ubah dan hapus (dengan konfirmasi).
- **Laporan:** periode minggu, bulan, dan tahun; grafik, rincian pengeluaran per kategori, dan unduh laporan Excel (.xlsx) berisi ringkasan, semua kategori pemasukan dan pengeluaran, rincian transaksi, dan tren.
- **Kelola kategori:** tambah dan hapus kategori sendiri.
- **Profil:** data usaha, cadangan dan pemulihan data (JSON), dan hapus semua transaksi.
- **Login:** daftar, masuk, keluar, dan ganti kata sandi. Setiap akun punya data sendiri yang terpisah.
- **Onboarding:** layar pembuka yang tampil sekali untuk pengguna baru.

## Teknologi
React 19 + Vite, Tailwind CSS 4, React Router (HashRouter), Dexie (IndexedDB), Recharts, ExcelJS, vite-plugin-pwa.

## Menjalankan
Membutuhkan Node.js versi LTS (disarankan 20 atau lebih baru).

```bash
npm install
npm run dev       # mode pengembangan, buka alamat yang tampil di terminal
npm run build     # hasil produksi di folder dist
npm run preview   # mencoba hasil build (termasuk mode PWA)
npm run lint      # memeriksa kode
```

Untuk demo cepat: buka aplikasi, selesaikan layar pembuka, buat akun, lalu catat transaksi pertamamu lewat tombol **Catat** di Beranda.

## Tentang login
Login berjalan **lokal di perangkat**: akun disimpan di IndexedDB, kata sandi di-hash dengan PBKDF2 (SHA-256, garam acak, 150.000 iterasi) lewat Web Crypto, dan data tiap akun berada di database terpisah. Karena tidak ada server, akun tidak ikut berpindah antarperangkat dan kata sandi yang lupa tidak bisa dipulihkan. Untuk sinkronisasi antarperangkat dibutuhkan backend (misalnya Firebase atau Supabase).

Web Crypto hanya tersedia lewat **HTTPS atau `localhost`**. Saat menguji di ponsel lewat alamat IP jaringan (http), daftar dan masuk akan gagal. Gunakan versi yang dipublikasikan (HTTPS) atau `localhost`.

## Struktur folder
```
src/
  auth.js            # akun, hash kata sandi, dan sesi
  db.js              # database per akun dan fungsi data (simpan, hapus, cadangan)
  lib/format.js      # format Rupiah dan tanggal
  lib/hitung.js      # perhitungan ringkasan, tren, dan kategori
  hooks/useData.js   # hook pembaca data langsung dari database
  components/        # komponen bersama (menu bawah, dialog, toast, item transaksi)
  pages/             # satu berkas per halaman
  App.jsx            # daftar rute
```

## Catatan
- Data bersifat lokal per perangkat dan peramban. Gunakan **Cadangkan data** di Profil untuk memindahkan data.
- Nama aplikasi bisa diganti di `index.html` dan `vite.config.js` (bagian `manifest`).
