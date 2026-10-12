// Perhitungan ringkasan, tren, dan pengelompokan transaksi.
import { bacaIso, bulanSingkat, geser, hariSingkat, isoTanggal } from './format'

export const total = (daftar, tipe) =>
  daftar.filter((t) => t.tipe === tipe).reduce((jumlah, t) => jumlah + t.nominal, 0)

export function ringkasan(daftar) {
  const masuk = total(daftar, 'masuk')
  const keluar = total(daftar, 'keluar')
  return { masuk, keluar, laba: masuk - keluar }
}

/** Urutan terbaru di atas: tanggal, lalu jam, lalu id. */
export const urutkanTerbaru = (daftar) =>
  [...daftar].sort(
    (a, b) => b.tanggal.localeCompare(a.tanggal) || b.waktu.localeCompare(a.waktu) || b.id - a.id,
  )

export const dalamRentang = (daftar, dari, sampai) =>
  daftar.filter((t) => t.tanggal >= dari && t.tanggal <= sampai)

/** Laba per hari untuk `jumlahHari` hari yang berakhir pada `akhir`. */
export function labaHarian(daftar, akhir, jumlahHari) {
  return Array.from({ length: jumlahHari }, (_, i) => {
    const tanggal = geser(akhir, i - (jumlahHari - 1))
    const { laba } = ringkasan(daftar.filter((t) => t.tanggal === tanggal))
    return { tanggal, label: hariSingkat(tanggal), laba }
  })
}

/**
 * Total per kategori untuk satu jenis transaksi. SEMUA kategori jenis itu disertakan
 * (jumlah 0 jika belum ada transaksi), diurutkan dari yang terbesar.
 */
export function rincianKategori(daftar, tipe, kategori) {
  const jumlah = new Map()
  for (const t of daftar.filter((x) => x.tipe === tipe)) {
    jumlah.set(t.kategoriId, (jumlah.get(t.kategoriId) ?? 0) + t.nominal)
  }
  const rincian = kategori
    .filter((k) => k.tipe === tipe)
    .map((k) => ({ nama: k.nama, jumlah: jumlah.get(k.id) ?? 0 }))
  // Transaksi yang kategorinya sudah tidak ada (mis. dari data impor) tetap dihitung.
  const dikenal = new Set(kategori.map((k) => k.id))
  const tanpa = [...jumlah].filter(([id]) => !dikenal.has(id)).reduce((n, [, v]) => n + v, 0)
  if (tanpa) rincian.push({ nama: 'Tanpa kategori', jumlah: tanpa })
  return rincian.sort((x, y) => y.jumlah - x.jumlah || x.nama.localeCompare(y.nama))
}

/** Menentukan rentang tanggal dan label untuk periode laporan. */
export function rentangPeriode(periode, hariIni = isoTanggal()) {
  const d = bacaIso(hariIni)
  if (periode === 'minggu') {
    return { dari: geser(hariIni, -6), sampai: hariIni, label: '7 hari terakhir' }
  }
  if (periode === 'tahun') {
    const y = d.getFullYear()
    return { dari: `${y}-01-01`, sampai: `${y}-12-31`, label: String(y) }
  }
  const awal = new Date(d.getFullYear(), d.getMonth(), 1)
  const akhir = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return { dari: isoTanggal(awal), sampai: isoTanggal(akhir), label: null }
}

/** Data grafik pemasukan vs pengeluaran: harian (minggu/bulan) atau bulanan (tahun). */
export function trenPeriode(daftar, periode, hariIni = isoTanggal()) {
  const { dari, sampai } = rentangPeriode(periode, hariIni)
  if (periode === 'tahun') {
    const y = bacaIso(hariIni).getFullYear()
    return Array.from({ length: 12 }, (_, m) => {
      const awalBulan = `${y}-${String(m + 1).padStart(2, '0')}`
      const { masuk, keluar } = ringkasan(daftar.filter((t) => t.tanggal.startsWith(awalBulan)))
      return { label: bulanSingkat(m, y), masuk, keluar }
    })
  }
  const jumlahHari = Math.round((bacaIso(sampai) - bacaIso(dari)) / 86400000) + 1
  return Array.from({ length: jumlahHari }, (_, i) => {
    const tanggal = geser(dari, i)
    const { masuk, keluar } = ringkasan(daftar.filter((t) => t.tanggal === tanggal))
    return { label: periode === 'minggu' ? hariSingkat(tanggal) : String(i + 1), masuk, keluar }
  })
}
