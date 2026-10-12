import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ubahSandi } from '../auth'
import { useAuth } from '../components/AuthProvider'
import ConfirmDialog from '../components/ConfirmDialog'
import JudulHalaman from '../components/JudulHalaman'
import KolomSandi from '../components/KolomSandi'
import { useToast } from '../components/Toast'
import { ekspor, hapusSemuaTransaksi, impor, setPengaturan } from '../db'
import { usePengaturan } from '../hooks/useData'
import { inisial, isoTanggal } from '../lib/format'
import { JENIS_USAHA } from '../lib/usaha'

const baris =
  'flex min-h-14 w-full items-center justify-between rounded-2xl bg-white px-4 text-left text-sm font-semibold'
const kolom = 'mt-1 h-12 w-full rounded-xl bg-ground px-3'

function GantiSandi({ akunId }) {
  const tampil = useToast()
  const [form, setForm] = useState({ lama: '', baru: '', ulang: '' })
  const [galat, setGalat] = useState('')
  const ubah = (kunci) => (e) => setForm({ ...form, [kunci]: e.target.value })

  const simpan = async (e) => {
    e.preventDefault()
    if (form.baru !== form.ulang) return setGalat('Kata sandi baru dan konfirmasinya belum sama.')
    try {
      await ubahSandi(akunId, form.lama, form.baru)
      setForm({ lama: '', baru: '', ulang: '' })
      setGalat('')
      tampil('Kata sandi diganti')
    } catch (err) {
      setGalat(err.message)
    }
  }

  return (
    <form onSubmit={simpan} className="mt-4 flex flex-col gap-3 rounded-2xl bg-white p-4">
      <h2 className="text-sm font-bold">Ganti kata sandi</h2>
      <KolomSandi
        id="sandi-lama"
        label="Kata sandi lama"
        value={form.lama}
        onChange={ubah('lama')}
        autoComplete="current-password"
      />
      <KolomSandi
        id="sandi-baru"
        label="Kata sandi baru"
        value={form.baru}
        onChange={ubah('baru')}
        autoComplete="new-password"
      />
      <KolomSandi
        id="sandi-ulang"
        label="Ulangi kata sandi baru"
        value={form.ulang}
        onChange={ubah('ulang')}
        autoComplete="new-password"
      />
      {galat && (
        <p role="alert" className="text-sm font-semibold text-expense">
          {galat}
        </p>
      )}
      <button type="submit" className="h-12 rounded-xl bg-brand font-bold text-white">
        Simpan kata sandi
      </button>
    </form>
  )
}

