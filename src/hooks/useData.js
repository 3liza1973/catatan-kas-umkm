import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

// Semua hook mengembalikan `undefined` selama data masih dimuat.

export const useTransaksi = () => useLiveQuery(() => db.transaksi.toArray(), [])

export const useKategori = () => useLiveQuery(() => db.kategori.toArray(), [])

/** Pengaturan bernilai `null` jika belum pernah disimpan. */
export const usePengaturan = (kunci) =>
  useLiveQuery(async () => (await db.pengaturan.get(kunci))?.nilai ?? null, [kunci])

/** Peta id → kategori untuk pencarian cepat. */
export function useKategoriMap() {
  const kategori = useKategori()
  return useMemo(() => new Map((kategori ?? []).map((k) => [k.id, k])), [kategori])
}
