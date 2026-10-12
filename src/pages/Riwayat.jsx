import { useMemo, useState } from 'react'
import Ikon from '../components/Ikon'
import ItemTransaksi from '../components/ItemTransaksi'
import KosongTransaksi from '../components/KosongTransaksi'
import { useKategoriMap, useTransaksi } from '../hooks/useData'
import { labelHari, rupiah } from '../lib/format'
import { ringkasan, urutkanTerbaru } from '../lib/hitung'

const FILTER = [
  ['semua', 'Semua'],
  ['masuk', 'Pemasukan'],
  ['keluar', 'Pengeluaran'],
]

export default function Riwayat() {
  const transaksi = useTransaksi()
  const petaKategori = useKategoriMap()
  const [cari, setCari] = useState('')
  const [filter, setFilter] = useState('semua')

  // Menyaring lalu mengelompokkan per tanggal (urutan terbaru dipertahankan).
  const kelompok = useMemo(() => {
    const kata = cari.trim().toLowerCase()
    const hasil = urutkanTerbaru(transaksi ?? []).filter((t) => {
      if (filter !== 'semua' && t.tipe !== filter) return false
      if (!kata) return true
      const namaKategori = petaKategori.get(t.kategoriId)?.nama ?? ''
      return `${t.catatan} ${namaKategori}`.toLowerCase().includes(kata)
    })
    const peta = new Map()
    for (const t of hasil) peta.set(t.tanggal, [...(peta.get(t.tanggal) ?? []), t])
    return [...peta]
  }, [transaksi, petaKategori, cari, filter])

  if (!transaksi) return null

  return (
    <>
      <h1 className="mb-4 text-xl font-bold">Riwayat</h1>
      {transaksi.length === 0 ? (
        <KosongTransaksi />
      ) : (
        <>
          <div className="relative">
            <label htmlFor="cari" className="sr-only">
              Cari transaksi
            </label>
            <span className="pointer-events-none absolute top-3.5 left-4 text-muted">
              <Ikon nama="cari" ukuran={20} />
            </span>
            <input
              id="cari"
              type="search"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari catatan atau kategori"
              className="h-12 w-full rounded-2xl bg-white pr-4 pl-11"
            />
          </div>

          <div role="group" aria-label="Filter jenis" className="mt-3 flex gap-2">
            {FILTER.map(([nilai, label]) => (
              <button
                key={nilai}
                type="button"
                aria-pressed={filter === nilai}
                onClick={() => setFilter(nilai)}
                className={`h-11 rounded-full px-4 text-sm font-semibold ${
                  filter === nilai ? 'bg-brand text-white' : 'bg-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {kelompok.length === 0 && (
            <p className="mt-8 text-center text-sm text-muted">
              Tidak ada transaksi yang cocok. Coba kata kunci atau filter lain.
            </p>
          )}

          {kelompok.map(([tanggal, daftar]) => {
            const { laba } = ringkasan(daftar)
            return (
              <section key={tanggal} className="mt-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <h2 className="font-bold text-muted">{labelHari(tanggal)}</h2>
                  <span className={laba < 0 ? 'text-expense' : 'text-muted'}>
                    {laba < 0 ? '-' : ''}
                    {rupiah(Math.abs(laba))}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {daftar.map((t) => (
                    <ItemTransaksi
                      key={t.id}
                      transaksi={t}
                      kategori={petaKategori.get(t.kategoriId)}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </>
      )}
    </>
  )
}
