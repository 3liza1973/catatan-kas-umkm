import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import JudulHalaman from '../components/JudulHalaman'
import { useToast } from '../components/Toast'
import { db, hapusTransaksi } from '../db'
import { useKategoriMap } from '../hooks/useData'
import { rupiah, tanggalPanjang } from '../lib/format'

export default function Detail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const tampil = useToast()
  const petaKategori = useKategoriMap()
  const transaksi = useLiveQuery(() => db.transaksi.get(Number(id)), [id])
  const [konfirmasi, setKonfirmasi] = useState(false)

  if (transaksi === undefined) return null
  if (!transaksi) {
    return (
      <>
        <JudulHalaman kembali ke="/riwayat">
          Detail Transaksi
        </JudulHalaman>
        <p className="text-muted">
          Transaksi tidak ditemukan.{' '}
          <Link to="/riwayat" className="font-semibold text-brand">
            Kembali ke riwayat
          </Link>
        </p>
      </>
    )
  }

  const masuk = transaksi.tipe === 'masuk'
  const baris = [
    ['Kategori', petaKategori.get(transaksi.kategoriId)?.nama ?? 'Tanpa kategori'],
    ['Tanggal', tanggalPanjang(transaksi.tanggal)],
    ['Waktu', transaksi.waktu],
    ['Catatan', transaksi.catatan || '-'],
  ]

  const hapus = async () => {
    await hapusTransaksi(transaksi.id)
    tampil('Transaksi dihapus')
    navigate('/riwayat', { replace: true })
  }

  return (
    <>
      <JudulHalaman kembali ke="/riwayat">
        Detail Transaksi
      </JudulHalaman>

      <section
        className={`rounded-3xl p-6 text-center text-white ${masuk ? 'bg-brand' : 'bg-expense'}`}
      >
        <p className="text-sm opacity-85">{masuk ? 'Pemasukan' : 'Pengeluaran'}</p>
        <p className="mt-1 text-4xl font-bold">{rupiah(transaksi.nominal)}</p>
      </section>

      <dl className="mt-4 rounded-2xl bg-white px-4">
        {baris.map(([k, v]) => (
          <div
            key={k}
            className="flex justify-between gap-4 border-b border-track py-3.5 text-sm last:border-0"
          >
            <dt className="text-muted">{k}</dt>
            <dd className="text-right font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          to={`/catat/${transaksi.id}`}
          className="flex h-14 items-center justify-center rounded-2xl bg-accent font-bold"
        >
          Ubah transaksi
        </Link>
        <button
          type="button"
          onClick={() => setKonfirmasi(true)}
          className="h-14 rounded-2xl border-2 border-expense font-bold text-expense"
        >
          Hapus transaksi
        </button>
      </div>

      <ConfirmDialog
        buka={konfirmasi}
        judul="Hapus transaksi ini?"
        isi="Transaksi yang dihapus tidak bisa dikembalikan."
        labelYa="Hapus"
        onYa={hapus}
        onBatal={() => setKonfirmasi(false)}
      />
    </>
  )
}
