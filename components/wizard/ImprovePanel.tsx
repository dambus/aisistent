'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

const PRIMARY = '#1B6B4A'
const STARTER_SESSION_LIMIT = 3

interface ImprovePanelProps {
  open: boolean
  onClose: () => void
  documentId: string
  documentType: string
  plan: string
  currentText: string
  onTextUpdated: (newText: string) => void
  onTextSaved: (newText: string) => void
}

export function ImprovePanel({
  open,
  onClose,
  documentId,
  documentType,
  plan,
  currentText,
  onTextUpdated,
  onTextSaved,
}: ImprovePanelProps) {
  const [instruction, setInstruction] = useState('')
  const [pendingText, setPendingText] = useState<string | null>(null)
  const [improveCount, setImproveCount] = useState(0)
  const [history, setHistory] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const isStarter = plan === 'starter'
  const limitReached = isStarter && improveCount >= STARTER_SESSION_LIMIT
  const hasPending = pendingText !== null && pendingText !== currentText && !saved

  async function handleApply() {
    if (!instruction.trim() || limitReached || loading) return
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generated_text: pendingText ?? currentText,
          instruction: instruction.trim(),
          doc_type: documentType,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Greška pri obradi.')
        return
      }
      const newText = json.improved_text
      setPendingText(newText)
      onTextUpdated(newText)
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
    const textToSave = pendingText ?? currentText
    setSaveLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generated_text: textToSave }),
      })
      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Greška pri čuvanju.')
        return
      }
      setSaved(true)
      onTextSaved(textToSave)
    } catch {
      setError('Greška pri čuvanju.')
    } finally {
      setSaveLoading(false)
    }
  }

  function handleClose() {
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <SheetContent className="flex flex-col gap-0 p-0" style={{ maxWidth: 460 }}>
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <SheetTitle className="text-base font-semibold text-gray-900">
            Poboljšaj dokument
          </SheetTitle>
          <p className="text-sm text-gray-500 mt-0.5">
            Opišite izmenu i AI će je primeniti na dokument.
          </p>
        </SheetHeader>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">

          {/* Starter session counter */}
          {isStarter && (
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-600">Izmene u ovoj sesiji</span>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: STARTER_SESSION_LIMIT }).map((_, i) => (
                    <span
                      key={i}
                      className="h-2 w-2 rounded-full transition-colors"
                      style={{ backgroundColor: i < improveCount ? '#D1D5DB' : PRIMARY }}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-gray-500">
                  {STARTER_SESSION_LIMIT - improveCount}/{STARTER_SESSION_LIMIT}
                </span>
              </div>
            </div>
          )}

          {/* Pending save notice */}
          {hasPending && !saved && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-amber-700">
                Izmene su primenjene ali <strong>nisu sačuvane</strong>. Možete pregledati dokument i sačuvati kada budete spremni.
              </p>
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
              <svg className="h-4 w-4 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-medium text-green-700">Izmene su sačuvane.</p>
            </div>
          )}

          {/* Instruction input */}
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
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"
              style={{ '--tw-ring-color': PRIMARY } as React.CSSProperties}
              onFocus={e => { e.currentTarget.style.boxShadow = `0 0 0 2px ${PRIMARY}40`; e.currentTarget.style.borderColor = PRIMARY }}
              onBlur={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '#E5E7EB' }}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleApply() }}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{instruction.length}/500</span>
              {!limitReached && (
                <span className="text-xs text-gray-400">Ctrl+Enter za slanje</span>
              )}
            </div>
          </div>

          {limitReached && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
              <p className="text-sm font-medium text-amber-800">Limit sesije dostignut</p>
              <p className="mt-1 text-sm text-amber-700">
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

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
              {error}
            </div>
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

          {/* Applied history */}
          {history.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Primenjene izmene
              </p>
              <ul className="space-y-1.5">
                {history.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="mt-0.5 h-4 w-4 shrink-0" style={{ color: PRIMARY }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              Zatvori
            </button>
            <button
              onClick={handleSave}
              disabled={!hasPending || saveLoading || saved}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: PRIMARY }}
            >
              {saveLoading ? 'Čuvam...' : saved ? 'Sačuvano ✓' : 'Sačuvaj dokument'}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
