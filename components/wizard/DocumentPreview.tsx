'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { documentReminders } from '@/data/reminders'
import { ReminderBox } from '@/components/wizard/ReminderBox'

interface DocumentPreviewProps {
  text: string
  documentId: string
  documentType: string
  onReset: () => void
}

type ExportFormat = 'pdf' | 'docx'

async function downloadExport(documentId: string, format: ExportFormat): Promise<string | null> {
  const res = await fetch(`/api/export/${format}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: documentId }),
  })

  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    return (json as { error?: string }).error ?? 'Greška pri generisanju fajla.'
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const disposition = res.headers.get('Content-Disposition') ?? ''
  const match = disposition.match(/filename="([^"]+)"/)
  a.href = url
  a.download = match?.[1] ?? `dokument.${format}`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return null
}

export function DocumentPreview({ text, documentId, documentType, onReset }: DocumentPreviewProps) {
  const [loading, setLoading] = useState<ExportFormat | null>(null)
  const [error, setError] = useState('')
  const reminder = documentReminders[documentType]

  async function handleExport(format: ExportFormat) {
    setError('')
    setLoading(format)
    const err = await downloadExport(documentId, format)
    if (err) setError(err)
    setLoading(null)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Vaš dokument je spreman</h2>
          <p className="text-sm text-gray-500">Proverite sadržaj i preuzmite u željenom formatu.</p>
        </div>
        <button
          onClick={onReset}
          className="text-sm text-gray-500 hover:text-gray-800 underline underline-offset-2 transition-colors"
        >
          ← Novi dokument
        </button>
      </div>

      {reminder && <ReminderBox reminder={reminder} />}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <ExportButton
          label="Preuzmi PDF"
          format="pdf"
          loading={loading === 'pdf'}
          disabled={loading !== null}
          onClick={() => handleExport('pdf')}
          primary
        />
        <ExportButton
          label="Preuzmi DOCX"
          format="docx"
          loading={loading === 'docx'}
          disabled={loading !== null}
          onClick={() => handleExport('docx')}
        />
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Document text */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
        <div className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-strong:font-semibold">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400 text-center">
        Dokument je sačuvan u vašoj arhivi.
      </p>
    </div>
  )
}

function ExportButton({
  label, format, loading, disabled, onClick, primary,
}: {
  label: string
  format: ExportFormat
  loading: boolean
  disabled: boolean
  onClick: () => void
  primary?: boolean
}) {
  const icon = format === 'pdf'
    ? 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    : 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'

  const base = 'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
  const style = primary
    ? `${base} bg-[#1B6B4A] hover:bg-[#155C3E] text-white`
    : `${base} border border-gray-300 hover:bg-gray-50 text-gray-700`

  return (
    <button className={style} disabled={disabled} onClick={onClick}>
      {loading ? (
        <>
          <span className={`inline-block w-4 h-4 border-2 rounded-full animate-spin ${primary ? 'border-white/30 border-t-white' : 'border-gray-300 border-t-gray-600'}`} />
          Generišem...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
          {label}
        </>
      )}
    </button>
  )
}
