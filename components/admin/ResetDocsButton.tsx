'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ResetDocsButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  async function handleReset() {
    if (!confirm('Resetovati brojač dokumenata za ovog korisnika?')) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/reset-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        setDone(true)
        setTimeout(() => setDone(false), 2000)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      title="Resetuj brojač dokumenata"
      className="text-xs text-gray-400 hover:text-orange-500 transition-colors disabled:opacity-50"
    >
      {loading ? '...' : done ? '✓' : '↺ reset'}
    </button>
  )
}
