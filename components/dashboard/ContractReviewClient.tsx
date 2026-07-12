'use client'

import { useCallback, useRef, useState } from 'react'

interface ReviewItem {
  naslov: string
  opis: string
  citat?: string
  obrazlozenje?: string
}

interface ReviewReport {
  u_domenu: boolean
  tip_ugovora: string
  rizicne_klauzule: ReviewItem[]
  sta_nedostaje: ReviewItem[]
  na_sta_paziti: ReviewItem[]
  sazetak: string
}

const BRAND = '#1B6B4A'

const TIP_LABELS: Record<string, string> = {
  nda: 'NDA sporazum',
  'ugovor-o-delu': 'Ugovor o delu',
  'ugovor-o-zakupu': 'Ugovor o zakupu',
  'ugovor-o-saradnji': 'Ugovor o saradnji',
  'ugovor-o-zajmu': 'Ugovor o zajmu',
  punomocje: 'Punomoćje',
  'ugovor-o-radu': 'Ugovor o radu',
  other: 'Poslovni ugovor',
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-gray-400">
      <path d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 2v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function Section({ title, icon, items, emptyText }: { title: string; icon: string; items: ReviewItem[]; emptyText: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
        <span>{icon}</span> {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyText}</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item, i) => (
            <li key={i} className="text-sm border-l-2 pl-3" style={{ borderColor: '#E5E7EB' }}>
              <p className="font-medium text-gray-800">{item.naslov}</p>
              <p className="text-gray-600 mt-0.5">{item.opis}</p>
              {item.citat && (
                <p className="text-xs text-gray-400 italic mt-1.5">&ldquo;{item.citat}&rdquo;</p>
              )}
              {item.obrazlozenje && (
                <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded-md px-2 py-1.5">
                  <span className="font-medium">Zašto: </span>{item.obrazlozenje}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const ACCEPTED_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

export function ContractReviewClient() {
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<ReviewReport | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function pickFile(f: File | null) {
    setError(null)
    if (!f) return
    if (!ACCEPTED_TYPES.has(f.type)) {
      setError('Podržani formati su PDF i DOCX.')
      return
    }
    setFile(f)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    pickFile(e.dataTransfer.files?.[0] ?? null)
  }, [])

  async function handleSubmit() {
    if (!file) return
    setLoading(true)
    setError(null)
    setReport(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/review-contract', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Greška pri obradi.')
        return
      }
      setReport(data.report)
    } catch {
      setError('Greška pri povezivanju. Pokušajte ponovo.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setFile(null)
    setReport(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-6">
      {!report && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          {!file ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className="rounded-xl border-2 border-dashed py-12 px-6 flex flex-col items-center text-center cursor-pointer transition-colors"
              style={{
                borderColor: dragActive ? BRAND : '#E5E7EB',
                backgroundColor: dragActive ? '#F0FDF4' : 'transparent',
              }}
            >
              <div className="h-11 w-11 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                <FileIcon />
              </div>
              <p className="text-sm font-medium text-gray-700">Prevucite ugovor ovde ili kliknite da izaberete fajl</p>
              <p className="text-xs text-gray-400 mt-1">PDF ili DOCX, maksimalno 8MB</p>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={e => pickFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                <FileIcon />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
              </div>
              {!loading && (
                <button
                  onClick={reset}
                  className="text-xs font-medium text-gray-400 hover:text-gray-600 shrink-0"
                >
                  Ukloni
                </button>
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

          {file && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-4 w-full sm:w-auto text-sm font-semibold px-5 py-2.5 rounded-lg text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: BRAND }}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                  <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
              {loading ? 'Analiziram ugovor...' : 'Analiziraj ugovor'}
            </button>
          )}
        </div>
      )}

      {report && !report.u_domenu && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm font-medium text-amber-900 mb-1">Ovaj dokument nije mogao da bude analiziran</p>
          <p className="text-sm text-amber-800">{report.sazetak}</p>
          <button
            onClick={reset}
            className="mt-4 text-sm font-medium underline text-amber-700 hover:text-amber-900"
          >
            Probaj sa drugim fajlom →
          </button>
        </div>
      )}

      {report && report.u_domenu && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-xs font-semibold px-2 py-1 rounded-md"
                style={{ backgroundColor: '#F0FDF4', color: BRAND }}
              >
                {TIP_LABELS[report.tip_ugovora] ?? 'Poslovni ugovor'}
              </span>
            </div>
            <p className="text-sm text-gray-700">{report.sazetak}</p>
          </div>

          <Section title="Rizične klauzule" icon="⚠️" items={report.rizicne_klauzule} emptyText="Nisu uočene očigledno rizične klauzule." />
          <Section title="Šta nedostaje" icon="🔍" items={report.sta_nedostaje} emptyText="Nema uočenih nedostajućih delova." />
          <Section title="Na šta obratiti pažnju" icon="💡" items={report.na_sta_paziti} emptyText="Nema dodatnih napomena." />

          <p className="text-xs text-gray-400">
            Ovo je informativna AI analiza, ne pravni savet. Za konačnu odluku o potpisivanju konsultujte advokata.
          </p>

          <button
            onClick={reset}
            className="text-sm font-medium underline text-gray-500 hover:text-gray-700"
          >
            Analiziraj drugi ugovor →
          </button>
        </div>
      )}
    </div>
  )
}
