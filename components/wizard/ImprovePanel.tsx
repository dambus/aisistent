'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

const PRIMARY = '#1B6B4A'
const STARTER_LIMIT = 3

interface ImprovePanelProps {
  open: boolean
  onClose: () => void
  documentId: string
  documentType: string
  plan: string
  currentText: string
  onTextSaved: (newText: string) => void
}

export function ImprovePanel({
  open,
  onClose,
  documentId,
  documentType,
  plan,
  currentText,
  onTextSaved,
}: ImprovePanelProps) {
  const [instruction, setInstruction] = useState('')
  const [activeText, setActiveText] = useState(currentText)
  const [improveCount, setImproveCount] = useState(0)
  const [history, setHistory] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const isStarter = plan === 'starter'
  const limitReached = isStarter && improveCount >= STARTER_LIMIT
  const hasChanges = activeText !== currentText && !saved

  async function handleApply() {
    if (!instruction.trim() || limitReached) return
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generated_text: activeText,
          instruction: instruction.trim(),
          doc_type: documentType,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Greška pri obradi.')
        return
      }
      setActiveText(json.improved_text)
      setHistory(prev => [...prev, instruction.trim()])
      setImproveCount(c => c + 1)
      setInstruction('')
      setSaved(false)
    } catch {
      setError('Greška pri obradi. Pokušajte ponovo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaveLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generated_text: activeText }),
      })
      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Greška pri čuvanju.')
        return
      }
      setSaved(true)
      onTextSaved(activeText)
    } catch {
      setError('Greška pri čuvanju.')
    } finally {
      setSaveLoading(false)
    }
  }

  function handleClose() {
    if (hasChanges) {
      if (!window.confirm('Izmene nisu sačuvane. Da li sigurno želite da zatvorite?')) return
    }
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <SheetContent className="flex flex-col" style={{ maxWidth: 440 }}>
        <SheetHeader>
          <SheetTitle>Poboljšaj dokument</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto py-4">

          {/* Starter counter */}
          {isStarter && (
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-600">Dostupne izmene</span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: STARTER_LIMIT }).map((_, i) => (
                  <span
                    key={i}
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: i < improveCount ? '#D1D5DB' : PRIMARY,
                    }}
                  />
                ))}
                <span className="ml-1 text-xs font-medium text-gray-500">
                  {STARTER_LIMIT - improveCount}/{STARTER_LIMIT}
                </span>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Šta biste promenili?
            </label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value.slice(0, 500))}
              placeholder={'Npr: "Promeni rok isplate na 30 dana"\n"Dodaj klauzulu o poverljivosti"\n"Ukloni član 7"'}
              rows={4}
              disabled={limitReached || loading}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"
              style={{ '--tw-ring-color': PRIMARY } as React.CSSProperties}
              onFocus={e => { e.currentTarget.style.boxShadow = `0 0 0 2px ${PRIMARY}40`; e.currentTarget.style.borderColor = PRIMARY }}
              onBlur={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '#D1D5DB' }}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{instruction.length}/500</span>
              {limitReached && (
                <span className="text-xs text-amber-600">
                  Iskoristili ste sve izmene za Starter plan
                </span>
              )}
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            onClick={handleApply}
            disabled={!instruction.trim() || limitReached || loading}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: PRIMARY }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Primenjujem...
              </span>
            ) : 'Primeni izmenu'}
          </button>

          {/* History */}
          {history.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Primenjene izmene
              </p>
              <ul className="space-y-1.5">
                {history.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span style={{ color: PRIMARY }} className="mt-0.5 font-bold shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Upgrade note for Starter */}
          {isStarter && limitReached && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
              <p className="font-medium text-amber-800">Limit dostignut</p>
              <p className="mt-1 text-amber-700">
                Pro plan nudi neograničeno poboljšanje dokumenata.
              </p>
              <a
                href="/upgrade"
                className="mt-2 inline-block text-xs font-semibold underline"
                style={{ color: PRIMARY }}
              >
                Pogledajte Pro plan →
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 pt-4 space-y-2">
          {saved && (
            <p className="text-center text-sm font-medium" style={{ color: PRIMARY }}>
              ✓ Izmene su sačuvane
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              Zatvori
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saveLoading}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: PRIMARY }}
            >
              {saveLoading ? 'Čuvam...' : 'Sačuvaj'}
            </button>
          </div>
          {hasChanges && (
            <p className="text-center text-xs text-amber-600">
              Sačuvajte izmene pre preuzimanja dokumenta
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
