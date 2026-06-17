'use client'

import { useState } from 'react'

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  business: 'Business',
}

const PRIMARY = '#1B6B4A'

interface WaitlistModalProps {
  plan: 'starter' | 'pro' | 'business'
  onClose: () => void
}

export default function WaitlistModal({ plan, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError((data as { error?: string }).error ?? 'Greška. Pokušajte ponovo.')
      } else {
        setDone(true)
      }
    } catch {
      setError('Greška. Pokušajte ponovo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Zatvori"
        >
          ✕
        </button>

        {done ? (
          <div className="flex flex-col items-center py-4 text-center">
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl text-white"
              style={{ backgroundColor: PRIMARY }}
            >
              ✓
            </div>
            <h2 className="text-xl font-bold text-gray-900">Prijavljeni ste!</h2>
            <p className="mt-2 text-gray-600">Javićemo se čim aktiviramo {PLAN_LABELS[plan]} plan.</p>
            <button
              onClick={onClose}
              className="mt-6 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: PRIMARY }}
            >
              Zatvori
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900">Plaćanje stiže uskoro</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Ostavite vaš email — bićete prvi obavešteni čim aktiviramo{' '}
              <strong>{PLAN_LABELS[plan]}</strong> plan. Kao zahvalnost, prvi mesec
              dobijate uz <strong>20% popusta</strong>.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="vas@email.rs"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-transparent focus:ring-2"
                style={{ focusRingColor: PRIMARY } as React.CSSProperties}
                onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${PRIMARY}40`; e.currentTarget.style.borderColor = PRIMARY }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '#D1D5DB' }}
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: PRIMARY }}
              >
                {loading ? 'Šaljem...' : 'Obavesti me'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
