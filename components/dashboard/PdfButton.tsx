'use client'

import { useState } from 'react'
import { downloadExport } from '@/lib/client/downloadExport'

export function PdfButton({ documentId }: { documentId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleClick() {
    setLoading(true)
    setError('')
    try {
      const err = await downloadExport(documentId, 'pdf')
      if (err) setError(err)
    } catch {
      setError('Greška pri preuzimanju.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 transition-colors"
      >
        {loading ? 'Generišem...' : 'PDF'}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
