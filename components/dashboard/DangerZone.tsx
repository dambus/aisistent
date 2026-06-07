'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DangerZone() {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    if (confirmText !== 'OBRISI') return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/profile/delete', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Greška pri brisanju. Pokušajte ponovo.')
        setLoading(false)
        return
      }
      router.push('/login?deleted=true')
      router.refresh()
    } catch {
      setError('Greška pri slanju zahteva.')
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-red-200 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-4">Opasna zona</h2>
        <p className="text-sm text-gray-600 mb-4">
          Brisanje naloga je trajno i ne može se poništiti. Svi vaši dokumenti i podaci biće trajno obrisani.
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 text-sm font-semibold border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          Obriši nalog
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Da li ste sigurni?</h3>
            <p className="text-sm text-gray-600 mb-5">
              Ova akcija je nepovratna. Ukucajte <strong>OBRISI</strong> da potvrdite brisanje naloga.
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={e => { setConfirmText(e.target.value); setError('') }}
              placeholder="OBRISI"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 mb-4"
            />

            {error && (
              <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={confirmText !== 'OBRISI' || loading}
                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: '#DC2626' }}
              >
                {loading ? 'Brišem...' : 'Potvrdi brisanje'}
              </button>
              <button
                onClick={() => { setModalOpen(false); setConfirmText(''); setError('') }}
                disabled={loading}
                className="flex-1 py-2.5 text-sm font-semibold border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Otkaži
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
