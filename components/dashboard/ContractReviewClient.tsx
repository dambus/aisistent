'use client'

import { useRef, useState } from 'react'

interface ReviewItem {
  naslov: string
  opis: string
  citat?: string
}

interface ReviewReport {
  rizicne_klauzule: ReviewItem[]
  sta_nedostaje: ReviewItem[]
  na_sta_paziti: ReviewItem[]
  sazetak: string
}

const BRAND = '#1B6B4A'

function Section({ title, icon, items, emptyText }: { title: string; icon: string; items: ReviewItem[]; emptyText: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
        <span>{icon}</span> {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyText}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="text-sm">
              <p className="font-medium text-gray-800">{item.naslov}</p>
              <p className="text-gray-600 mt-0.5">{item.opis}</p>
              {item.citat && (
                <p className="text-xs text-gray-400 italic mt-1 border-l-2 border-gray-200 pl-2">&ldquo;{item.citat}&rdquo;</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ContractReviewClient() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<ReviewReport | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
          <label className="block">
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:text-white file:cursor-pointer file:bg-[#1B6B4A]"
            />
          </label>
          <p className="text-xs text-gray-400 mt-2">PDF ili DOCX, maksimalno 8MB.</p>

          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="mt-4 w-full sm:w-auto text-sm font-semibold px-5 py-2.5 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: BRAND }}
          >
            {loading ? 'Analiziram...' : 'Analiziraj ugovor'}
          </button>
        </div>
      )}

      {report && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
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
