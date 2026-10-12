import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

/** Bingkai halaman selebar ponsel. `nav` menampilkan menu bawah. */
export default function Layout({ nav = false }) {
  return (
    <div className="relative mx-auto min-h-dvh max-w-md bg-ground shadow-xl print:shadow-none">
      <main className={`px-5 pt-7 ${nav ? 'pb-28' : 'pb-10'}`}>
        <Outlet />
      </main>
      {nav && <BottomNav />}
    </div>
  )
}
