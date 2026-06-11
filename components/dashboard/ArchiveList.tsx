'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TYPE_LABELS } from '@/lib/utils/documentTypes'
import { SendEmailModal } from '@/components/wizard/SendEmailModal'

const PRIMARY = '#1B6B4A'

export interface ArchiveDocument {
  id: string
  type: string
  title: string
  created_at: string
  is_free: boolean
}

type ExportFormat = 'pdf' | 'docx'
type FilterValue = 'all' | 'contracts' | 'communication' | 'hr'

const TYPE_CATEGORY: Record<string, Exclude<FilterValue, 'all'>> = {
  'ugovor-o-radu': 'contracts',
  'ugovor-o-delu': 'contracts',
  nda: 'contracts',
  'ugovor-o-zakupu': 'contracts',
  'ugovor-o-saradnji': 'contracts',
  punomocje: 'contracts',
  'opsti-uslovi': 'contracts',
  'poslovni-mejl': 'communication',
  'ponuda-klijentu': 'communication',
  'oglas-za-posao': 'hr',
}

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'Svi tipovi' },
  { value: 'contracts', label: 'Ugovori' },
  { value: 'communication', label: 'Komunikacija' },
  { value: 'hr', label: 'HR' },
]

function formatSerbianDate(iso: string): string {
  return new Date(iso).toLocaleDateString('sr-Latn-RS', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

async function downloadExport(documentId: string, format: ExportFormat): Promise<string | null> {
  const res = await fetch(`/api/export/${format}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: documentId }),
  })

  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    return (json as { error?: string }).error ?? 'Greška pri preuzimanju dokumenta.'
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

export function ArchiveList({ documents }: { documents: ArchiveDocument[] }) {
  const [filter, setFilter] = useState<FilterValue>('all')
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [emailDoc, setEmailDoc] = useState<{ id: string; title: string } | null>(null)

  const filteredDocuments = documents.filter(doc =>
    filter === 'all' ? true : TYPE_CATEGORY[doc.type] === filter
  )

  async function handleDownload(documentId: string, format: ExportFormat) {
    setError('')
    setLoadingKey(`${documentId}:${format}`)
    const err = await downloadExport(documentId, format)
    if (err) setError(err)
    setLoadingKey(null)
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center">
        <h2 className="text-lg font-semibold text-gray-900">Još niste napravili nijedan dokument.</h2>
        <Link href="/dashboard" className="mt-3 inline-flex text-sm font-semibold" style={{ color: PRIMARY }}>
          Počnite sada →
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Ukupno dokumenata: <span className="font-semibold text-gray-800">{documents.length}</span>
        </p>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          Tip:
          <select
            value={filter}
            onChange={event => setFilter(event.target.value as FilterValue)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#1B6B4A] focus:ring-2 focus:ring-[#1B6B4A]/10"
          >
            {FILTERS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {filteredDocuments.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500">
          Nema dokumenata za izabrani filter.
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredDocuments.map(doc => (
            <article
              key={doc.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-base font-semibold text-gray-900">{doc.title}</h2>
                    {doc.is_free && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        Besplatna verzija
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {TYPE_LABELS[doc.type] ?? doc.type} · {formatSerbianDate(doc.created_at)}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownload(doc.id, 'pdf')}
                    disabled={loadingKey !== null}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    {loadingKey === `${doc.id}:pdf` ? 'Pripremam PDF...' : 'Preuzmi PDF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(doc.id, 'docx')}
                    disabled={loadingKey !== null}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingKey === `${doc.id}:docx` ? 'Pripremam DOCX...' : 'Preuzmi DOCX'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailDoc({ id: doc.id, title: doc.title })}
                    disabled={loadingKey !== null}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Pošalji emailom
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {emailDoc && (
        <SendEmailModal
          documentId={emailDoc.id}
          documentTitle={emailDoc.title}
          isOpen={true}
          onClose={() => setEmailDoc(null)}
        />
      )}
    </div>
  )
}
