import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from 'recharts'
import Ikon from '../components/Ikon'
import ItemTransaksi from '../components/ItemTransaksi'
import KosongTransaksi from '../components/KosongTransaksi'
import { useKategoriMap, usePengaturan, useTransaksi } from '../hooks/useData'
import { inisial, isoTanggal, rupiah, sapaan } from '../lib/format'
import { labaHarian, ringkasan, urutkanTerbaru } from '../lib/hitung'

export default function Beranda() {
  const transaksi = useTransaksi()
  const petaKategori = useKategoriMap()
  const profil = usePengaturan('profil')
  const hariIni = isoTanggal()

  const data = useMemo(() => {
    const semua = transaksi ?? []
    const bulanIni = semua.filter((t) => t.tanggal.startsWith(hariIni.slice(0, 7)))
    return {
      saldo: ringkasan(semua).laba,
      bulan: ringkasan(bulanIni),
      grafik: labaHarian(semua, hariIni, 7),
      terbaru: urutkanTerbaru(semua).slice(0, 5),
    }
  }, [transaksi, hariIni])

  if (!transaksi) return null

  return (
    <>
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">{sapaan()},</p>
          <h1 className="text-xl font-bold">{profil?.namaUsaha}</h1>
        </div>
        <Link
          to="/profil"
          aria-label="Buka profil"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-brand font-bold text-white"
        >
          {inisial(profil?.namaUsaha)}
        </Link>
      </header>

      <section aria-label="Saldo kas" className="mt-5 rounded-3xl bg-brand p-5 text-white">
        <p className="text-sm opacity-85">Saldo kas</p>
        <p className="mt-1 text-3xl font-bold">{rupiah(data.saldo)}</p>
        <div className="mt-4 flex gap-3">
          <div className="flex-1 rounded-xl bg-brand-soft p-3">
            <p className="text-xs">Masuk bulan ini</p>
            <p className="font-bold">{rupiah(data.bulan.masuk)}</p>
          </div>
          <div className="flex-1 rounded-xl bg-brand-soft p-3">
            <p className="text-xs">Keluar bulan ini</p>
            <p className="font-bold">{rupiah(data.bulan.keluar)}</p>
          </div>
        </div>
      </section>

      {transaksi.length === 0 ? (
        <div className="mt-4">
          <KosongTransaksi />
        </div>
      ) : (
        <>
          <section className="mt-4 rounded-2xl bg-white p-4">
            <h2 className="text-sm font-semibold">Laba 7 hari terakhir</h2>
            <div className="mt-3 h-28" role="img" aria-label="Grafik laba harian 7 hari terakhir">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.grafik}>
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <Bar dataKey="laba" radius={6}>
                    {data.grafik.map((h, i) => (
                      <Cell
                        key={h.tanggal}
                        fill={i === data.grafik.length - 1 ? '#0f5f4a' : '#bfd8ce'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-bold">Transaksi terbaru</h2>
              <Link
                to="/riwayat"
                className="flex min-h-11 items-center text-sm font-semibold text-brand"
              >
                Lihat semua
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {data.terbaru.map((t) => (
                <ItemTransaksi key={t.id} transaksi={t} kategori={petaKategori.get(t.kategoriId)} />
              ))}
            </div>
          </section>
        </>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-10 mx-auto flex max-w-md justify-end px-5">
        <Link
          to="/catat"
          className="pointer-events-auto flex h-[52px] items-center gap-1 rounded-full bg-accent pr-5 pl-4 font-bold shadow-lg"
        >
          <Ikon nama="tambah" /> Catat
        </Link>
      </div>
    </>
  )
}
