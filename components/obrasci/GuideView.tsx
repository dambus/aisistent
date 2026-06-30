'use client'

import { useState } from 'react'
import type { MappedField } from '@/app/api/obrasci/analyze/route'

interface GuideViewProps {
  fields: MappedField[]
  filename: string
  onReset: () => void
}

export function GuideView({ fields, filename, onReset }: GuideViewProps) {
  const [copied, setCopied] = useState<string | null>(null)

  function copy(key: string, value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  const profileFields = fields.filter(f => f.source === 'profile' && f.value)
  const manualFields = fields.filter(f => f.source === 'manual' || !f.value)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 print:shadow-none">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5 print:hidden">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{filename}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Ovaj tip dokumenta ne može biti automatski popunjen — koristite vodič ispod.
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        >
          ← Novi obrazac
        </button>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-4">
        <p className="text-base font-semibold">Vodič za popunjavanje: {filename}</p>
        <p className="text-xs text-gray-500">Generisano na aisistent.rs</p>
      </div>

      {/* Info baner */}
      <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 mb-5">
        <svg className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-blue-700 leading-relaxed">
          Otvorite originalni PDF, pronađite svako polje i unesite vrednosti iz liste ispod.
          Vrednosti iz vašeg profila firme možete kopirati klikom na dugme.
        </p>
      </div>

      {/* Vrednosti iz profila */}
      {profileFields.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Vrednosti iz profila firme
          </p>
          <div className="grid gap-2">
            {profileFields.map(field => (
              <div
                key={field.key}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500">{field.label}</p>
                  <p className="text-sm text-gray-900 font-medium truncate">{field.value}</p>
                </div>
                <button
                  onClick={() => copy(field.key, field.value!)}
                  className="shrink-0 text-xs px-2.5 py-1 rounded-md border border-gray-200 text-gray-500 hover:bg-white transition-colors print:hidden"
                >
                  {copied === field.key ? '✓' : 'Kopiraj'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ručni unos */}
      {manualFields.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Popuniti ručno
          </p>
          <div className="grid gap-2">
            {manualFields.map(field => (
              <div
                key={field.key}
                className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-gray-200 px-3 py-2.5"
              >
                <div>
                  <p className="text-xs font-medium text-gray-500">{field.label}</p>
                  <p className="text-sm text-gray-400 italic">popuniti ručno</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => window.print()}
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors print:hidden"
      >
        Odštampaj vodič
      </button>
    </div>
  )
}
