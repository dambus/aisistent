'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PRIMARY = '#1B6B4A'

export default function AgencyOnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function markOnboardedAndGo(href: string) {
    setLoading(true)
    await fetch('/api/profile/onboarded', { method: 'POST' })
    router.push(href)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Indigo agency badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Agencija plan
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
            style={{ backgroundColor: '#F0F7F4' }}
          >
            🏢
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dobrodošli u AIsistent za agencije
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Vaš alat za brzo generisanje dokumenata za sve klijente.
          </p>

          <div className="space-y-3 text-left mb-8">
            {[
              { icon: '🏢', text: 'Neograničen broj klijentskih firmi' },
              { icon: '⚡', text: 'Dokument za bilo kog klijenta za 2 minuta' },
              { icon: '📧', text: 'Pošaljite dokument direktno klijentu mejlom' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-3 rounded-xl bg-gray-50 px-4 py-3">
                <span className="text-lg shrink-0 mt-0.5">{icon}</span>
                <p className="text-sm text-gray-700 font-medium">{text}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => markOnboardedAndGo('/profil')}
            disabled={loading}
            className="w-full rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60 mb-3"
            style={{ backgroundColor: PRIMARY }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#155C3E' }}
            onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = PRIMARY }}
          >
            {loading ? 'Učitavam...' : 'Dodajte prvog klijenta →'}
          </button>

          <button
            onClick={() => markOnboardedAndGo('/dashboard')}
            disabled={loading}
            className="w-full text-sm text-gray-400 hover:text-gray-600 py-1 transition-colors disabled:opacity-50"
          >
            Preskočite →
          </button>
        </div>
      </div>
    </div>
  )
}
