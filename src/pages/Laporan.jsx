import { useMemo, useState } from 'react'
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import JudulHalaman from '../components/JudulHalaman'
import KosongTransaksi from '../components/KosongTransaksi'
import { useToast } from '../components/Toast'
import { useKategori, usePengaturan, useTransaksi } from '../hooks/useData'
import { unduhLaporanExcel } from '../lib/excel'
import { bulanTahun, isoTanggal, rupiah } from '../lib/format'
import {
  dalamRentang,
  rentangPeriode,
  rincianKategori,
  ringkasan,
  trenPeriode,
} from '../lib/hitung'

const PERIODE = [
  ['minggu', 'Minggu'],
  ['bulan', 'Bulan'],
  ['tahun', 'Tahun'],
]

/** Daftar kategori dengan bar proporsional; semua kategori tampil, termasuk yang Rp 0. */
function DaftarKategori({ judul, rincian, warna }) {
  const terbesar = Math.max(...rincian.map((k) => k.jumlah), 1)
  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-white p-4">
      <h2 className="text-sm font-bold">{judul}</h2>
      {rincian.map((k) => (
        <div key={k.nama}>
          <div className="flex justify-between text-sm">
            <span className={k.jumlah === 0 ? 'text-muted' : ''}>{k.nama}</span>
            <span className="font-semibold">{rupiah(k.jumlah)}</span>
          </div>
          <div className="mt-1 h-2.5 rounded-full bg-track">
            <div
              className={`h-2.5 rounded-full ${warna}`}
              style={{ width: `${(k.jumlah / terbesar) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </section>
  )
}

export default function Laporan() {
  const transaksi = useTransaksi()
  const kategori = useKategori()
  const profil = usePengaturan('profil')
  const tampil = useToast()
  const [periode, setPeriode] = useState('bulan')
  const [mengunduh, setMengunduh] = useState(false)
  const hariIni = isoTanggal()

  const data = useMemo(() => {
    const { dari, sampai, label } = rentangPeriode(periode, hariIni)
    const daftar = dalamRentang(transaksi ?? [], dari, sampai)
    return {
      dari,
      sampai,
      daftar,
      label: label ?? bulanTahun(),
      ringkas: ringkasan(daftar),
      pemasukan: rincianKategori(daftar, 'masuk', kategori ?? []),
      pengeluaran: rincianKategori(daftar, 'keluar', kategori ?? []),
      tren: trenPeriode(transaksi ?? [], periode, hariIni),
    }
  }, [transaksi, kategori, periode, hariIni])

  if (!transaksi || !kategori) return null

  const unduh = async () => {
    setMengunduh(true)
    try {
      await unduhLaporanExcel({
        namaUsaha: profil?.namaUsaha ?? 'Usaha',
        periode,
        label: data.label,
        dari: data.dari,
        sampai: data.sampai,
        daftar: data.daftar,
        kategori,
      })
      tampil('Laporan Excel diunduh')
    } catch {
      tampil('Laporan gagal dibuat. Coba lagi.')
    } finally {
      setMengunduh(false)
    }
  }

  return (
    <>
      <JudulHalaman>Laporan</JudulHalaman>
      {transaksi.length === 0 ? (
        <KosongTransaksi />
      ) : (
        <div className="flex flex-col gap-4">
          <div role="group" aria-label="Periode laporan" className="flex rounded-2xl bg-track p-1">
            {PERIODE.map(([nilai, label]) => (
              <button
                key={nilai}
                type="button"
                aria-pressed={periode === nilai}
                onClick={() => setPeriode(nilai)}
                className={`h-11 flex-1 rounded-xl text-sm font-semibold ${
                  periode === nilai ? 'bg-brand text-white' : ''
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <section className="rounded-3xl bg-brand p-5 text-white">
            <p className="text-sm opacity-85">Laba bersih · {data.label}</p>
            <p className="mt-1 text-3xl font-bold">{rupiah(data.ringkas.laba)}</p>
            <div className="mt-4 flex gap-3">
              <div className="flex-1 text-xs">
                Pemasukan
                <p className="text-base font-bold">{rupiah(data.ringkas.masuk)}</p>
              </div>
              <div className="flex-1 text-xs">
                Pengeluaran
                <p className="text-base font-bold">{rupiah(data.ringkas.keluar)}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-4">
            <h2 className="text-sm font-bold">Pemasukan dan pengeluaran</h2>
            <div className="mt-3 h-52" role="img" aria-label="Grafik pemasukan dan pengeluaran">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.tren}>
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    interval="preserveStartEnd"
                  />
                  <Tooltip formatter={(v) => rupiah(v)} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="masuk" name="Pemasukan" fill="#0f5f4a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="keluar" name="Pengeluaran" fill="#e8833a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <DaftarKategori
            judul="Pemasukan per kategori"
            rincian={data.pemasukan}
            warna="bg-brand"
          />
          <DaftarKategori
            judul="Pengeluaran per kategori"
            rincian={data.pengeluaran}
            warna="bg-accent"
          />

          <button
            type="button"
            onClick={unduh}
            disabled={mengunduh}
            className="min-h-14 rounded-2xl bg-accent font-bold disabled:opacity-60"
          >
            {mengunduh ? 'Menyiapkan laporan...' : 'Unduh laporan Excel'}
          </button>
          <p className="-mt-2 text-center text-xs text-muted">
            Berisi ringkasan, semua kategori pemasukan dan pengeluaran, rincian transaksi, dan tren.
          </p>
        </div>
      )}
    </>
  )
}
