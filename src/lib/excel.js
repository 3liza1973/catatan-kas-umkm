// Ekspor laporan ke berkas Excel (.xlsx). Pustaka exceljs dimuat hanya saat tombol diketuk.
import { bacaIso, isoTanggal, tanggalPanjang } from './format'
import { rincianKategori, trenPeriode } from './hitung'

const FORMAT_RUPIAH = '"Rp" #,##0'
const HIJAU = 'FF0F5F4A'

// Tanggal ditulis sebagai UTC agar tidak bergeser sehari di zona waktu Indonesia.
const tanggalExcel = (iso) => {
  const d = bacaIso(iso)
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
}

function gayaKepala(baris) {
  baris.eachCell((sel) => {
    sel.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    sel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HIJAU } }
    sel.alignment = { vertical: 'middle' }
  })
}

/** Tabel "kategori / jumlah / persentase" dengan baris total berumus SUM. */
function tabelKategori(ws, judul, rincian) {
  ws.addRow([])
  ws.addRow([judul]).font = { bold: true, size: 12 }
  gayaKepala(ws.addRow(['Kategori', 'Jumlah (Rp)', 'Persentase']))

  const awal = ws.rowCount + 1
  const baris = awal + rincian.length - 1
  const barisTotal = baris + 1
  const jumlahTotal = rincian.reduce((n, k) => n + k.jumlah, 0)

  for (const k of rincian) {
    const r = ws.addRow([k.nama, k.jumlah])
    r.getCell(3).value = {
      formula: `IF($B$${barisTotal}=0,0,B${r.number}/$B$${barisTotal})`,
      result: jumlahTotal ? k.jumlah / jumlahTotal : 0,
    }
    r.getCell(2).numFmt = FORMAT_RUPIAH
    r.getCell(3).numFmt = '0%'
  }

  const total = ws.addRow(['Total'])
  total.getCell(2).value = { formula: `SUM(B${awal}:B${baris})`, result: jumlahTotal }
  total.getCell(2).numFmt = FORMAT_RUPIAH
  total.font = { bold: true }
  total.eachCell((sel) => {
    sel.border = { top: { style: 'thin' } }
  })
}

/**
 * Membuat dan mengunduh laporan Excel dengan 3 lembar: Ringkasan (semua kategori
 * pemasukan dan pengeluaran), Transaksi (rincian), dan Tren.
 */
export async function unduhLaporanExcel({
  namaUsaha,
  periode,
  label,
  dari,
  sampai,
  daftar,
  kategori,
}) {
  const { default: ExcelJS } = await import('exceljs')
  const wb = new ExcelJS.Workbook()
  wb.creator = namaUsaha

  const masuk = daftar.filter((t) => t.tipe === 'masuk').reduce((n, t) => n + t.nominal, 0)
  const keluar = daftar.filter((t) => t.tipe === 'keluar').reduce((n, t) => n + t.nominal, 0)

  // ----- Lembar 1: Ringkasan -----
  const ws = wb.addWorksheet('Ringkasan')
  ws.getColumn(1).width = 30
  ws.getColumn(2).width = 20
  ws.getColumn(3).width = 14
  ws.addRow([`Laporan Keuangan - ${namaUsaha}`]).font = { bold: true, size: 14 }
  ws.addRow([`Periode: ${label} (${tanggalPanjang(dari)} s.d. ${tanggalPanjang(sampai)})`])
  ws.addRow([`Dibuat: ${tanggalPanjang(isoTanggal())}`])
  ws.addRow([])
  gayaKepala(ws.addRow(['Ringkasan', 'Jumlah (Rp)']))
  const barisMasuk = ws.addRow(['Total pemasukan', masuk])
  const barisKeluar = ws.addRow(['Total pengeluaran', keluar])
  const barisLaba = ws.addRow(['Laba bersih'])
  barisLaba.getCell(2).value = {
    formula: `B${barisMasuk.number}-B${barisKeluar.number}`,
    result: masuk - keluar,
  }
  barisLaba.font = { bold: true }
  for (const b of [barisMasuk, barisKeluar, barisLaba]) b.getCell(2).numFmt = FORMAT_RUPIAH

  tabelKategori(ws, 'Pemasukan per kategori', rincianKategori(daftar, 'masuk', kategori))
  tabelKategori(ws, 'Pengeluaran per kategori', rincianKategori(daftar, 'keluar', kategori))

  // ----- Lembar 2: Transaksi -----
  const petaKategori = new Map(kategori.map((k) => [k.id, k.nama]))
  const wt = wb.addWorksheet('Transaksi', { views: [{ state: 'frozen', ySplit: 1 }] })
  wt.columns = [
    { header: 'Tanggal', key: 'tanggal', width: 14 },
    { header: 'Waktu', key: 'waktu', width: 9 },
    { header: 'Jenis', key: 'jenis', width: 14 },
    { header: 'Kategori', key: 'kategori', width: 22 },
    { header: 'Catatan', key: 'catatan', width: 34 },
    { header: 'Nominal (Rp)', key: 'nominal', width: 18 },
  ]
  gayaKepala(wt.getRow(1))
  const urut = [...daftar].sort(
    (a, b) => a.tanggal.localeCompare(b.tanggal) || a.waktu.localeCompare(b.waktu) || a.id - b.id,
  )
  for (const t of urut) {
    wt.addRow({
      tanggal: tanggalExcel(t.tanggal),
      waktu: t.waktu,
      jenis: t.tipe === 'masuk' ? 'Pemasukan' : 'Pengeluaran',
      kategori: petaKategori.get(t.kategoriId) ?? 'Tanpa kategori',
      catatan: t.catatan,
      nominal: t.nominal,
    })
  }
  wt.getColumn('tanggal').numFmt = 'dd/mm/yyyy'
  wt.getColumn('nominal').numFmt = FORMAT_RUPIAH
  wt.getRow(1).getCell('nominal').numFmt = 'General'
  wt.autoFilter = { from: 'A1', to: 'F1' }

  // ----- Lembar 3: Tren -----
  const wr = wb.addWorksheet('Tren', { views: [{ state: 'frozen', ySplit: 1 }] })
  wr.columns = [
    {
      header: periode === 'tahun' ? 'Bulan' : periode === 'bulan' ? 'Tanggal' : 'Hari',
      key: 'label',
      width: 14,
    },
    { header: 'Pemasukan (Rp)', key: 'masuk', width: 18 },
    { header: 'Pengeluaran (Rp)', key: 'keluar', width: 18 },
    { header: 'Laba (Rp)', key: 'laba', width: 18 },
  ]
  gayaKepala(wr.getRow(1))
  for (const t of trenPeriode(daftar, periode, isoTanggal())) {
    const r = wr.addRow([t.label, t.masuk, t.keluar])
    r.getCell(4).value = { formula: `B${r.number}-C${r.number}`, result: t.masuk - t.keluar }
  }
  for (const kolom of [2, 3, 4]) wr.getColumn(kolom).numFmt = FORMAT_RUPIAH
  wr.getRow(1).eachCell((s) => (s.numFmt = 'General'))

  // ----- Unduh -----
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const tautan = document.createElement('a')
  tautan.href = URL.createObjectURL(blob)
  tautan.download = `laporan-${periode}-${isoTanggal()}.xlsx`
  tautan.click()
  URL.revokeObjectURL(tautan.href)
}
