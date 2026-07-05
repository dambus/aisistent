'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { LibraryFormMeta } from '@/lib/libraryForms'
import { formatDateSr } from '@/lib/libraryForms'

interface ObrasciSearchProps {
  forms: LibraryFormMeta[]
  categoryLabels: Record<string, string>
  categoryOrder: string[]
}

const P = '#1B6B4A'

// Pretraga sa debounce-om (250ms) — korisnik često traži po oznaci obrasca (npr. "PPDG-1S")
// koju je čuo/pročitao negde drugde, zato pretraga gleda i shortName, ne samo naslov.
export function ObrasciSearch({ forms, categoryLabels, categoryOrder }: ObrasciSearchProps) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250)
    return () => clearTimeout(t)
  }, [query])

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase()
    if (!q) return forms
    return forms.filter(f =>
      f.shortName.toLowerCase().includes(q) ||
      f.title.toLowerCase().includes(q) ||
      f.sourceInstitution.toLowerCase().includes(q) ||
      (f.description ?? '').toLowerCase().includes(q)
    )
  }, [forms, debounced])

  const byCategory = useMemo(() => {
    const map = new Map<string, LibraryFormMeta[]>()
    for (const key of categoryOrder) map.set(key, [])
    for (const f of filtered) {
      if (!map.has(f.category)) map.set(f.category, [])
      map.get(f.category)!.push(f)
    }
    return map
  }, [filtered, categoryOrder])

  return (
    <div>
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Pretražite po nazivu ili oznaci obrasca (npr. PPDG-1S)..."
          className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-sm text-gray-800 placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-colors"
        />
      </div>

      {debounced.trim() !== '' && filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-gray-400">
          Nema obrazaca za &ldquo;{debounced}&rdquo;.
        </p>
      )}

      {[...byCategory.entries()].map(([category, items]) =>
        items.length === 0 ? null : (
          <section key={category} className="py-8 border-b border-gray-100 last:border-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-5 mt-2">
              {categoryLabels[category] ?? category}
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {items.map(form => (
                <Link key={form.slug} href={`/obrasci/${form.slug}`}
                  className="group rounded-2xl border border-gray-200 p-5 hover:border-green-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest rounded-full px-2.5 py-1"
                      style={{ backgroundColor: '#f0fdf4', color: P }}>
                      {form.shortName}
                    </span>
                    <span className="text-gray-300 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all text-sm">→</span>
                  </div>
                  <h2 className="mt-3 text-sm font-semibold text-gray-800 leading-snug group-hover:text-green-800 transition-colors line-clamp-2">
                    <span className="text-gray-400 font-normal">{form.shortName} — </span>{form.title}
                  </h2>
                  {form.description && (
                    <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-2">{form.description}</p>
                  )}
                  <p className="mt-3 text-[11px] text-gray-400">
                    {form.sourceInstitution} · proveren {formatDateSr(form.verifiedAt)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )
      )}
    </div>
  )
}
