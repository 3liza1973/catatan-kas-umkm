// Fungsi bantu untuk format angka dan tanggal (bahasa Indonesia).
// Tanggal disimpan sebagai teks 'YYYY-MM-DD' (zona waktu lokal) agar mudah dibandingkan.

const pad = (n) => String(n).padStart(2, '0')

const formatRupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})
const formatAngka = new Intl.NumberFormat('id-ID')

export const rupiah = (n) => formatRupiah.format(n).replace(/\u00a0/g, ' ')
export const angka = (n) => formatAngka.format(n)

/** Mengubah teks seperti "1.250.000" menjadi angka 1250000. */
export const urai = (teks) => Number(String(teks).replace(/\D/g, '') || 0)

export const isoTanggal = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const jam = (d = new Date()) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

export const bacaIso = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Menggeser tanggal ISO sebanyak `hari` (boleh negatif). */
export const geser = (iso, hari) => {
  const d = bacaIso(iso)
  d.setDate(d.getDate() + hari)
  return isoTanggal(d)
}

const tanggalPanjangFmt = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const bulanTahunFmt = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' })
const hariFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'short' })
const bulanSingkatFmt = new Intl.DateTimeFormat('id-ID', { month: 'short' })

export const tanggalPanjang = (iso) => tanggalPanjangFmt.format(bacaIso(iso))
export const bulanTahun = (d = new Date()) => bulanTahunFmt.format(d)
export const hariSingkat = (iso) => hariFmt.format(bacaIso(iso))
export const bulanSingkat = (indeks, tahun) => bulanSingkatFmt.format(new Date(tahun, indeks, 1))

export const labelHari = (iso) => {
  const hariIni = isoTanggal()
  if (iso === hariIni) return 'Hari ini'
  if (iso === geser(hariIni, -1)) return 'Kemarin'
  return tanggalPanjang(iso)
}

export const sapaan = (d = new Date()) => {
  const h = d.getHours()
  if (h < 11) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 18) return 'Selamat sore'
  return 'Selamat malam'
}

export const inisial = (nama = '') =>
  nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k[0]?.toUpperCase() ?? '')
    .join('') || '?'
