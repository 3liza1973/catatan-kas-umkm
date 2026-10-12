const JALUR = {
  beranda: 'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
  riwayat: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  laporan: 'M4 20V10M10 20V4M16 20v-8M22 20H2',
  profil: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  tambah: 'M12 5v14M5 12h14',
  kembali: 'M19 12H5M12 19l-7-7 7-7',
  cari: 'M21 21l-4.3-4.3M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z',
}

/** Ikon garis sederhana; `nama` mengacu ke kunci di JALUR. */
export default function Ikon({ nama, ukuran = 22 }) {
  return (
    <svg
      width={ukuran}
      height={ukuran}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={JALUR[nama]} />
    </svg>
  )
}
