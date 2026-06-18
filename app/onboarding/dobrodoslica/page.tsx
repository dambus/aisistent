'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { createClient } from '@/lib/supabase/client'
import { INDUSTRY_CONFIG, type Industry } from '@/lib/industryConfig'

interface ProfileRow {
  plan: string
  industry: string | null
  onboarded: boolean
}

interface CompanyFormState {
  naziv: string
  pib: string
  adresa: string
  email: string
  telefon: string
}

const BRAND = '#1B6B4A'
const LIGHT_BRAND = '#d1fae5'
const industryEntries = Object.entries(INDUSTRY_CONFIG) as [Industry, (typeof INDUSTRY_CONFIG)[Industry]][]

const emptyCompanyForm: CompanyFormState = {
  naziv: '',
  pib: '',
  adresa: '',
  email: '',
  telefon: '',
}

const unlockByPlan: Record<string, string[]> = {
  starter: [
    '20 dokumenata mesečno',
    'PDF bez AIsistent oznake',
    'DOCX export',
    'Čuvanje dokumenata u arhivi',
    'Email slanje dokumenata',
    'Podešavanje profila firme',
  ],
  pro: [
    '20 dokumenata mesečno',
    'PDF bez AIsistent oznake',
    'DOCX export',
    'Čuvanje dokumenata u arhivi',
    'Email slanje dokumenata',
    'Podešavanje profila firme',
    'Neograničeno generisanje',
    'Logo firme u dokumentima',
    'Prioritetna podrška',
  ],
  business: [
    '20 dokumenata mesečno',
    'PDF bez AIsistent oznake',
    'DOCX export',
    'Čuvanje dokumenata u arhivi',
    'Email slanje dokumenata',
    'Podešavanje profila firme',
    'Neograničeno generisanje',
    'Logo firme u dokumentima',
    'Prioritetna podrška',
  ],
}

function planLabel(plan: string) {
  if (plan === 'starter') return 'Starter'
  if (plan === 'pro') return 'Pro'
  if (plan === 'business') return 'Business'
  if (plan === 'agency') return 'Agencija'
  return 'AIsistent'
}

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf9]">
      <style>{`
        @keyframes onboarding-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div
        aria-label="Učitavanje"
        style={{
          width: 42,
          height: 42,
          borderRadius: '9999px',
          border: '4px solid rgba(27,107,74,0.18)',
          borderTopColor: BRAND,
          animation: 'onboarding-spin 0.8s linear infinite',
        }}
      />
    </div>
  )
}

function ProgressBar({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
        <span>Korak {step}/3</span>
        <span>{Math.round((step / 3) * 100)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(step / 3) * 100}%`, backgroundColor: BRAND }}
        />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[1, 2, 3].map(item => (
          <div
            key={item}
            className="h-1.5 rounded-full transition-colors duration-300"
            style={{ backgroundColor: item <= step ? BRAND : '#d1d5db' }}
          />
        ))}
      </div>
    </div>
  )
}

