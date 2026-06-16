'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SecurityCardProps {
  email: string
}

export function SecurityCard({ email }: SecurityCardProps) {
  const supabase = createClient()

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleReset() {
    setStatus('loading')
    setMessage('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/podesavanja`,
      })
      if (error) throw error
      setStatus('success')
      setMessage('Email za promenu lozinke je poslat. Proverite inbox.')
    } catch {
      setStatus('error')
      setMessage('Greška pri slanju emaila. Pokušajte ponovo.')
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-5">Bezbednost</h2>

      {/* Promena lozinke */}
      <div className="mb-5 pb-5 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900 mb-0.5">Promena lozinke</p>
        <p className="text-xs text-gray-500 mb-3">Pošaljite link za promenu lozinke na vaš email</p>

        <button
          onClick={handleReset}
          disabled={status === 'loading' || status === 'success'}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60"
          style={{ backgroundColor: '#1B6B4A' }}
        >
          {status === 'loading' ? 'Šaljem...' :
           status === 'success' ? 'Email poslat ✓' :
           'Pošalji link za promenu lozinke'}
        </button>

        {message && (
          <p className={`mt-2 text-sm ${
            status === 'success' ? 'text-green-600' : 'text-red-500'
          }`}>
            {message}
          </p>
        )}
      </div>

      {/* Sesija / Odjava */}
      <div className="mt-5 pt-5 border-t border-gray-100">
        <label className="block text-xs font-medium text-gray-500 mb-3">
          Sesija
        </label>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Odjavi se sa svih uređaja
        </button>
        <p className="mt-1.5 text-xs text-gray-400">
          Odjavljivanje sa svih aktivnih sesija i uređaja
        </p>
      </div>
    </div>
  )
}
