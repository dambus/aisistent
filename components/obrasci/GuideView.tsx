'use client'

import { useState } from 'react'
import type { GuideField } from '@/types/obrasci'

interface GuideViewProps {
  fields: GuideField[]
  filename: string
  onReset: () => void
  onAutoFill?: (confirmedFields: GuideField[]) => void
  // Otvara SectionWizardView (Faza 3) — struktura sekcija se gradi u ObraściClient
  // (potreban je fields + sectionShapes, koje GuideView ne drži), zato bez argumenata.
  onWizard?: () => void
}

function CheckIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function WarnIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  )
}

function CircleIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  )
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

interface FieldCardProps {
  field: GuideField
  copied: string | null
  onCopy: (id: string, value: string) => void
}

function HighCard({ field, copied, onCopy }: FieldCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2.5">
      <span className="flex items-center gap-1 shrink-0 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
        <CheckIcon />
        Iz profila
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-emerald-700/70 leading-none mb-0.5 truncate">{field.label}</p>
        <p className="text-sm font-medium text-gray-900 truncate">{field.suggestedValue}</p>
        {field.hint && <p className="text-[11px] text-emerald-700/60 mt-0.5">{field.hint}</p>}
      </div>
      <button
        onClick={() => onCopy(field.id, field.suggestedValue!)}
        className="shrink-0 text-xs px-2 py-1 rounded-md border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors print:hidden"
      >
        {copied === field.id ? '✓' : 'Kopiraj'}
      </button>
    </div>
  )
}

function LowCard({ field, copied, onCopy }: FieldCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2.5">
      <span className="flex items-center gap-1 shrink-0 text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
        <WarnIcon />
        Proverite
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-amber-700/70 leading-none mb-0.5 truncate">{field.label}</p>
        <p className="text-sm font-medium text-gray-900 truncate">{field.suggestedValue}</p>
        {field.hint && <p className="text-[11px] text-amber-700/60 mt-0.5">{field.hint}</p>}
      </div>
      <button
        onClick={() => onCopy(field.id, field.suggestedValue!)}
        className="shrink-0 text-xs px-2 py-1 rounded-md border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors print:hidden"
      >
        {copied === field.id ? '✓' : 'Kopiraj'}
      </button>
    </div>
  )
}

function ManualCard({ field }: { field: GuideField }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-200 bg-white px-3 py-2.5">
      <span className="flex items-center gap-1 shrink-0 text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
        <CircleIcon />
        Ručno
      </span>
      <div className="min-w-0 flex-1">
        {field.label ? (
          <p className="text-sm text-gray-500 truncate">{field.label}</p>
        ) : (
          <p className="text-sm text-gray-300 italic">polje bez labele</p>
        )}
        {field.hint && <p className="text-[11px] text-gray-400 mt-0.5">{field.hint}</p>}
      </div>
    </div>
  )
}

export function GuideView({ fields, filename, onReset, onAutoFill, onWizard }: GuideViewProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [manualExpanded, setManualExpanded] = useState(false)

  function copy(id: string, value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  const highFields = fields.filter(f => f.state === 'high')
  const lowFields = fields.filter(f => f.state === 'low')
  const manualFields = fields.filter(f => f.state === 'manual')
  const suggestedCount = highFields.length + lowFields.length

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 print:shadow-none">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5 print:hidden">
        <div>
          <h2 className="text-base font-semibold text-gray-900 truncate max-w-xs">{filename}</h2>
          <p className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-x-1">
            {suggestedCount > 0 && (
              <span className="text-emerald-600 font-medium">
                {suggestedCount} {suggestedCount === 1 ? 'polje predloženo' : 'polja predložena'} iz profila
              </span>
            )}
            {suggestedCount > 0 && manualFields.length > 0 && <span className="text-gray-300">·</span>}
            {manualFields.length > 0 && (
              <span>{manualFields.length} za ručno popunjavanje</span>
            )}
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

      {/* Legenda */}
      <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 mb-5 print:hidden">
        <svg className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-blue-700 leading-relaxed">
          Otvorite originalni PDF i popunite vrednosti prema ovom vodiču.
          {' '}<span className="font-semibold text-emerald-700">Zeleno</span> = potvrđeno iz profila, kopirajte direktno.
          {' '}<span className="font-semibold text-amber-600">Narandžasto</span> = predlog, proverite pre unosa.
          {' '}<span className="font-semibold text-gray-500">Sivo</span> = popunite sami.
        </p>
      </div>

      {/* ── Predlozi iz profila ─────────────────────────────────────────── */}
      {suggestedCount > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Predlozi iz profila firme
          </p>
          <div className="grid gap-2">
            {highFields.map(field => (
              <HighCard key={field.id} field={field} copied={copied} onCopy={copy} />
            ))}
            {lowFields.map(field => (
              <LowCard key={field.id} field={field} copied={copied} onCopy={copy} />
            ))}
          </div>
        </div>
      )}

      {/* ── Polja za ručno popunjavanje ─────────────────────────────────── */}
      {manualFields.length > 0 && (
        <div className="mb-5">
          <button
            onClick={() => setManualExpanded(e => !e)}
            className="flex w-full items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 print:hidden hover:text-gray-600 transition-colors"
          >
            <span>Polja za ručno popunjavanje ({manualFields.length})</span>
            <ChevronIcon expanded={manualExpanded} />
          </button>

          {/* Print uvek pokazuje manual polja */}
          <div className={`grid gap-2 ${manualExpanded ? '' : 'hidden'} print:grid`}>
            {manualFields.map(field => (
              <ManualCard key={field.id} field={field} />
            ))}
          </div>
        </div>
      )}

      {suggestedCount === 0 && manualFields.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">Nisu pronađena polja za popunjavanje.</p>
      )}

      <div className="flex flex-col gap-2 print:hidden">
        {onAutoFill && suggestedCount > 0 && (
          <button
            onClick={() => onAutoFill(fields)}
            className="w-full rounded-lg bg-[#1B6B4A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#155a3d] transition-colors"
          >
            Popuni automatski →
          </button>
        )}
        {onWizard && (suggestedCount > 0 || manualFields.length > 0) && (
          <button
            onClick={onWizard}
            className="w-full rounded-lg border border-[#1B6B4A] px-4 py-2.5 text-sm font-semibold text-[#1B6B4A] hover:bg-green-50 transition-colors"
          >
            Popuni sve →
          </button>
        )}
        <button
          onClick={() => window.print()}
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Odštampaj vodič
        </button>
      </div>
    </div>
  )
}
