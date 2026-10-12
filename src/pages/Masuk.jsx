import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthProvider'
import KolomSandi from '../components/KolomSandi'

export default function Masuk() {
  const { masuk } = useAuth()
  const navigate = useNavigate()
  const [identitas, setIdentitas] = useState('')
  const [sandi, setSandi] = useState('')
  const [galat, setGalat] = useState('')
  const [proses, setProses] = useState(false)
  const [lupa, setLupa] = useState(false)

  const kirim = async (e) => {
    e.preventDefault()
    if (!identitas.trim() || !sandi) return setGalat('Isi email/nomor HP dan kata sandi.')
    setProses(true)
    setGalat('')
    try {
      await masuk({ identitas, sandi })
      navigate('/', { replace: true })
    } catch (err) {
      setGalat(err.message)
      setProses(false)
    }
  }

  return (
    <form onSubmit={kirim} className="flex flex-col gap-4 pt-10" noValidate>
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand text-2xl font-bold text-white">
        Rp
      </div>
      <div>
        <h1 className="text-2xl font-bold">Masuk ke Catatan Kas</h1>
        <p className="mt-1 text-sm text-muted">Kelola uang usahamu dengan mudah.</p>
      </div>

      <div>
        <label htmlFor="identitas" className="text-sm text-muted">
          Email atau nomor HP
        </label>
        <input
          id="identitas"
          value={identitas}
          onChange={(e) => setIdentitas(e.target.value)}
          autoComplete="username"
          inputMode="email"
          className="mt-1.5 h-14 w-full rounded-2xl bg-white px-4"
        />
      </div>
      <KolomSandi
        id="sandi"
        label="Kata sandi"
        value={sandi}
        onChange={(e) => setSandi(e.target.value)}
        autoComplete="current-password"
      />

      {galat && (
        <p role="alert" className="text-sm font-semibold text-expense">
          {galat}
        </p>
      )}

      <button
        type="button"
        onClick={() => setLupa(!lupa)}
        aria-expanded={lupa}
        className="min-h-11 self-end text-sm font-semibold text-brand"
      >
        Lupa kata sandi?
      </button>
      {lupa && (
        <p className="-mt-2 rounded-2xl bg-white p-4 text-sm text-muted">
          Data tersimpan hanya di perangkat ini, jadi kata sandi tidak bisa dipulihkan. Kamu bisa
          membuat akun baru, atau masuk dengan akun lain.
        </p>
      )}

      <button
        type="submit"
        disabled={proses}
        className="h-14 rounded-2xl bg-brand text-base font-bold text-white disabled:opacity-60"
      >
        {proses ? 'Memeriksa...' : 'Masuk'}
      </button>

      <p className="mt-2 text-center text-sm text-muted">
        Belum punya akun?{' '}
        <Link to="/daftar" className="inline-flex min-h-11 items-center font-bold text-brand">
          Daftar
        </Link>
      </p>
    </form>
  )
}
