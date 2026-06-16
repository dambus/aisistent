'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  userName: string | null
}

type Step = 'dobrodoslica' | 'firma' | 'prvi_dokument'

const DOCUMENT_SUGGESTIONS = [
  { type: 'ugovor-o-radu',          label: 'Ugovor o radu',       icon: '👔', desc: 'Za zapošljavanje radnika' },
  { type: 'ugovor-o-delu',          label: 'Ugovor o delu',       icon: '🤝', desc: 'Za saradnike i freelancere' },
  { type: 'faktura',                 label: 'Faktura',             icon: '🧾', desc: 'Za fakturisanje klijenata' },
  { type: 'nda',                     label: 'NDA Sporazum',        icon: '🔒', desc: 'Za čuvanje poverljivosti' },
  { type: 'ugovor-o-zakupu',        label: 'Ugovor o zakupu',     icon: '🏢', desc: 'Za iznajmljivanje prostora' },
  { type: 'ponuda-klijentu',        label: 'Ponuda klijentu',     icon: '📋', desc: 'Za slanje ponuda' },
  { type: 'ugovor-o-saradnji',      label: 'Ugovor o saradnji',   icon: '🤝', desc: 'Za poslovnu saradnju' },
  { type: 'poslovni-mejl',          label: 'Poslovni mejl',       icon: '✉️', desc: 'Za profesionalnu komunikaciju' },
]

export function OnboardingModal({ userName }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('dobrodoslica')
  const [loading, setLoading] = useState(false)

  const [naziv, setNaziv] = useState('')
  const [pib, setPib] = useState('')
  const [adresa, setAdresa] = useState('')
  const [grad, setGrad] = useState('')
  const [zastupnik, setZastupnik] = useState('')
  const [firmaError, setFirmaError] = useState('')
  const [firmaLoading, setFirmaLoading] = useState(false)

  async function markOnboarded() {
    await fetch('/api/profile/onboarded', { method: 'POST' })
  }

  async function handleSkip() {
    setLoading(true)
    await markOnboarded()
    router.refresh()
  }

  async function handleSaveFirma() {
    if (!naziv.trim()) {
      setFirmaError('Naziv firme je obavezan.')
      return
    }
    setFirmaLoading(true)
    setFirmaError('')
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naziv, pib, adresa, grad, zastupnik, is_default: true }),
      })
      if (!res.ok) {
        const json = await res.json()
        setFirmaError(json.error ?? 'Greška pri čuvanju firme.')
        return
      }
      setStep('prvi_dokument')
    } catch {
      setFirmaError('Greška pri čuvanju firme.')
    } finally {
      setFirmaLoading(false)
    }
  }

  async function handlePickDocument(type: string) {
    setLoading(true)
    await markOnboarded()
    router.push(`/dokumenti/${type}`)
  }

  async function handleFinish() {
    setLoading(true)
    await markOnboarded()
    router.refresh()
  }

  const firstName = userName?.split(' ')[0] ?? null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{
              backgroundColor: '#1B6B4A',
              width: step === 'dobrodoslica' ? '33%'
                   : step === 'firma' ? '66%'
                   : '100%'
            }}
          />
        </div>

        {/* ── Korak 1: Dobrodošlica ── */}
        {step === 'dobrodoslica' && (
          <div className="p-8 text-center">
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
              style={{ backgroundColor: '#F0F7F4' }}
            >
              👋
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Dobrodošli{firstName ? `, ${firstName}` : ''}!
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              AIsistent vam pomaže da za 2 minuta napravite profesionalne
              poslovne dokumente. Hajde da podesimo vaš nalog.
            </p>
            <div className="space-y-3 text-left mb-8">
              {[
                { icon: '🏢', text: 'Sačuvajte podatke o svojoj firmi — popunjavaju se automatski' },
                { icon: '📄', text: '18 tipova dokumenata — ugovori, fakture, HR i još mnogo' },
                { icon: '⚡', text: 'PDF i Word export za svaki dokument' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <span className="text-xl">{icon}</span>
                  <p className="text-sm text-gray-600 pt-0.5">{text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                disabled={loading}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Preskoči
              </button>
              <button
                onClick={() => setStep('firma')}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: '#1B6B4A' }}
              >
                Počnimo →
              </button>
            </div>
          </div>
        )}

        {/* ── Korak 2: Podaci o firmi ── */}
        {step === 'firma' && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Podaci o firmi</h2>
            <p className="text-sm text-gray-500 mb-6">
              Ovi podaci će se automatski popunjavati u svakom dokumentu.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Naziv firme / preduzetnika <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={naziv}
                  onChange={e => setNaziv(e.target.value)}
                  placeholder="npr. Sigma Solutions doo"
                  style={{ fontSize: '16px' }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1B6B4A] focus:ring-2 focus:ring-[#1B6B4A]/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PIB</label>
                  <input
                    type="text"
                    value={pib}
                    onChange={e => setPib(e.target.value)}
                    placeholder="123456789"
                    style={{ fontSize: '16px' }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1B6B4A] focus:ring-2 focus:ring-[#1B6B4A]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grad</label>
                  <input
                    type="text"
                    value={grad}
                    onChange={e => setGrad(e.target.value)}
                    placeholder="npr. Novi Sad"
                    style={{ fontSize: '16px' }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1B6B4A] focus:ring-2 focus:ring-[#1B6B4A]/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresa sedišta</label>
                <input
                  type="text"
                  value={adresa}
                  onChange={e => setAdresa(e.target.value)}
                  placeholder="npr. Mihajla Pupina 10"
                  style={{ fontSize: '16px' }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1B6B4A] focus:ring-2 focus:ring-[#1B6B4A]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zakonski zastupnik</label>
                <input
                  type="text"
                  value={zastupnik}
                  onChange={e => setZastupnik(e.target.value)}
                  placeholder="npr. Petar Nikolić, direktor"
                  style={{ fontSize: '16px' }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1B6B4A] focus:ring-2 focus:ring-[#1B6B4A]/20"
                />
              </div>
            </div>

            {firmaError && (
              <p className="mt-3 text-sm text-red-500">{firmaError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('dobrodoslica')}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ← Nazad
              </button>
              <button
                onClick={handleSaveFirma}
                disabled={firmaLoading}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
                style={{ backgroundColor: '#1B6B4A' }}
              >
                {firmaLoading ? 'Čuvam...' : 'Sačuvaj i nastavi →'}
              </button>
            </div>

            <button
              onClick={() => setStep('prvi_dokument')}
              className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors"
            >
              Preskoči ovaj korak
            </button>
          </div>
        )}

        {/* ── Korak 3: Prvi dokument ── */}
        {step === 'prvi_dokument' && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Koji dokument vam treba?</h2>
            <p className="text-sm text-gray-500 mb-5">
              Odaberite tip dokumenta i odmah ćemo početi.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-6">
              {DOCUMENT_SUGGESTIONS.map(({ type, label, icon, desc }) => (
                <button
                  key={type}
                  onClick={() => handlePickDocument(type)}
                  disabled={loading}
                  className="flex flex-col items-start gap-1 rounded-xl border border-gray-200 p-3 text-left transition-all hover:border-[#1B6B4A] hover:bg-[#F0F7F4] disabled:opacity-50"
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-sm font-semibold text-gray-800">{label}</span>
                  <span className="text-xs text-gray-500">{desc}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleFinish}
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {loading ? 'Učitavam...' : 'Idi na dashboard →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
