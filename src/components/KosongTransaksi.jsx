import { Link } from 'react-router-dom'

/** Tampilan saat belum ada transaksi: mengajak mencatat transaksi pertama. */
export default function KosongTransaksi() {
  return (
    <div className="rounded-3xl bg-white p-6 text-center">
      <p className="font-bold">Belum ada transaksi</p>
      <p className="mt-1 text-sm text-muted">
        Mulai dengan mencatat penjualan atau pengeluaran pertamamu.
      </p>
      <Link
        to="/catat"
        className="mt-4 flex h-12 items-center justify-center rounded-2xl bg-brand font-bold text-white"
      >
        Catat transaksi pertama
      </Link>
    </div>
  )
}
