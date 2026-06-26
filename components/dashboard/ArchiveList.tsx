'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TYPE_LABELS } from '@/lib/utils/documentTypes'
import { SendEmailModal } from '@/components/wizard/SendEmailModal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { TipSequence } from '@/components/ui/TipCard'

const ARCHIVE_TIPS = [
  {
    id: 'archive-nova-verzija',
    title: 'Nova verzija dokumenta',
    content: 'Kliknite "Nova verzija" pored dokumenta da kreirate izmenjenu kopiju — original ostaje netaknut u arhivi.',
    maxDocs: 10,
  },
  {
    id: 'archive-kreiraj-slican',
    title: 'Kreirajte sličan dokument',
    content: '"Kreiraj sličan" kopira sve podatke u novi nezavisni dokument — idealno za isti tip ugovora sa drugom stranom.',
    maxDocs: 10,
  },
  {
    id: 'archive-email',
    title: 'Pošaljite dokument emailom',
    content: 'Dokument možete poslati direktno klijentu — kliknite na ikonicu koverte pored dokumenta.',
    maxDocs: 10,
  },
  {
    id: 'archive-search',
    title: 'Pretražite arhivu',
    content: 'Koristite pretragu i filtere iznad liste da brzo pronađete dokument po nazivu ili tipu.',
    minDocs: 5,
    maxDocs: 25,
  },
  {
    id: 'archive-poboljsaj',
    title: 'Izmenite dokument jednom rečenicom',
    content: 'Otvorite dokument i kliknite "Poboljšaj dokument" — opišite izmenu, AI je primenjuje za sekunde.',
    minDocs: 1,
    maxDocs: 15,
  },
]

const PRIMARY = '#1B6B4A'

export interface ArchiveDocument {
  id: string
  type: string
  title: string
  created_at: string
  is_free: boolean
  version: number
  root_document_id: string | null
}

type ExportFormat = 'pdf' | 'docx'
type FilterValue = 'all' | 'contracts' | 'communication' | 'hr' | 'marketing'

const TYPE_CATEGORY: Record<string, Exclude<FilterValue, 'all'>> = {
  'ugovor-o-radu':            'contracts',
  'ugovor-o-delu':            'contracts',
  'nda':                      'contracts',
  'ugovor-o-zakupu':          'contracts',
  'ugovor-o-saradnji':        'contracts',
  'ugovor-o-saradnji-zajmu':  'contracts',
  'punomocje':                'contracts',
  'opsti-uslovi':             'contracts',
  'poslovni-mejl':            'communication',
  'ponuda-klijentu':          'communication',
  'oglas-za-posao':           'hr',
  'odgovor-kandidatu':        'hr',
  'preporuka':                'hr',
  'resenje-godisnji-odmor':   'hr',
  'pravilnik-o-radu':         'hr',
  'opis-proizvoda':           'marketing',
  'bio-o-nama':               'marketing',
  'zapisnik-sastanak':        'marketing',
}

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all',           label: 'Svi tipovi' },
  { value: 'contracts',     label: 'Ugovori' },
  { value: 'communication', label: 'Komunikacija' },
  { value: 'hr',            label: 'HR' },
  { value: 'marketing',     label: 'Marketing' },
]

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

const MONTHS_SR = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar']

function formatSerbianDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getUTCDate()}. ${MONTHS_SR[d.getUTCMonth()]} ${d.getUTCFullYear()}.`
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
  const router = useRouter()
  const hasVersionedDocs = documents.some(d => d.version > 1)
  const [filter, setFilter] = useState<FilterValue>('all')
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null)
  const [localDocuments, setLocalDocuments] = useState<ArchiveDocument[]>(documents)
  const [error, setError] = useState('')
  const [emailDoc, setEmailDoc] = useState<{ id: string; title: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [ratingDone, setRatingDone] = useState<Record<string, boolean>>({})
  const [commentOpen, setCommentOpen] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, string>>({})
  const [ratingSubmitting, setRatingSubmitting] = useState(false)

  async function submitRating(documentId: string, docType: string, rating: boolean, comment?: string) {
    setRatingSubmitting(true)
    try {
      await fetch('/api/document-rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: documentId, document_type: docType, rating, comment }),
      })
      setRatingDone(prev => ({ ...prev, [documentId]: rating }))
      setCommentOpen(null)
    } finally {
      setRatingSubmitting(false)
    }
  }

  useEffect(() => {
    setLocalDocuments(documents)
  }, [documents])

  const filteredDocuments = localDocuments.filter(doc => {
    const matchesFilter = filter === 'all' || TYPE_CATEGORY[doc.type] === filter
    const matchesSearch = debouncedSearch.trim() === '' ||
      doc.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (TYPE_LABELS[doc.type] ?? doc.type).toLowerCase().includes(debouncedSearch.toLowerCase())
    return matchesFilter && matchesSearch
  })

  async function handleDownload(documentId: string, format: ExportFormat) {
    setError('')
    setLoadingKey(`${documentId}:${format}`)
    const err = await downloadExport(documentId, format)
    if (err) setError(err)
    setLoadingKey(null)
  }

  async function handleDelete(documentId: string) {
    setDeletingId(documentId)
    setError('')

    try {
      const res = await fetch(`/api/documents/${documentId}`, { method: 'DELETE' })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError((json as { error?: string }).error ?? 'Greška pri brisanju.')
      } else {
        setLocalDocuments(prev => prev.filter(d => d.id !== documentId))
      }
    } catch {
      setError('Greška pri brisanju.')
    } finally {
      setDeletingId(null)
      setOpenMenuId(null)
    }
  }

  if (localDocuments.length === 0) {
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
    <div onClick={() => setOpenMenuId(null)}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Ukupno dokumenata: <span className="font-semibold text-gray-800">{localDocuments.length}</span>
        </p>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Pretraži dokumente..."
            className="rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 w-full sm:w-56"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Tip:</span>
          <Select value={filter} onValueChange={value => setFilter(value as FilterValue)}>
            <SelectTrigger className="w-40 border-gray-300 text-sm text-gray-800 focus:ring-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTERS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {filteredDocuments.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500">
          {debouncedSearch ? `Nema dokumenata za pretragu "${debouncedSearch}".` : 'Nema dokumenata za izabrani filter.'}
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
                    {doc.version > 1 && (
                      <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                        v{doc.version}
                      </span>
                    )}
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

                <div
                  className="flex items-center gap-2 lg:shrink-0"
                  onClick={event => event.stopPropagation()}
                >
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                      disabled={loadingKey !== null}
                      className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      {loadingKey?.startsWith(doc.id) ? 'Pripremam...' : 'Preuzmi'}
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openMenuId === doc.id && (
                      <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-xl border border-gray-200 bg-white shadow-lg">
                        <button
                          type="button"
                          onClick={() => { handleDownload(doc.id, 'pdf'); setOpenMenuId(null) }}
                          className="flex w-full items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => { handleDownload(doc.id, 'docx'); setOpenMenuId(null) }}
                          className="flex w-full items-center gap-2 rounded-b-xl border-t border-gray-100 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Word (DOCX)
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setEmailDoc({ id: doc.id, title: doc.title })}
                    disabled={loadingKey !== null}
                    title="Pošalji emailom"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-60"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push(`/dokumenti/${doc.type}?from=${doc.id}`)}
                    disabled={loadingKey !== null}
                    title="Napravi novu verziju"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-60"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>

                  <Link
                    href={`/arhiva/${doc.id}`}
                    title="Otvori dokument"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>

                  <button
                    type="button"
                    onClick={() => router.push(`/dokumenti/${doc.type}?from=${doc.id}&copy=1`)}
                    disabled={loadingKey !== null}
                    title="Kreiraj sličan dokument"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-60"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteDocId(doc.id)}
                    disabled={loadingKey !== null || deletingId !== null}
                    title="Obriši dokument"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-60"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-3 border-t border-gray-100 pt-3" onClick={e => e.stopPropagation()}>
                {doc.id in ratingDone ? (
                  <p className="text-xs text-gray-400">
                    {ratingDone[doc.id] ? 'Hvala! Drago nam je.' : 'Hvala na povratnoj informaciji — pomoći će nam da poboljšamo AIsistent.'}
                  </p>
                ) : commentOpen === doc.id ? (
                  <form
                    onSubmit={async e => { e.preventDefault(); await submitRating(doc.id, doc.type, false, comments[doc.id]) }}
                    className="flex flex-col gap-2 sm:flex-row sm:items-start"
                  >
                    <textarea
                      value={comments[doc.id] ?? ''}
                      onChange={e => setComments(prev => ({ ...prev, [doc.id]: e.target.value }))}
                      placeholder="Šta bi moglo biti bolje?"
                      rows={2}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#1B6B4A] focus:ring-1 focus:ring-[#1B6B4A] sm:flex-1"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => submitRating(doc.id, doc.type, false)}
                        disabled={ratingSubmitting}
                        className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        Preskoči
                      </button>
                      <button
                        type="submit"
                        disabled={ratingSubmitting}
                        className="rounded-lg bg-[#1B6B4A] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#155C3E] disabled:opacity-50"
                      >
                        {ratingSubmitting ? '...' : 'Pošalji'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">Da li ste zadovoljni dokumentom?</span>
                    <button
                      type="button"
                      onClick={() => submitRating(doc.id, doc.type, true)}
                      disabled={ratingSubmitting}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-green-50 hover:text-green-700 disabled:opacity-50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      Da
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommentOpen(doc.id)}
                      disabled={ratingSubmitting}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                      </svg>
                      Može bolje
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <TipSequence
        tips={[
          ...ARCHIVE_TIPS,
          ...(hasVersionedDocs ? [{
            id: 'archive-version-badge',
            title: 'Verzionisani dokumenti',
            content: 'Oznaka v2, v3... pokazuje da je dokument imao izmene. Sve verzije su sačuvane — originalni dokument ostaje netaknut.',
            maxDocs: 20,
          }] : []),
        ]}
        docCount={documents.length}
      />

      {emailDoc && (
        <SendEmailModal
          documentId={emailDoc.id}
          documentTitle={emailDoc.title}
          isOpen={true}
          onClose={() => setEmailDoc(null)}
        />
      )}

      <AlertDialog
        open={deleteDocId !== null}
        onOpenChange={(open) => { if (!open) setDeleteDocId(null) }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Obriši dokument?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova radnja je trajna i ne može se poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDocId(null)}>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                if (deleteDocId) {
                  handleDelete(deleteDocId)
                  setDeleteDocId(null)
                }
              }}
            >
              {deletingId !== null ? '...' : 'Obriši'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
