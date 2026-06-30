'use client'

import { useState } from 'react'
import type { MappedField } from '@/app/api/obrasci/analyze/route'

interface WizardViewProps {
  fields: MappedField[]
  fileRef: string
  type: 'acroform' | 'docx'
  filename: string
  onReset: () => void
}

export function WizardView({ fields, fileRef, type, filename, onReset }: WizardViewProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map(f => [f.key, f.value ?? '']))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const profileCount = fields.filter(f => f.source === 'profile').length
  const manualCount = fields.filter(f => f.source === 'manual').length

  async function handleDownload() {
    setLoading(true)
    setError('')
    try {
      const filledFields: MappedField[] = fields.map(f => ({
        ...f,
        value: values[f.key] || null,
      }))

      const res = await fetch('/api/obrasci/fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileRef, type, filename, fields: filledFields }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Greška pri preuzimanju.')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const disposition = res.headers.get('Content-Disposition') ?? ''
      const nameMatch = disposition.match(/filename="([^"]+)"/)
      a.download = nameMatch?.[1] ?? `popunjen-${filename}`
      a.href = url
      a.click()
      URL.revokeObjectURL(url)
      onReset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Neočekivana greška.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{filename}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {profileCount > 0 && (
              <span className="text-emerald-600 font-medium">{profileCount} {profileCount === 1 ? 'polje popunjeno' : 'polja popunjena'} iz profila</span>
            )}
            {profileCount > 0 && manualCount > 0 && <span className="mx-1">·</span>}
            {manualCount > 0 && <span>{manualCount} za ručni unos</span>}
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        >
          ← Novi obrazac
        </button>
      </div>

      {/* Polja */}
      <div className="grid gap-3">
        {fields.map(field => (
          <div key={field.key}>
            <div className="flex items-center gap-2 mb-1">
              <label className="text-sm font-medium text-gray-700">{field.label}</label>
              {field.source === 'profile' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                  Iz profila
                </span>
              )}
            </div>
            <input
              type="text"
              value={values[field.key] ?? ''}
              onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.source === 'manual' ? 'Unesite vrednost...' : ''}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#1B6B4A] focus:outline-none focus:ring-1 focus:ring-[#1B6B4A]"
              style={{ '--tw-ring-color': '#1B6B4A' } as React.CSSProperties}
            />
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}

      <button
        onClick={handleDownload}
        disabled={loading}
        className="mt-5 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        style={{ backgroundColor: '#1B6B4A' }}
      >
        {loading ? 'Priprema...' : 'Preuzmi popunjen dokument'}
      </button>
    </div>
  )
}
