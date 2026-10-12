import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { tandaiOnboarding } from '../auth'

const LANGKAH = [
  {
    judul: 'Catat uang masuk dan keluar dalam hitungan detik',
    isi: 'Tidak perlu buku catatan. Penjualan dan pengeluaran warung tersimpan rapi di satu tempat.',
  },
  {
    judul: 'Lihat saldo dan laba kapan saja',
    isi: 'Saldo kas dan laba harian langsung terhitung setiap kali kamu mencatat transaksi.',
  },
  {
    judul: 'Laporan siap diunduh ke Excel, tetap jalan tanpa internet',
    isi: 'Lihat laporan mingguan sampai tahunan, lalu unduh sebagai berkas Excel.',
  },
]

function Ilustrasi({ langkah }) {
  if (langkah === 0) {
    return (
      <div className="w-48 rounded-2xl bg-brand p-4 text-white">
        <p className="text-xs opacity-85">Saldo kas</p>
        <p className="text-2xl font-bold">Rp 1.250.000</p>
        <div className="mt-3 h-2 w-3/4 rounded bg-accent" />
        <div className="mt-1.5 h-2 w-1/2 rounded bg-mint" />
      </div>
    )
  }
  if (langkah === 1) {
    return (
      <div className="flex h-28 items-end gap-2">
        {[40, 62, 48, 80, 56, 70, 92].map((h, i) => (
          <div
            key={i}
            className={`w-7 rounded-md ${i === 6 ? 'bg-brand' : 'bg-mint'}`}
            style={{ height: h }}
          />
        ))}
      </div>
    )
  }
  return (
    <div className="w-48 rounded-2xl bg-white p-4 text-sm font-semibold">
      <p>Laporan Oktober</p>
      <p className="mt-1 text-xs font-normal text-muted">Laba bersih</p>
      <p className="text-xl font-bold text-brand">Rp 4.730.000</p>
    </div>
  )
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [langkah, setLangkah] = useState(0)
  const terakhir = langkah === LANGKAH.length - 1
  const { judul, isi } = LANGKAH[langkah]

  const selesai = (tujuan) => {
    tandaiOnboarding()
    navigate(tujuan)
  }

  return (
    <div className="flex min-h-[calc(100dvh-4.5rem)] flex-col gap-4">
      <button
        type="button"
        onClick={() => selesai('/masuk')}
        className="flex h-11 items-center self-end text-sm font-semibold text-brand"
      >
        Lewati
      </button>
      <div className="flex h-72 items-center justify-center rounded-[28px] bg-track">
        <Ilustrasi langkah={langkah} />
      </div>
      <h1 className="mt-2 text-2xl font-bold">{judul}</h1>
      <p className="leading-relaxed text-muted">{isi}</p>
      <div className="flex gap-1.5" aria-label={`Langkah ${langkah + 1} dari ${LANGKAH.length}`}>
        {LANGKAH.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full ${i === langkah ? 'w-6 bg-brand' : 'w-2 bg-mint'}`}
          />
        ))}
      </div>
      <div className="flex-1" />
      <button
        type="button"
        onClick={() => (terakhir ? selesai('/daftar') : setLangkah(langkah + 1))}
        className="h-14 rounded-2xl bg-brand text-base font-bold text-white"
      >
        {terakhir ? 'Mulai' : 'Lanjut'}
      </button>
    </div>
  )
}
