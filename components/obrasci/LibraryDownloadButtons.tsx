'use client'

import { useState } from 'react'

interface LibraryDownloadButtonsProps {
  slug: string
  shortName: string
}

// Dugmad za download obrasca iz biblioteke (Faza 4).
// Prazan: direktan link (javan). Popunjen: fetch sa auth — 401 vodi na login,
// 403 na upgrade, 400 (nema profila) na profil.
export function LibraryDownloadButtons({ slug, shortName }: LibraryDownloadButtonsProps) {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function downloadFilled() {
    setDownloading(true)
    setError(null)
    try {
      const res = await fetch(`/api/obrasci/library/${slug}/download?filled=1`)
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        if (res.status === 401) {
          window.location.href = `/login?next=/obrasci/${slug}`
          return
        }
        if (res.status === 403 && d.error === 'plan') {
          window.location.href = '/upgrade'
          return
        }
        if (res.status === 400 && d.error === 'no-company') {
          setError('Popunite profil firme pre preuzimanja — podaci se upisuju iz profila.')
          return
        }
        throw new Error(d.error ?? 'Greška pri preuzimanju.')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${slug}-popunjen.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri preuzimanju.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={downloadFilled}
          disabled={downloading}
          className="flex-1 rounded-xl bg-[#1B6B4A] px-5 py-3 text-sm font-bold text-white
            hover:bg-[#155a3d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? 'Priprema...' : 'Preuzmi popunjeno mojim podacima'}
        </button>
        <a
          href={`/api/obrasci/library/${slug}/download`}
          className="flex-1 rounded-xl border border-gray-300 px-5 py-3 text-sm font-bold text-gray-700
            text-center hover:bg-gray-50 transition-colors"
        >
          Preuzmi prazan obrazac
        </a>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      <p className="text-xs text-gray-400 leading-relaxed">
        U popunjeni {shortName} upisujemo podatke iz vašeg profila firme. Ostala polja popunite
        ručno u Adobe Reader-u ili drugom PDF softveru — za tačnost i kompletnost obrasca
        odgovoran je podnosilac.
      </p>
    </div>
  )
}
