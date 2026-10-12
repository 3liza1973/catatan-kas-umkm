import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link, useNavigate, useParams } from 'react-router-dom'
import JudulHalaman from '../components/JudulHalaman'
import { useToast } from '../components/Toast'
import { db, simpanTransaksi } from '../db'
import { useKategori } from '../hooks/useData'
import { angka, isoTanggal, jam, urai } from '../lib/format'

const BATAS_NOMINAL = 999_999_999_999

/** Halaman tambah transaksi (/catat) dan ubah transaksi (/catat/:id). */
export default function Catat() {
  const { id } = useParams()
  const kategori = useKategori()
  const lama = useLiveQuery(() => (id ? db.transaksi.get(Number(id)) : null), [id])

  if (!kategori || lama === undefined) return null
  if (id && !lama) {
    return (
      <>
        <JudulHalaman kembali>Ubah Transaksi</JudulHalaman>
        <p className="text-muted">
          Transaksi tidak ditemukan.{' '}
          <Link to="/riwayat" className="font-semibold text-brand">
            Kembali ke riwayat
          </Link>
        </p>
      </>
    )
  }
  return <FormTransaksi key={id ?? 'baru'} awal={lama} kategori={kategori} />
}

function FormTransaksi({ awal, kategori }) {
  const navigate = useNavigate()
  const tampil = useToast()
  const [tipe, setTipe] = useState(awal?.tipe ?? 'masuk')
  const [nominal, setNominal] = useState(awal?.nominal ?? 0)
  const [kategoriId, setKategoriId] = useState(awal?.kategoriId ?? null)
  const [catatan, setCatatan] = useState(awal?.catatan ?? '')
  const [tanggal, setTanggal] = useState(awal?.tanggal ?? isoTanggal())
  const [galat, setGalat] = useState('')

  const pilihan = kategori.filter((k) => k.tipe === tipe)
  // Jika jenis berganti, kategori yang dipilih otomatis kembali ke yang pertama.
  const kategoriAktif = pilihan.some((k) => k.id === kategoriId) ? kategoriId : pilihan[0]?.id

  const simpan = async (e) => {
    e.preventDefault()
    if (nominal <= 0) return setGalat('Isi nominal lebih dari Rp 0.')
    if (!kategoriAktif) return setGalat('Pilih kategori dulu.')
    if (!tanggal) return setGalat('Pilih tanggal transaksi.')
    await simpanTransaksi({
      id: awal?.id,
      tipe,
      nominal,
      kategoriId: kategoriAktif,
      catatan: catatan.trim(),
      tanggal,
      waktu: awal?.waktu ?? jam(),
    })
    tampil(awal ? 'Perubahan tersimpan' : 'Transaksi tersimpan')
    navigate(awal ? `/transaksi/${awal.id}` : '/', { replace: true })
  }

  const warnaFokus = tipe === 'masuk' ? 'border-brand' : 'border-expense'

  return (
    <form onSubmit={simpan} className="flex flex-col gap-5" noValidate>
      <JudulHalaman kembali>{awal ? 'Ubah Transaksi' : 'Catat Transaksi'}</JudulHalaman>

      <div role="group" aria-label="Jenis transaksi" className="flex rounded-2xl bg-track p-1">
        {[
          ['masuk', 'Pemasukan'],
          ['keluar', 'Pengeluaran'],
        ].map(([nilai, label]) => (
          <button
            key={nilai}
            type="button"
            aria-pressed={tipe === nilai}
            onClick={() => setTipe(nilai)}
            className={`h-11 flex-1 rounded-xl text-sm font-semibold ${
              tipe === nilai ? 'bg-brand text-white' : ''
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        <label htmlFor="nominal" className="text-sm text-muted">
          Nominal
        </label>
        <div
          className={`mt-1.5 flex h-16 items-center gap-2 rounded-2xl border-2 bg-white px-4 ${warnaFokus}`}
        >
          <span className="text-2xl font-bold text-muted">Rp</span>
          <input
            id="nominal"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            value={nominal ? angka(nominal) : ''}
            onChange={(e) => setNominal(Math.min(urai(e.target.value), BATAS_NOMINAL))}
            className="w-full bg-transparent text-3xl font-bold outline-none"
          />
        </div>
      </div>

      <div>
        <p className="text-sm text-muted">Kategori</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {pilihan.map((k) => (
            <button
              key={k.id}
              type="button"
              aria-pressed={k.id === kategoriAktif}
              onClick={() => setKategoriId(k.id)}
              className={`h-11 rounded-full px-4 text-sm font-semibold ${
                k.id === kategoriAktif ? 'bg-brand text-white' : 'bg-white'
              }`}
            >
              {k.nama}
            </button>
          ))}
          <Link
            to="/kategori"
            className="flex h-11 items-center px-2 text-sm font-semibold text-brand"
          >
            Kelola
          </Link>
        </div>
      </div>

      <div>
        <label htmlFor="catatan" className="text-sm text-muted">
          Catatan (opsional)
        </label>
        <input
          id="catatan"
          value={catatan}
          maxLength={80}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Contoh: penjualan harian"
          className="mt-1.5 h-12 w-full rounded-2xl bg-white px-4"
        />
      </div>

      <div>
        <label htmlFor="tanggal" className="text-sm text-muted">
          Tanggal
        </label>
        <input
          id="tanggal"
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="mt-1.5 h-12 w-full rounded-2xl bg-white px-4"
        />
      </div>

      {galat && (
        <p role="alert" className="text-sm font-semibold text-expense">
          {galat}
        </p>
      )}

      <button type="submit" className="h-14 rounded-2xl bg-accent text-base font-bold">
        Simpan transaksi
      </button>
    </form>
  )
}
