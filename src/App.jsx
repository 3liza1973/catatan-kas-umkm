import { Navigate, Route, Routes } from 'react-router-dom'
import { onboardingSelesai } from './auth'
import { useAuth } from './components/AuthProvider'
import Layout from './components/Layout'
import Beranda from './pages/Beranda'
import Catat from './pages/Catat'
import Daftar from './pages/Daftar'
import Detail from './pages/Detail'
import Kategori from './pages/Kategori'
import Laporan from './pages/Laporan'
import Masuk from './pages/Masuk'
import Onboarding from './pages/Onboarding'
import Profil from './pages/Profil'
import Riwayat from './pages/Riwayat'

/** Tujuan awal untuk pengunjung yang belum masuk: layar pembuka sekali saja, lalu halaman masuk. */
function Awal() {
  return <Navigate to={onboardingSelesai() ? '/masuk' : '/onboarding'} replace />
}

export default function App() {
  const { status, akun } = useAuth()
  if (status === 'memuat') return null

  // Belum login: hanya halaman pembuka, masuk, dan daftar yang bisa dibuka.
  if (status === 'keluar') {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/masuk" element={<Masuk />} />
          <Route path="/daftar" element={<Daftar />} />
        </Route>
        <Route path="*" element={<Awal />} />
      </Routes>
    )
  }

  // `key` memastikan semua halaman dibuat ulang saat berganti akun.
  return (
    <Routes key={akun.id}>
      <Route element={<Layout nav />}>
        <Route path="/" element={<Beranda />} />
        <Route path="/riwayat" element={<Riwayat />} />
        <Route path="/laporan" element={<Laporan />} />
        <Route path="/profil" element={<Profil />} />
      </Route>
      <Route element={<Layout />}>
        <Route path="/catat" element={<Catat />} />
        <Route path="/catat/:id" element={<Catat />} />
        <Route path="/transaksi/:id" element={<Detail />} />
        <Route path="/kategori" element={<Kategori />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
