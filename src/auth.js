// Autentikasi lokal: akun disimpan di IndexedDB perangkat ini, kata sandi di-hash dengan
// PBKDF2 (SHA-256, garam acak per akun) lewat Web Crypto. Tidak ada kata sandi yang disimpan polos.
import Dexie from 'dexie'

const akunDb = new Dexie('catatanKasAkun')
akunDb.version(1).stores({ akun: '++id, &identitas' })

const KUNCI_SESI = 'catatanKas.sesi'
const KUNCI_ONBOARDING = 'catatanKas.onboarding'
const ITERASI = 150_000
export const MIN_SANDI = 6

const keBase64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)))
const dariBase64 = (teks) => Uint8Array.from(atob(teks), (c) => c.charCodeAt(0))

async function turunkan(sandi, garam) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Peramban memblokir fitur keamanan. Buka lewat HTTPS atau localhost.')
  }
  const kunci = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(sandi),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bit = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: garam, iterations: ITERASI },
    kunci,
    256,
  )
  return keBase64(bit)
}

/** Email atau nomor HP: huruf kecil, tanpa spasi dan tanda hubung. */
export const normalisasi = (teks) => teks.trim().toLowerCase().replace(/[\s-]/g, '')

export const identitasValid = (teks) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teks) || /^\+?\d{8,15}$/.test(teks)

const sama = (a, b) => a.length === b.length && [...a].every((c, i) => c === b[i])

/** Membuat akun baru. Melempar Error berpesan ramah jika data tidak valid. */
export async function daftarAkun({ identitas, sandi }) {
  const id = normalisasi(identitas)
  if (!identitasValid(id)) throw new Error('Isi email atau nomor HP yang benar.')
  if (sandi.length < MIN_SANDI) throw new Error(`Kata sandi minimal ${MIN_SANDI} karakter.`)
  if (await akunDb.akun.where('identitas').equals(id).count()) {
    throw new Error('Email atau nomor HP ini sudah terdaftar. Silakan masuk.')
  }
  const garam = crypto.getRandomValues(new Uint8Array(16))
  const hash = await turunkan(sandi, garam)
  const akunId = await akunDb.akun.add({
    identitas: id,
    garam: keBase64(garam),
    hash,
    dibuat: Date.now(),
  })
  return { id: akunId, identitas: id }
}

const SALAH = 'Email/nomor HP atau kata sandi salah.'

export async function masukAkun({ identitas, sandi }) {
  const akun = await akunDb.akun.where('identitas').equals(normalisasi(identitas)).first()
  if (!akun) throw new Error(SALAH)
  const hash = await turunkan(sandi, dariBase64(akun.garam))
  if (!sama(hash, akun.hash)) throw new Error(SALAH)
  return { id: akun.id, identitas: akun.identitas }
}

export async function ubahSandi(akunId, lama, baru) {
  if (baru.length < MIN_SANDI) throw new Error(`Kata sandi baru minimal ${MIN_SANDI} karakter.`)
  const akun = await akunDb.akun.get(akunId)
  if (!akun || !sama(await turunkan(lama, dariBase64(akun.garam)), akun.hash)) {
    throw new Error('Kata sandi lama salah.')
  }
  const garam = crypto.getRandomValues(new Uint8Array(16))
  await akunDb.akun.update(akunId, { garam: keBase64(garam), hash: await turunkan(baru, garam) })
}

export async function ambilAkun(id) {
  const akun = await akunDb.akun.get(id)
  return akun ? { id: akun.id, identitas: akun.identitas } : null
}

// ---------- Sesi dan penanda layar pembuka (localStorage) ----------

const baca = (kunci) => {
  try {
    return localStorage.getItem(kunci)
  } catch {
    return null
  }
}
const tulis = (kunci, nilai) => {
  try {
    if (nilai === null) localStorage.removeItem(kunci)
    else localStorage.setItem(kunci, nilai)
  } catch {
    // Penyimpanan diblokir: sesi hanya berlaku sampai halaman ditutup.
  }
}

export const bacaSesi = () => Number(baca(KUNCI_SESI)) || null
export const simpanSesi = (id) => tulis(KUNCI_SESI, String(id))
export const hapusSesi = () => tulis(KUNCI_SESI, null)
export const onboardingSelesai = () => baca(KUNCI_ONBOARDING) === '1'
export const tandaiOnboarding = () => tulis(KUNCI_ONBOARDING, '1')
