import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(() => {})

/** Menyediakan `useToast()` untuk menampilkan pesan singkat setelah suatu aksi. */
export function ToastProvider({ children }) {
  const [pesan, setPesan] = useState(null)
  const timer = useRef(null)

  const tampil = useCallback((teks) => {
    clearTimeout(timer.current)
    setPesan(teks)
    timer.current = setTimeout(() => setPesan(null), 2500)
  }, [])

  return (
    <ToastContext.Provider value={tampil}>
      {children}
      {pesan && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-30 max-w-[90vw] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-lg print:hidden"
        >
          {pesan}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
