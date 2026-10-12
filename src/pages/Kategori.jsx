import { useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import JudulHalaman from '../components/JudulHalaman'
import { useToast } from '../components/Toast'
import { hapusKategori, tambahKategori } from '../db'
import { useKategori, useTransaksi } from '../hooks/useData'

export default function Kategori() {
  const kategori = useKategori()
  const transaksi = useTransaksi()
  const tampil = useToast()
  const [tipe, setTipe] = useState('keluar')
  const [nama, setNama] = useState('')
  const [galat, setGalat] = useState('')
  const [dihapus, setDihapus] = useState(null)

  if (!kategori || !transaksi) return null

  const daftar = kategori.filter((k) => k.tipe === tipe)
  const jumlahPakai = (id) => transaksi.filter((t) => t.kategoriId === id).length

  const tambah = async (e) => {
    e.preventDefault()
    const hasil = await tambahKategori(tipe, nama)
    if (!hasil.ok) return setGalat(hasil.pesan)
    setNama('')
    setGalat('')
    tampil('Kategori ditambahkan')
  }

  const hapus = async () => {
    const hasil = await hapusKategori(dihapus.id)
    setDihapus(null)
    tampil(hasil.ok ? 'Kategori dihapus' : hasil.pesan)
  }

  return (
    <>
      <JudulHalaman kembali ke="/profil">
        Kelola Kategori
      </JudulHalaman>

      <div role="group" aria-label="Jenis kategori" className="flex rounded-2xl bg-track p-1">
        {[
          ['masuk', 'Pemasukan'],
          ['keluar', 'Pengeluaran'],
        ].map(([nilai, label]) => (
          <button
            key={nilai}
            type="button"
            aria-pressed={tipe === nilai}
            onClick={() => {
              setTipe(nilai)
              setGalat('')
            }}
            className={`h-11 flex-1 rounded-xl text-sm font-semibold ${tipe === nilai ? 'bg-brand text-white' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {daftar.map((k) => (
          <li
            key={k.id}
            className="flex min-h-[60px] items-center justify-between rounded-2xl bg-white pr-2 pl-4"
          >
            <div>
              <p className="text-sm font-semibold">{k.nama}</p>
              <p className="text-xs text-muted">{jumlahPakai(k.id)} transaksi</p>
            </div>
            <button
              type="button"
              onClick={() => setDihapus(k)}
              aria-label={`Hapus kategori ${k.nama}`}
              className="h-11 rounded-xl px-3 text-sm font-semibold text-expense"
            >
              Hapus
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={tambah} className="mt-5">
        <label htmlFor="nama-kategori" className="text-sm text-muted">
          Kategori {tipe === 'masuk' ? 'pemasukan' : 'pengeluaran'} baru
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            id="nama-kategori"
            value={nama}
            maxLength={30}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Sewa tempat"
            className="h-12 min-w-0 flex-1 rounded-2xl bg-white px-4"
          />
          <button type="submit" className="h-12 rounded-2xl bg-brand px-5 font-bold text-white">
            Tambah
          </button>
        </div>
        {galat && (
          <p role="alert" className="mt-2 text-sm font-semibold text-expense">
            {galat}
          </p>
        )}
      </form>

      <ConfirmDialog
        buka={Boolean(dihapus)}
        judul={`Hapus kategori ${dihapus?.nama}?`}
        isi="Kategori yang masih dipakai transaksi tidak bisa dihapus."
        labelYa="Hapus"
        onYa={hapus}
        onBatal={() => setDihapus(null)}
      />
    </>
  )
}
