'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface SecurityCardProps {
  email: string
}

export function SecurityCard({ email }: SecurityCardProps) {
  const router = useRouter()
  const supabase = createClient()

  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [signoutLoading, setSignoutLoading] = useState(false)

  async function handlePasswordReset() {
    setResetStatus('loading')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    setResetStatus(error ? 'error' : 'success')
  }

  async function handleGlobalSignout() {
    setSignoutLoading(true)
    await supabase.auth.signOut({ scope: 'global' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-5">Bezbednost</h2>

      {/* Promena lozinke */}
      <div className="mb-5 pb-5 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900 mb-0.5">Promena lozinke</p>
        <p className="text-xs text-gray-500 mb-3">Pošaljite link za promenu lozinke na vaš email</p>

        {resetStatus === 'success' ? (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            Link poslat na <strong>{email}</strong>. Proverite inbox i spam folder.
          </p>
        ) : resetStatus === 'error' ? (
          <div className="space-y-2">
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              Došlo je do greške. Pokušajte ponovo.
            </p>
            <button
              onClick={handlePasswordReset}
              className="px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Pokušaj ponovo
            </button>
          </div>
        ) : (
          <button
            onClick={handlePasswordReset}
            disabled={resetStatus === 'loading'}
            className="px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {resetStatus === 'loading' ? 'Šaljem...' : 'Pošalji link za promenu lozinke'}
          </button>
        )}
      </div>

      {/* Globalna odjava */}
      <div>
        <p className="text-sm font-medium text-gray-900 mb-0.5">Odjava sa svih uređaja</p>
        <p className="text-xs text-gray-500 mb-3">Odjavite se sa svih uređaja istovremeno</p>
        <button
          onClick={handleGlobalSignout}
          disabled={signoutLoading}
          className="px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          {signoutLoading ? 'Odjavljivanje...' : 'Odjavite se sa svih uređaja'}
        </button>
      </div>
    </div>
  )
}
