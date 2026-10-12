// Database lokal (IndexedDB lewat Dexie). Semua data tersimpan di perangkat pengguna.
import Dexie from 'dexie'

export const KATEGORI_AWAL = [
  { tipe: 'masuk', nama: 'Penjualan' },
  { tipe: 'masuk', nama: 'Pesanan online' },
  { tipe: 'masuk', nama: 'Jasa' },
  { tipe: 'masuk', nama: 'Lainnya' },
  { tipe: 'keluar', nama: 'Belanja stok' },
  { tipe: 'keluar', nama: 'Operasional' },
  { tipe: 'keluar', nama: 'Gaji pegawai' },
  { tipe: 'keluar', nama: 'Transportasi' },
  { tipe: 'keluar', nama: 'Lainnya' },
]

/** Database milik akun yang sedang masuk. Diisi oleh bukaDb() sebelum halaman akun ditampilkan. */
export let db = null

/** Membuka database khusus satu akun, sehingga data tiap akun terpisah. */
export async function bukaDb(akunId) {
  const nama = `catatanKas-${akunId}`
  if (db?.name === nama) return
  db?.close()
  const baru = new Dexie(nama)
  baru.version(1).stores({
    transaksi: '++id, tipe, kategoriId, tanggal',
    kategori: '++id, tipe, nama',
    pengaturan: 'kunci',
  })
  baru.on('populate', (tx) => {
    tx.table('kategori').bulkAdd(KATEGORI_AWAL)
  })
  await baru.open()
  db = baru
}

// ---------- Pengaturan ----------

export const setPengaturan = (kunci, nilai) => db.pengaturan.put({ kunci, nilai })
export const hapusPengaturan = (kunci) => db.pengaturan.delete(kunci)

// ---------- Transaksi ----------

/** Menambah transaksi baru, atau memperbarui jika `id` ada. */
export async function simpanTransaksi({ id, ...isi }) {
  if (id) {
    await db.transaksi.update(id, isi)
    return id
  }
  return db.transaksi.add(isi)
}

export const hapusTransaksi = (id) => db.transaksi.delete(id)

// ---------- Kategori ----------

/** Mengembalikan { ok, pesan }. Nama kategori tidak boleh kembar dalam satu jenis. */
export async function tambahKategori(tipe, nama) {
  const bersih = nama.trim()
  if (!bersih) return { ok: false, pesan: 'Nama kategori belum diisi.' }
  const sudahAda = await db.kategori
    .where('tipe')
    .equals(tipe)
    .filter((k) => k.nama.toLowerCase() === bersih.toLowerCase())
    .count()
  if (sudahAda) return { ok: false, pesan: 'Kategori dengan nama itu sudah ada.' }
  await db.kategori.add({ tipe, nama: bersih })
  return { ok: true }
}

/** Kategori yang masih dipakai transaksi tidak boleh dihapus. */
export async function hapusKategori(id) {
  const dipakai = await db.transaksi.where('kategoriId').equals(id).count()
  if (dipakai) return { ok: false, pesan: `Kategori masih dipakai ${dipakai} transaksi.` }
  await db.kategori.delete(id)
  return { ok: true }
}

// ---------- Cadangan ----------

export async function ekspor() {
  return {
    aplikasi: 'catatan-kas-umkm',
    versi: 1,
    dibuat: new Date().toISOString(),
    kategori: await db.kategori.toArray(),
    transaksi: await db.transaksi.toArray(),
    pengaturan: await db.pengaturan.toArray(),
  }
}

/** Mengganti seluruh data dengan isi berkas cadangan. */
export async function impor(data) {
  const valid =
    data?.aplikasi === 'catatan-kas-umkm' &&
    Array.isArray(data.kategori) &&
    Array.isArray(data.transaksi) &&
    Array.isArray(data.pengaturan)
  if (!valid) throw new Error('Berkas bukan cadangan Catatan Kas UMKM.')
  const profilSaatIni = await db.pengaturan.get('profil')
  await db.transaction('rw', db.kategori, db.transaksi, db.pengaturan, async () => {
    await Promise.all([db.kategori.clear(), db.transaksi.clear(), db.pengaturan.clear()])
    await db.kategori.bulkAdd(data.kategori)
    await db.transaksi.bulkAdd(data.transaksi)
    await db.pengaturan.bulkAdd(data.pengaturan)
    // Cadangan tanpa profil tidak boleh menghapus profil usaha yang sedang dipakai.
    if (profilSaatIni && !data.pengaturan.some((p) => p.kunci === 'profil')) {
      await db.pengaturan.put(profilSaatIni)
    }
  })
}

/** Menghapus semua transaksi dan mengembalikan kategori ke bawaan. Profil usaha tetap. */
export async function hapusSemuaTransaksi() {
  await db.transaction('rw', db.kategori, db.transaksi, async () => {
    await db.transaksi.clear()
    await db.kategori.clear()
    await db.kategori.bulkAdd(KATEGORI_AWAL)
  })
}
