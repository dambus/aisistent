'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function WelcomeModal() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setError('Unesite ime od najmanje 2 karaktera.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/profile/set-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: trimmed }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Greška pri čuvanju. Pokušajte ponovo.')
        return
      }
      router.refresh()
    } catch {
      setError('Greška pri slanju. Proverite vezu i pokušajte ponovo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="text-5xl mb-4">👋</div>
          <h1 className="text-2xl font-bold text-gray-900">Dobrodošli u AIsistent!</h1>
          <p className="mt-2 text-gray-500">Kako da Vas oslovimo?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="Vaše ime, npr. Petar"
              required
              autoFocus
              maxLength={50}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#1B6B4A] focus:outline-none focus:ring-2 focus:ring-[#1B6B4A]/20"
            />
            <p className="mt-1.5 text-xs text-gray-400">Koristimo ga samo za pozdrav</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || name.trim().length < 2}
            className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1B6B4A' }}
          >
            {loading ? 'Čuvam...' : 'Počnimo →'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          Možete ga promeniti u Podešavanjima
        </p>
      </div>
    </div>
  )
}
