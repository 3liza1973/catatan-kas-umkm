import { useState } from 'react'

/** Kolom kata sandi dengan tombol tampilkan/sembunyikan. */
export default function KolomSandi({ id, label, value, onChange, autoComplete }) {
  const [tampil, setTampil] = useState(false)
  return (
    <div>
      <label htmlFor={id} className="text-sm text-muted">
        {label}
      </label>
      <div className="mt-1.5 flex h-14 items-center rounded-2xl bg-white pr-1 pl-4">
        <input
          id={id}
          type={tampil ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className="h-full min-w-0 flex-1 bg-transparent"
        />
        <button
          type="button"
          onClick={() => setTampil(!tampil)}
          aria-pressed={tampil}
          className="h-11 rounded-xl px-3 text-sm font-semibold text-brand"
        >
          {tampil ? 'Sembunyikan' : 'Tampilkan'}
        </button>
      </div>
    </div>
  )
}