export default function Profil() {
  const { akun, keluar } = useAuth()
  const profil = usePengaturan('profil')
  const tampil = useToast()
  const inputBerkas = useRef(null)
  const [dialog, setDialog] = useState(null) // { judul, isi, labelYa, aksi }
  const [ubahan, setUbahan] = useState(null) // salinan profil saat sedang diedit

  if (!profil) return null
  const form = ubahan ?? profil

  const simpanProfil = async (e) => {
    e.preventDefault()
    if (!form.namaUsaha.trim()) return tampil('Nama usaha belum diisi')
    await setPengaturan('profil', { ...form, namaUsaha: form.namaUsaha.trim() })
    setUbahan(null)
    tampil('Data usaha tersimpan')
  }

  const unduhCadangan = async () => {
    const blob = new Blob([JSON.stringify(await ekspor(), null, 2)], { type: 'application/json' })
    const tautan = document.createElement('a')
    tautan.href = URL.createObjectURL(blob)
    tautan.download = `cadangan-catatan-kas-${isoTanggal()}.json`
    tautan.click()
    URL.revokeObjectURL(tautan.href)
    tampil('Cadangan diunduh')
  }

  const pulihkan = async (e) => {
    const berkas = e.target.files[0]
    e.target.value = ''
    if (!berkas) return
    try {
      await impor(JSON.parse(await berkas.text()))
      tampil('Data berhasil dipulihkan')
    } catch (galat) {
      tampil(galat instanceof SyntaxError ? 'Berkas tidak bisa dibaca' : galat.message)
    }
  }

  return (
    <>
      <JudulHalaman>Profil</JudulHalaman>

      <section className="flex items-center gap-4 rounded-2xl bg-white p-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand text-xl font-bold text-white">
          {inisial(profil.namaUsaha)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-bold">{profil.namaUsaha}</p>
          <p className="text-sm text-muted">{profil.jenisUsaha}</p>
          <p className="truncate text-xs text-muted">{akun.identitas}</p>
        </div>
      </section>

      <form onSubmit={simpanProfil} className="mt-4 flex flex-col gap-3 rounded-2xl bg-white p-4">
        <h2 className="text-sm font-bold">Data usaha</h2>
        <div>
          <label htmlFor="nama-usaha" className="text-xs text-muted">
            Nama usaha
          </label>
          <input
            id="nama-usaha"
            value={form.namaUsaha}
            onChange={(e) => setUbahan({ ...form, namaUsaha: e.target.value })}
            className={kolom}
          />
        </div>
        <div>
          <label htmlFor="nama-pemilik" className="text-xs text-muted">
            Nama pemilik
          </label>
          <input
            id="nama-pemilik"
            value={form.namaPemilik}
            onChange={(e) => setUbahan({ ...form, namaPemilik: e.target.value })}
            className={kolom}
          />
        </div>
        <div>
          <label htmlFor="jenis-usaha" className="text-xs text-muted">
            Jenis usaha
          </label>
          <select
            id="jenis-usaha"
            value={form.jenisUsaha}
            onChange={(e) => setUbahan({ ...form, jenisUsaha: e.target.value })}
            className={kolom}
          >
            {JENIS_USAHA.map((j) => (
              <option key={j}>{j}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={!ubahan}
          className="h-12 rounded-xl bg-brand font-bold text-white disabled:opacity-40"
        >
          Simpan data usaha
        </button>
      </form>

      <GantiSandi akunId={akun.id} />

      <div className="mt-4 flex flex-col gap-2">
        <Link to="/kategori" className={baris}>
          Kelola kategori
        </Link>
        <button type="button" onClick={unduhCadangan} className={baris}>
          Cadangkan data (unduh JSON)
        </button>
        <button type="button" onClick={() => inputBerkas.current.click()} className={baris}>
          Pulihkan data dari cadangan
        </button>
        <input
          ref={inputBerkas}
          type="file"
          accept="application/json,.json"
          onChange={pulihkan}
          className="hidden"
          aria-label="Pilih berkas cadangan"
        />
        <button
          type="button"
          className={`${baris} text-expense`}
          onClick={() =>
            setDialog({
              judul: 'Hapus semua transaksi?',
              isi: 'Semua transaksi dihapus dan kategori kembali ke bawaan. Akun dan data usaha tetap ada.',
              labelYa: 'Hapus semua',
              aksi: async () => {
                await hapusSemuaTransaksi()
                tampil('Semua transaksi dihapus')
              },
            })
          }
        >
          Hapus semua transaksi
        </button>
        <button
          type="button"
          className="mt-2 min-h-14 rounded-2xl border-2 border-expense font-bold text-expense"
          onClick={() =>
            setDialog({
              judul: 'Keluar dari akun?',
              isi: 'Data tetap tersimpan di perangkat ini. Masuk lagi dengan email atau nomor HP dan kata sandimu.',
              labelYa: 'Keluar',
              aksi: keluar,
            })
          }
        >
          Keluar
        </button>
      </div>

      <ConfirmDialog
        buka={Boolean(dialog)}
        judul={dialog?.judul}
        isi={dialog?.isi}
        labelYa={dialog?.labelYa}
        onYa={async () => {
          const { aksi } = dialog
          setDialog(null)
          await aksi()
        }}
        onBatal={() => setDialog(null)}
      />
    </>
  )
}
