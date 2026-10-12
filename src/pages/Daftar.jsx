import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MIN_SANDI } from '../auth'
import { useAuth } from '../components/AuthProvider'
import KolomSandi from '../components/KolomSandi'
import { JENIS_USAHA } from '../lib/usaha'

const kolom = 'mt-1.5 h-14 w-full rounded-2xl bg-white px-4'

export default function Daftar() {
  const { daftar } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    namaUsaha: '',
    namaPemilik: '',
    jenisUsaha: JENIS_USAHA[0],
    identitas: '',
    sandi: '',
    ulang: '',
  })
  const [galat, setGalat] = useState('')
  const [proses, setProses] = useState(false)
  const ubah = (kunci) => (e) => setForm({ ...form, [kunci]: e.target.value })

  const kirim = async (e) => {
    e.preventDefault()
    if (!form.namaUsaha.trim()) return setGalat('Isi nama usahamu dulu.')
    if (form.sandi !== form.ulang) return setGalat('Kata sandi dan konfirmasinya belum sama.')
    setProses(true)
    setGalat('')
    try {
      await daftar({
        identitas: form.identitas,
        sandi: form.sandi,
        namaUsaha: form.namaUsaha.trim(),
        namaPemilik: form.namaPemilik.trim(),
        jenisUsaha: form.jenisUsaha,
      })
      navigate('/', { replace: true })
    } catch (err) {
      setGalat(err.message)
      setProses(false)
    }
  }

  return (
    <form onSubmit={kirim} className="flex flex-col gap-4 pt-4" noValidate>
      <div>
        <h1 className="text-2xl font-bold">Buat akun</h1>
        <p className="mt-1 text-sm text-muted">
          Data tersimpan di perangkat ini, tanpa internet. Kata sandi tidak bisa dipulihkan, jadi
          catat baik-baik dan cadangkan datamu secara berkala.
        </p>
      </div>

      <div>
        <label htmlFor="nama-usaha" className="text-sm text-muted">
          Nama usaha
        </label>
        <input
          id="nama-usaha"
          value={form.namaUsaha}
          onChange={ubah('namaUsaha')}
          placeholder="Contoh: Warung Bu Sari"
          className={kolom}
        />
      </div>
      <div>
        <label htmlFor="nama-pemilik" className="text-sm text-muted">
          Nama pemilik (opsional)
        </label>
        <input
          id="nama-pemilik"
          value={form.namaPemilik}
          onChange={ubah('namaPemilik')}
          className={kolom}
        />
      </div>
      <div>
        <label htmlFor="jenis-usaha" className="text-sm text-muted">
          Jenis usaha
        </label>
        <select
          id="jenis-usaha"
          value={form.jenisUsaha}
          onChange={ubah('jenisUsaha')}
          className={kolom}
        >
          {JENIS_USAHA.map((j) => (
            <option key={j}>{j}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="identitas" className="text-sm text-muted">
          Email atau nomor HP
        </label>
        <input
          id="identitas"
          value={form.identitas}
          onChange={ubah('identitas')}
          autoComplete="username"
          inputMode="email"
          className={kolom}
        />
      </div>
      <KolomSandi
        id="sandi"
        label={`Kata sandi (min. ${MIN_SANDI} karakter)`}
        value={form.sandi}
        onChange={ubah('sandi')}
        autoComplete="new-password"
      />
      <KolomSandi
        id="ulang"
        label="Ulangi kata sandi"
        value={form.ulang}
        onChange={ubah('ulang')}
        autoComplete="new-password"
      />

      {galat && (
        <p role="alert" className="text-sm font-semibold text-expense">
          {galat}
        </p>
      )}
      <button
        type="submit"
        disabled={proses}
        className="h-14 rounded-2xl bg-brand text-base font-bold text-white disabled:opacity-60"
      >
        {proses ? 'Membuat akun...' : 'Daftar dan mulai'}
      </button>
      <p className="text-center text-sm text-muted">
        Sudah punya akun?{' '}
        <Link to="/masuk" className="inline-flex min-h-11 items-center font-bold text-brand">
          Masuk
        </Link>
      </p>
    </form>
  )
}
