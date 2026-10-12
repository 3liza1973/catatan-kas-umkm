/** Dialog konfirmasi untuk aksi yang tidak bisa dibatalkan. Tampil jika `buka` bernilai true. */
export default function ConfirmDialog({ buka, judul, isi, labelYa, onYa, onBatal }) {
  if (!buka) return null
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="judul-dialog"
        className="w-full max-w-sm rounded-3xl bg-white p-6"
      >
        <h2 id="judul-dialog" className="text-lg font-bold">
          {judul}
        </h2>
        <p className="mt-2 text-sm text-muted">{isi}</p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onBatal}
            className="h-12 flex-1 rounded-2xl bg-track font-semibold"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onYa}
            className="h-12 flex-1 rounded-2xl bg-expense font-semibold text-white"
          >
            {labelYa}
          </button>
        </div>
      </div>
    </div>
  )
}
