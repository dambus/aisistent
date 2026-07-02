'use client'

import { useState } from 'react'
import type { FormSection, GuideField } from '@/types/obrasci'
import { isSignatureField } from '@/lib/documentIntelligence/signatureLabels'

interface SectionWizardViewProps {
  sections: FormSection[]
  filename: string
  onComplete: (fields: GuideField[]) => void
  onBack: () => void
}

export function SectionWizardView({ sections, filename, onComplete, onBack }: SectionWizardViewProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  // Lokalna kopija po sekciji — korisnik menja vrednosti dok se krece kroz sekcije
  const [fieldsBySection, setFieldsBySection] = useState<GuideField[][]>(() =>
    sections.map(s => s.fields.map(f => ({ ...f })))
  )
  // Koje je sekcije korisnik zaista video — ne blokira "Pregledaj i preuzmi", samo
  // informiše (nema poslovne logike/validacije vrednosti, samo navigaciono stanje).
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]))

  const activeSection = sections[activeIdx]
  const activeFields = fieldsBySection[activeIdx] ?? []
  const isFirst = activeIdx === 0
  const isLast = activeIdx === sections.length - 1
  const unvisitedCount = sections.length - visited.size

  function goTo(i: number) {
    setActiveIdx(i)
    setVisited(prev => new Set(prev).add(i))
  }

  function updateValue(fieldId: string, value: string) {
    setFieldsBySection(prev =>
      prev.map((fields, i) =>
        i !== activeIdx ? fields : fields.map(f => (f.id === fieldId ? { ...f, suggestedValue: value || null } : f))
      )
    )
  }

  function handleComplete() {
    onComplete(fieldsBySection.flat())
  }

  if (sections.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <p className="text-sm text-gray-400 text-center py-8">Nema polja za popunjavanje.</p>
        <button onClick={onBack} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">← Nazad</button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900 truncate">Popunjavanje: {filename}</h2>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-medium text-gray-400">[{activeIdx + 1}/{sections.length}]</span>
          <button onClick={onBack} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← Nazad
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sekcijska navigacija — dropdown na uskom ekranu (horizontalni tab bar postaje
            neupotrebljiv kod obrazaca sa 10+ sekcija, npr. PPDG-1S ima 19), vertikalna
            skrolabilna lista na desktopu */}
        <div className="md:hidden border-b border-gray-100 p-3">
          <select
            value={activeIdx}
            onChange={e => goTo(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white"
          >
            {sections.map((s, i) => (
              <option key={`${s.title}-${i}`} value={i}>
                {i + 1}/{sections.length} — {s.title}{visited.has(i) ? '' : ' (nepregledano)'}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden md:block md:w-64 shrink-0 border-r border-gray-100">
          <div className="flex flex-col overflow-y-auto md:max-h-[26rem] p-2 gap-1">
            {sections.map((s, i) => (
              <button
                key={`${s.title}-${i}`}
                onClick={() => goTo(i)}
                className={`text-left text-xs px-3 py-2 rounded-lg transition-colors shrink-0 ${
                  i === activeIdx
                    ? 'bg-[#1B6B4A]/10 text-[#1B6B4A] font-semibold'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {i === activeIdx ? '▶ ' : ''}{s.title}
                {!visited.has(i) && <span className="text-gray-300"> ·</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Polja aktivne sekcije */}
        <div className="flex-1 p-6 space-y-4 md:max-h-[26rem] overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{activeSection.title}</p>
          {activeFields.length > 0 ? (
            activeFields.map(field => (
              <WizardFieldRow key={field.id} field={field} onChange={v => updateValue(field.id, v)} />
            ))
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Nema polja u ovoj sekciji.</p>
          )}
        </div>
      </div>

      {/* Navigacija po sekcijama */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
        <button
          onClick={() => goTo(Math.max(0, activeIdx - 1))}
          disabled={isFirst}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Prethodna
        </button>
        <button
          onClick={() => goTo(Math.min(sections.length - 1, activeIdx + 1))}
          disabled={isLast}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Sledeća sekcija →
        </button>
      </div>

      {/* Pregledaj i preuzmi — dostupno od prve sekcije, ne ceka popunjavanje svih polja.
          Vodi na postojeći preview korak (potvrda + download), ne generiše fajl direktno —
          zato naziv i napomena o nepregledanim sekcijama, da korisnik ne pomisli da je gotov. */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 space-y-2">
        {unvisitedCount > 0 && (
          <p className="text-xs text-amber-600 text-center">
            Niste pregledali {unvisitedCount} od {sections.length} {sections.length === 1 ? 'sekcije' : 'sekcija'} — vrednosti u njima ostaju kakve jesu.
          </p>
        )}
        <button
          onClick={handleComplete}
          className="w-full rounded-lg bg-[#1B6B4A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#155a3d] transition-colors"
        >
          Pregledaj i preuzmi →
        </button>
      </div>
    </div>
  )
}

function WizardFieldRow({ field, onChange }: { field: GuideField; onChange: (v: string) => void }) {
  const label = field.label ?? 'Polje bez labele'

  if (isSignatureField(field.label)) {
    return (
      <div>
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-sm text-gray-400 italic rounded-lg border border-dashed border-gray-200 px-3 py-2.5">
          Potpisati na štampanom dokumentu
        </p>
      </div>
    )
  }

  if (field.isInternal) {
    return (
      <div>
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-sm text-gray-400 italic rounded-lg border border-dashed border-gray-200 px-3 py-2.5">
          Popunjava organ
        </p>
      </div>
    )
  }

  const badge = field.state === 'high'
    ? { text: 'Iz profila', className: 'text-emerald-700 bg-emerald-100' }
    : field.state === 'low'
      ? { text: 'Proverite', className: 'text-amber-700 bg-amber-100' }
      : null

  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={field.suggestedValue ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder={field.state === 'manual' ? 'Unesite vrednost' : undefined}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#1B6B4A] transition-colors"
        />
        {badge && (
          <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${badge.className}`}>
            ✓ {badge.text}
          </span>
        )}
      </div>
      {field.hint && <p className="text-[11px] text-gray-400 mt-1">{field.hint}</p>}
    </div>
  )
}
