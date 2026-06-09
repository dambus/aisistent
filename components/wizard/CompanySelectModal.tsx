'use client'

import Link from 'next/link'
import type { Company } from '@/types/database'

interface CompanySelectModalProps {
  companies: Company[]
  onSelect: (company: Company) => void
  onSkip: () => void
  isOpen: boolean
}

export function CompanySelectModal({ companies, onSelect, onSkip, isOpen }: CompanySelectModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onSkip}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Koja firma zaključuje dokument?
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Izaberite sačuvanu firmu ili popunite ručno
        </p>

        {companies.length > 0 ? (
          <>
            <div className="space-y-2 mb-5">
              {companies.map(company => (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => onSelect(company)}
                  className="w-full text-left border border-gray-200 rounded-xl p-4 transition-all hover:border-[#1B6B4A] hover:bg-green-50 focus:outline-none focus:border-[#1B6B4A]"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{company.naziv}</span>
                    {company.is_default && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}
                      >
                        Podrazumevana
                      </span>
                    )}
                  </div>
                  {(company.pib || company.grad) && (
                    <div className="mt-0.5 text-xs text-gray-500 space-x-2">
                      {company.pib && <span>PIB: {company.pib}</span>}
                      {company.grad && <span>{company.grad}</span>}
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">ili</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              type="button"
              onClick={onSkip}
              className="w-full py-2.5 text-sm font-semibold border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Popuni ručno
            </button>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-4">Još niste dodali firme.</p>
            <Link
              href="/profil"
              className="inline-block mb-3 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors"
              style={{ backgroundColor: '#1B6B4A' }}
            >
              Dodajte firmu
            </Link>
            <br />
            <button
              type="button"
              onClick={onSkip}
              className="w-full py-2.5 text-sm font-semibold border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Popuni ručno
            </button>
          </div>
        )}

        <p className="mt-4 text-xs text-gray-400 text-center">
          Firme možete dodati u{' '}
          <Link href="/profil" className="underline hover:text-gray-600">
            Profil → Moje firme
          </Link>
        </p>
      </div>
    </div>
  )
}
