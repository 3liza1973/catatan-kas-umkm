import { useLocation, useNavigate } from 'react-router-dom'
import Ikon from './Ikon'

/** Judul halaman; `kembali` menambah tombol panah (ke halaman sebelumnya atau `ke`). */
export default function JudulHalaman({ children, kembali = false, ke = '/' }) {
  const navigate = useNavigate()
  const lokasi = useLocation()
  const pergi = () => (lokasi.key === 'default' ? navigate(ke, { replace: true }) : navigate(-1))

  return (
    <header className="mb-5 flex items-center gap-1">
      {kembali && (
        <button
          type="button"
          onClick={pergi}
          aria-label="Kembali"
          className="-ml-3 flex h-11 w-11 items-center justify-center rounded-full text-ink print:hidden"
        >
          <Ikon nama="kembali" />
        </button>
      )}
      <h1 className="text-xl font-bold">{children}</h1>
    </header>
  )
}
