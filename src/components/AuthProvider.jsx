import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ambilAkun, bacaSesi, daftarAkun, hapusSesi, masukAkun, simpanSesi } from '../auth'
import { bukaDb, setPengaturan } from '../db'

const AuthContext = createContext(null)

/**
 * Menyimpan status login. status: 'memuat' | 'keluar' | 'masuk'.
 * Database akun dibuka SEBELUM status berubah menjadi 'masuk', sehingga halaman akun
 * selalu punya database yang siap dipakai.
 */
export function AuthProvider({ children }) {
  const [sesi, setSesi] = useState({ status: 'memuat', akun: null })

  useEffect(() => {
    let batal = false
    async function pulihkan() {
      const id = bacaSesi()
      const akun = id ? await ambilAkun(id) : null
      if (akun) await bukaDb(akun.id)
      if (!batal) setSesi(akun ? { status: 'masuk', akun } : { status: 'keluar', akun: null })
    }
    pulihkan()
    return () => {
      batal = true
    }
  }, [])

  const nilai = useMemo(() => {
    const mulaiSesi = async (akun) => {
      await bukaDb(akun.id)
      simpanSesi(akun.id)
      setSesi({ status: 'masuk', akun })
    }
    return {
      ...sesi,
      masuk: async (data) => mulaiSesi(await masukAkun(data)),
      daftar: async ({ identitas, sandi, namaUsaha, namaPemilik, jenisUsaha }) => {
        const akun = await daftarAkun({ identitas, sandi })
        await bukaDb(akun.id)
        await setPengaturan('profil', { namaUsaha, namaPemilik, jenisUsaha })
        await mulaiSesi(akun)
      },
      keluar: () => {
        hapusSesi()
        setSesi({ status: 'keluar', akun: null })
      },
    }
  }, [sesi])

  return <AuthContext.Provider value={nilai}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
