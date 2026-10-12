import { Link } from 'react-router-dom'
import { rupiah } from '../lib/format'

/** Satu baris transaksi; menuju halaman detail saat diketuk. */
export default function ItemTransaksi({ transaksi, kategori }) {
  const masuk = transaksi.tipe === 'masuk'
  return (
    <Link
      to={`/transaksi/${transaksi.id}`}
      className="flex min-h-[60px] items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3"
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">
          {transaksi.catatan || kategori?.nama || 'Transaksi'}
        </div>
        <div className="text-xs text-muted">
          {transaksi.waktu} · {kategori?.nama ?? 'Tanpa kategori'}
        </div>
      </div>
      <div className={`shrink-0 text-sm font-bold ${masuk ? 'text-brand' : 'text-expense'}`}>
        {masuk ? '+' : '-'} {rupiah(transaksi.nominal)}
      </div>
    </Link>
  )
}
