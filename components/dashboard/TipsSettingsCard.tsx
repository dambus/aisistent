'use client'

import { useTipsSettings } from '@/hooks/useTip'

export function TipsSettingsCard() {
  const { disabled, ready, enable, disable } = useTipsSettings()

  if (!ready) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
        Saveti o funkcijama
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        {disabled
          ? 'Saveti su isključeni. Možete ih ponovo uključiti — prikazaće se samo saveti koje još niste videli.'
          : 'Kratki saveti se pojavljuju dok koristite aplikaciju i objašnjavaju korisne funkcije.'}
      </p>
      {disabled ? (
        <button
          onClick={enable}
          className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors"
          style={{ backgroundColor: '#1B6B4A' }}
        >
          Uključi savete
        </button>
      ) : (
        <button
          onClick={disable}
          className="px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Isključi savete
        </button>
      )}
    </div>
  )
}
