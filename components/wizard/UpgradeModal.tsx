'use client'

import Link from 'next/link'

interface UpgradeModalProps {
  onClose: () => void
  title?: string
  description?: string
}

export function UpgradeModal({
  onClose,
  title = 'Mesečni limit dostignut',
  description = 'Besplatni plan omogućava 3 dokumenta mesečno. Pređite na Starter i generišite do 20 dokumenata.',
}: UpgradeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
          {[
            ['Starter — €9/mes', '20 dokumenata, PDF bez watermark-a'],
            ['Pro — €25/mes', 'Neograničeno, PDF + DOCX, arhiva'],
          ].map(([plan, desc]) => (
            <div key={plan} className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
              <div>
                <span className="text-sm font-medium text-gray-800">{plan}</span>
                <span className="text-xs text-gray-500 ml-1">— {desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Link
            href="/upgrade"
            className="block w-full bg-[#1B6B4A] hover:bg-[#155C3E] text-white text-sm font-medium py-2.5 rounded-lg text-center transition-colors"
          >
            Pogledajte planove
          </Link>
          <button
            onClick={onClose}
            className="block w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
          >
            Zatvori
          </button>
        </div>
      </div>
    </div>
  )
}
