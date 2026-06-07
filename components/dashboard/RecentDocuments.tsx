'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TYPE_LABELS } from '@/lib/utils/documentTypes'

interface RecentDocument {
  id: string
  title: string
  type: string
  created_at: string
}

function formatSerbianDate(iso: string): string {
  const MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec']
  const d = new Date(iso)
  return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}.`
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + '...' : s
}

async function downloadPdf(documentId: string): Promise<string | null> {
  const res = await fetch('/api/export/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: documentId }),
  })

  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    return (json as { error?: string }).error ?? 'Greška pri preuzimanju PDF-a.'
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const disposition = res.headers.get('Content-Disposition') ?? ''
  const match = disposition.match(/filename="([^"]+)"/)
  a.href = url
  a.download = match?.[1] ?? 'dokument.pdf'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return null
}

export function RecentDocuments({ documents }: { documents: RecentDocument[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleDownload(documentId: string) {
    setError('')
    setLoadingId(documentId)
    const err = await downloadPdf(documentId)
    if (err) setError(err)
    setLoadingId(null)
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-6 text-sm text-gray-500">
        Još niste napravili nijedan dokument. Izaberite alat ispod i napravite prvi za 2 minuta.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {documents.map(doc => (
        <div
          key={doc.id}
          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-3.5"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {truncate(doc.title, 40)}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              {TYPE_LABELS[doc.type] ?? doc.type} · {formatSerbianDate(doc.created_at)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleDownload(doc.id)}
            disabled={loadingId !== null}
            className="ml-4 shrink-0 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            style={{ color: '#1B6B4A' }}
          >
            {loadingId === doc.id ? 'Preuzimam...' : 'PDF'}
          </button>
        </div>
      ))}

      <div className="pt-1">
        <Link href="/arhiva" className="text-xs text-gray-400 transition-colors hover:text-gray-600">
          Sva dokumenta →
        </Link>
      </div>
    </div>
  )
}
