'use client'

import { useState, useRef, useEffect } from 'react'
import type { GuideField } from '@/types/obrasci'

interface PreviewViewProps {
  fileRef: string
  pdfType: 'acroform' | 'flat'
  filename: string
  confirmedFields: GuideField[]
  onBack: (fields: GuideField[]) => void
  onReset: () => void
}

export function PreviewView({
  fileRef,
  pdfType,
  filename,
  confirmedFields,
  onBack,
  onReset,
}: PreviewViewProps) {
  // Lokalna kopija polja — korisnik može da menja vrednosti pre downloada
  const [fields, setFields] = useState<GuideField[]>(() =>
    confirmedFields.map(f => ({ ...f }))
  )
  const [confirmed, setConfirmed] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const autoFields = fields.filter(f => f.state !== 'manual' && f.suggestedValue !== null)
  const manualFields = fields.filter(f => f.state === 'manual' || f.suggestedValue === null)

  function updateValue(id: string, value: string) {
    setFields(prev => prev.map(f => f.id === id ? { ...f, suggestedValue: value || null } : f))
  }

  function toggleField(id: string) {
    setFields(prev => prev.map(f => {
      if (f.id !== id) return f
      // Toggle: ako je auto → manual; ako je manual → vraćamo originalni state
      const orig = confirmedFields.find(o => o.id === id)
      if (!orig) return f
      if (f.state === 'manual') return { ...orig }
      return { ...f, state: 'manual' as const, suggestedValue: null }
    }))
  }

  async function download() {
    setDownloading(true)
    setError(null)
    try {
      const res = await fetch('/api/obrasci/generate-filled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileRef, type: pdfType, confirmedFields: fields }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? 'Greška pri generisanju.')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename.replace(/\.pdf$/i, '') + '-popunjen.pdf'
      a.click()
      URL.revokeObjectURL(url)
      // Posle downloada vrati na idle
      onReset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri preuzimanju.')
    } finally {
      setDownloading(false)
    }
  }

  // Auto-scroll detekcija — kada korisnik dođe do kraja liste
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    function onScroll() {
      if (!el) return
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
        setConfirmed(true)
      }
    }
    el.addEventListener('scroll', onScroll)
    // Ako lista nije scrollable (kratka) — odmah otključaj
    if (el.scrollHeight <= el.clientHeight + 8) setConfirmed(true)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900 truncate max-w-xs">{filename}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {autoFields.length} {autoFields.length === 1 ? 'polje će biti upisano' : 'polja će biti upisana'} automatski
          </p>
        </div>
        <button
          onClick={() => onBack(fields)}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        >
          ← Nazad
        </button>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
        <svg className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-blue-700 leading-relaxed">
          Pregledajte vrednosti koje će biti upisane. Možete izmeniti tekst ili isključiti polje (×).
          Skrolujte listu do kraja ili čekirajte potvrdu ispod da biste preuzeli.
        </p>
      </div>

      {/* ── Polja koja se upisuju automatski ─────────────────────────────── */}
      {autoFields.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Automatsko popunjavanje ({autoFields.length})
          </p>
          <div
            ref={listRef}
            style={{ maxHeight: '18rem', overflowY: 'auto' }}
            className="space-y-2 pr-1"
          >
            {autoFields.map(field => (
              <AutoFieldRow
                key={field.id}
                field={field}
                onValueChange={(v) => updateValue(field.id, v)}
                onToggle={() => toggleField(field.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Manual podsetnici ─────────────────────────────────────────────── */}
      {manualFields.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Popunite sami u dokumentu ({manualFields.length})
          </p>
          <div style={{ maxHeight: '12rem', overflowY: 'auto' }} className="space-y-1.5 pr-1">
            {manualFields.map(field => (
              field.label ? (
                <div key={field.id} className="flex items-center gap-2 rounded-lg border border-dashed border-gray-200 px-3 py-2">
                  <span className="text-gray-300">·</span>
                  <span className="text-sm text-gray-500 truncate">{field.label}</span>
                </div>
              ) : null
            ))}
          </div>
        </div>
      )}

      {/* ── Confirm + Download ────────────────────────────────────────────── */}
      <div className="pt-1 space-y-3">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#1B6B4A] focus:ring-[#1B6B4A]"
          />
          <span className="text-sm text-gray-600">Pregledao/la sam vrednosti i potvrđujem</span>
        </label>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          onClick={download}
          disabled={!confirmed || downloading}
          className="w-full rounded-lg bg-[#1B6B4A] px-4 py-2.5 text-sm font-semibold text-white
            hover:bg-[#155a3d] transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {downloading ? 'Generisanje...' : 'Preuzmi popunjeni obrazac'}
        </button>
      </div>
    </div>
  )
}

interface AutoFieldRowProps {
  field: GuideField
  onValueChange: (v: string) => void
  onToggle: () => void
}

function AutoFieldRow({ field, onValueChange, onToggle }: AutoFieldRowProps) {
  const isDisabled = field.state === 'manual' || field.suggestedValue === null
  const badgeClass = field.state === 'high'
    ? 'bg-emerald-100 text-emerald-700'
    : field.state === 'low'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-gray-100 text-gray-400'

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
      isDisabled ? 'border-dashed border-gray-200 opacity-50' : 'border-gray-200 bg-gray-50'
    }`}>
      <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${badgeClass}`}>
        {field.state === 'high' ? 'Visok' : field.state === 'low' ? 'Proverite' : '—'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-400 leading-none mb-0.5 truncate">{field.label}</p>
        <input
          type="text"
          value={field.suggestedValue ?? ''}
          disabled={isDisabled}
          onChange={e => onValueChange(e.target.value)}
          className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none disabled:text-gray-400"
        />
      </div>
      <button
        onClick={onToggle}
        title={isDisabled ? 'Vrati' : 'Isključi'}
        className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors text-base leading-none"
      >
        {isDisabled ? '+' : '×'}
      </button>
    </div>
  )
}