function UnlockParticles() {
  const particles = useMemo(
    () => Array.from({ length: 12 }, (_, index) => index),
    []
  )

  return (
    <div className="relative mb-8 flex h-28 items-center justify-center overflow-hidden">
      <style>{`
        @keyframes unlock-burst {
          0% {
            transform: translate(0, 0) scale(0.2);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          100% {
            transform: translate(var(--x), var(--y)) scale(1);
            opacity: 0;
          }
        }
        @keyframes unlock-pop {
          0% { transform: scale(0.7); opacity: 0; }
          40% { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div
        className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg"
        style={{ backgroundColor: BRAND, animation: 'unlock-pop 0.5s ease-out both' }}
      >
        ✓
      </div>
      {particles.map(index => {
        const angle = (Math.PI * 2 * index) / particles.length
        const distance = 40 + (index % 3) * 14
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance
        const color = index % 2 === 0 ? BRAND : LIGHT_BRAND

        return (
          <span
            key={index}
            className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full"
            style={{
              backgroundColor: color,
              ['--x' as string]: `${x}px`,
              ['--y' as string]: `${y}px`,
              animation: `unlock-burst 1.5s ease-out ${index * 0.04}s 1 both`,
            }}
          />
        )
      })}
    </div>
  )
}

function IndustryPicker({
  value,
  onChange,
}: {
  value: Industry | null
  onChange: (value: Industry) => void
}) {
  return (
    <RadioGroup
      value={value ?? undefined}
      onValueChange={nextValue => onChange(nextValue as Industry)}
      className="grid gap-3 md:grid-cols-2"
    >
      {industryEntries.map(([key, config]) => (
        <label
          key={key}
          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
            value === key
              ? 'border-[var(--color-primary)] bg-[color:rgba(27,107,74,0.06)] shadow-sm'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <RadioGroupItem value={key} />
          <div className="min-w-0">
            <div className="font-semibold text-gray-900">{config.label}</div>
            <p className="mt-1 text-sm leading-6 text-gray-500">{config.description}</p>
          </div>
        </label>
      ))}
    </RadioGroup>
  )
}

export default function DobrodoslicaPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [companyForm, setCompanyForm] = useState<CompanyFormState>(emptyCompanyForm)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadProfile() {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData.user

      if (!user) {
        router.replace('/login')
        return
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('plan, industry, onboarded')
        .eq('id', user.id)
        .single()

      if (!active) return

      if (profileError || !data) {
        setError('Neuspešno učitavanje profila.')
        setLoading(false)
        return
      }

      const nextProfile = data as ProfileRow

      if (nextProfile.plan === 'agency') {
        router.replace('/onboarding/agencija')
        return
      }

      if (nextProfile.onboarded) {
        router.replace('/dashboard')
        return
      }

      setProfile(nextProfile)
      if (nextProfile.industry && nextProfile.industry in INDUSTRY_CONFIG) {
        setSelectedIndustry(nextProfile.industry as Industry)
      }
      setLoading(false)
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [router, supabase])

  const isUpgrade = profile ? profile.plan !== 'free' : false
  const unlockItems = unlockByPlan[profile?.plan ?? 'starter'] ?? unlockByPlan.pro

  async function completeOnboarding(includeCompany: boolean) {
    if (!selectedIndustry) return

    setSaving(true)
    setError('')

    try {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData.user

      if (!user) {
        router.replace('/login')
        return
      }

      if (includeCompany && companyForm.naziv.trim()) {
        const { error: companyError } = await supabase.from('companies').insert({
          user_id: user.id,
          naziv: companyForm.naziv.trim(),
          pib: companyForm.pib.trim() || null,
          adresa: companyForm.adresa.trim() || null,
          email: companyForm.email.trim() || null,
          telefon: companyForm.telefon.trim() || null,
          is_default: true,
        })

        if (companyError) {
          setError('Firma nije sačuvana. Proverite podatke i pokušajte ponovo.')
          setSaving(false)
          return
        }
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ industry: selectedIndustry, onboarded: true })
        .eq('id', user.id)

      if (updateError) {
        setError('Profil nije ažuriran. Pokušajte ponovo.')
        setSaving(false)
        return
      }

      router.replace('/dashboard')
      router.refresh()
    } catch {
      setError('Došlo je do greške. Pokušajte ponovo.')
      setSaving(false)
    }
  }

  if (loading) return <Spinner />
  if (!profile) return <Spinner />

  return (
    <div className="min-h-screen bg-[#f8faf9] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-sm"
            style={{ backgroundColor: BRAND }}
          >
            AI
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {isUpgrade ? 'Aktivacija naprednog plana' : 'Dobrodošli u AIsistent!'}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            {isUpgrade
              ? 'Završite kratko podešavanje da bismo prilagodili alate vašem radu.'
              : 'Izaberite svoju delatnost da bismo prilagodili iskustvo.'}
          </p>
        </div>

        <Card className="mx-auto max-w-4xl border border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100">
            {isUpgrade ? (
              <>
                <ProgressBar step={step} />
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {step === 1 && `Dobrodošli u ${planLabel(profile.plan)} plan!`}
                  {step === 2 && 'Izaberite svoju delatnost'}
                  {step === 3 && 'Podesite svoju firmu'}
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-gray-600">
                  {step === 1 && 'Evo šta se otključalo:'}
                  {step === 2 && 'Na osnovu delatnosti prilagođavamo preporučene alate i redosled rada.'}
                  {step === 3 && 'Ovi podaci će se automatski popuniti u dokumentima.'}
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Dobrodošli u AIsistent!
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-gray-600">
                  Izaberite svoju delatnost da bismo prilagodili iskustvo
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {!isUpgrade && (
              <>
                <IndustryPicker value={selectedIndustry} onChange={setSelectedIndustry} />

                <div className="rounded-xl border px-4 py-4 text-sm leading-6" style={{ borderColor: '#b7e4ce', backgroundColor: '#ecfdf5' }}>
                  <p className="text-gray-800">
                    Sa besplatnim nalogom možeš da generišeš 3 dokumenta mesečno i preuzmeš PDF.
                    Za čuvanje dokumenata, DOCX export i više — pogledaj naše planove.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-[#b7e4ce] bg-white text-[#166534] hover:bg-[#f0fdf4]"
                    onClick={() => window.open('/cenovnik', '_blank', 'noopener,noreferrer')}
                  >
                    Pogledaj planove
                  </Button>
                </div>

                <div className="flex justify-end">
                  <Button
                    disabled={!selectedIndustry || saving}
                    className="h-10 px-6 text-sm font-semibold"
                    onClick={() => completeOnboarding(false)}
                  >
                    {saving ? 'Čuvam...' : 'Počni'}
                  </Button>
                </div>
              </>
            )}

            {isUpgrade && step === 1 && (
              <>
                <UnlockParticles />
                <div className="grid gap-3">
                  {unlockItems.map((item, index) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm"
                      style={{
                        animation: `fade-up 0.45s ease-out ${index * 0.1}s both`,
                      }}
                    >
                      <span className="mt-0.5 text-base font-bold" style={{ color: BRAND }}>
                        ✓
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button className="h-10 px-6 text-sm font-semibold" onClick={() => setStep(2)}>
                    Nastavi
                  </Button>
                </div>
              </>
            )}

            {isUpgrade && step === 2 && (
              <>
                <IndustryPicker value={selectedIndustry} onChange={setSelectedIndustry} />

                <div className="flex items-center justify-between gap-3">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Nazad
                  </Button>
                  <Button
                    disabled={!selectedIndustry}
                    className="h-10 px-6 text-sm font-semibold"
                    onClick={() => setStep(3)}
                  >
                    Nastavi
                  </Button>
                </div>
              </>
            )}

            {isUpgrade && step === 3 && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Naziv firme <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={companyForm.naziv}
                      onChange={e => setCompanyForm(prev => ({ ...prev, naziv: e.target.value }))}
                      placeholder="npr. Sigma Solutions doo"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:rgba(27,107,74,0.15)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">PIB</label>
                    <input
                      type="text"
                      value={companyForm.pib}
                      onChange={e => setCompanyForm(prev => ({ ...prev, pib: e.target.value }))}
                      placeholder="npr. 123456789"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:rgba(27,107,74,0.15)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Adresa</label>
                    <input
                      type="text"
                      value={companyForm.adresa}
                      onChange={e => setCompanyForm(prev => ({ ...prev, adresa: e.target.value }))}
                      placeholder="npr. Bulevar Mihajla Pupina 10"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:rgba(27,107,74,0.15)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Email firme</label>
                    <input
                      type="email"
                      value={companyForm.email}
                      onChange={e => setCompanyForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="kontakt@firma.rs"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:rgba(27,107,74,0.15)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Telefon</label>
                    <input
                      type="text"
                      value={companyForm.telefon}
                      onChange={e => setCompanyForm(prev => ({ ...prev, telefon: e.target.value }))}
                      placeholder="npr. 021 123 456"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:rgba(27,107,74,0.15)]"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Nazad
                  </Button>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-900"
                      disabled={!selectedIndustry || saving}
                      onClick={() => completeOnboarding(false)}
                    >
                      Preskoči
                    </Button>
                    <Button
                      disabled={!selectedIndustry || saving || !companyForm.naziv.trim()}
                      className="h-10 px-6 text-sm font-semibold"
                      onClick={() => completeOnboarding(true)}
                    >
                      {saving ? 'Čuvam...' : 'Završi podešavanje'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
