import { NavLink } from 'react-router-dom'
import Ikon from './Ikon'

const MENU = [
  { ke: '/', nama: 'Beranda', ikon: 'beranda' },
  { ke: '/riwayat', nama: 'Riwayat', ikon: 'riwayat' },
  { ke: '/laporan', nama: 'Laporan', ikon: 'laporan' },
  { ke: '/profil', nama: 'Profil', ikon: 'profil' },
]

export default function BottomNav() {
  return (
    <nav
      aria-label="Menu utama"
      className="fixed bottom-0 left-1/2 z-10 flex h-[72px] w-full max-w-md -translate-x-1/2 items-center justify-around bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_0_var(--color-track)] print:hidden"
    >
      {MENU.map((m) => (
        <NavLink
          key={m.ke}
          to={m.ke}
          end
          className={({ isActive }) =>
            `flex min-h-[48px] min-w-[64px] flex-col items-center justify-center gap-0.5 text-xs ${
              isActive ? 'font-bold text-brand' : 'text-muted'
            }`
          }
        >
          <Ikon nama={m.ikon} />
          {m.nama}
        </NavLink>
      ))}
    </nav>
  )
}
