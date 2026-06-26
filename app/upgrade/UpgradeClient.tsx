'use client'

import { useState } from 'react'
import Link from 'next/link'
import WaitlistModal from '@/components/landing/WaitlistModal'

const PRIMARY = '#1B6B4A'

interface Plan {
  id: string
  name: string
  price: string
  sub?: string
  badge?: string
  badgeColor?: string
  features: [boolean, string][]
  cta: string
  ctaHref?: string
  waitlistPlan?: 'starter' | 'pro'
  featured?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Besplatno',
    price: 'Besplatno',
    features: [
      [true,  '3 dokumenta mesečno'],
      [true,  'PDF sa watermarkom'],
      [false, 'Email slanje'],
      [false, 'Word (DOCX) format'],
      [false, 'Brendiranje sa logom'],
    ],
    cta: 'Trenutni plan',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '1.080 RSD',
    sub: '≈ 9 EUR / mes.',
    features: [
      [true,  '20 dokumenata mesečno'],
      [true,  'PDF bez watermark-a'],
      [true,  'Email slanje dokumenata'],
      [false, 'Word (DOCX) format'],
      [false, 'Brendiranje sa logom'],
    ],
    cta: 'Izaberite Starter',
    waitlistPlan: 'starter',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '3.000 RSD',
    sub: '≈ 25 EUR / mes.',
    badge: 'Najpopularnije',
    badgeColor: PRIMARY,
    featured: true,
    features: [
      [true, 'Neograničen broj dokumenata'],
      [true, 'PDF bez watermark-a'],
      [true, 'Email slanje dokumenata'],
      [true, 'Word (DOCX) format'],
      [true, 'Brendiranje sa logom firme'],
    ],
    cta: 'Izaberite Pro',
    waitlistPlan: 'pro',
  },
  {
    id: 'agency',
    name: 'Agencija',
    price: '9.990 RSD',
    sub: '≈ 83 EUR / mes.',
    badge: 'Za računovođe',
    badgeColor: '#4338CA',
    features: [
      [true, 'Neograničen broj klijenata'],
      [true, 'Neograničen broj dokumenata'],
      [true, 'PDF + DOCX export'],
      [true, 'Brendiranje sa logom'],
      [true, 'Arhiva i pregled po klijentu'],
      [true, 'Email slanje klijentu'],
    ],
    cta: 'Kontaktirajte nas',
    ctaHref: 'mailto:hello@aisistent.rs?subject=Agency plan',
  },
]

export default function UpgradeClient({ currentPlan }: { currentPlan: string }) {
  const [modal, setModal] = useState<'starter' | 'pro' | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center">
            <img
              src="/logo/AIsistent-Logo_6003x180.png"
              alt="AIsistent"
              style={{ objectFit: 'contain', maxWidth: '140px', height: '28px' }}
            />
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 transition-colors hover:text-gray-800"
          >
            ← Nazad na dashboard
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-5 py-12 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Odaberite plan</h1>
          <p className="mt-3 text-gray-500">
            Plaćanje se aktivira uskoro — prijavite se za obaveštenje i dobijte prvi mesec uz 20% popusta.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map(plan => {
            const isCurrent = plan.id === currentPlan
            const isDowngrade = plan.id === 'free' && currentPlan !== 'free'

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-white p-6 transition-shadow ${
                  plan.featured
                    ? 'border-2 shadow-lg'
                    : isCurrent
                    ? 'border-gray-300'
                    : 'border-gray-200 hover:shadow-md'
                }`}
                style={plan.featured ? { borderColor: PRIMARY } : {}}
              >
                {/* Badge */}
                {plan.badge && (
                  <span
                    className="absolute -top-3 left-5 rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{ backgroundColor: plan.badgeColor }}
                  >
                    {plan.badge}
                  </span>
                )}

                {/* Current plan indicator */}
                {isCurrent && (
                  <span className="absolute -top-3 right-5 rounded-full bg-gray-700 px-3 py-1 text-xs font-semibold text-white">
                    Trenutni plan
                  </span>
                )}

                <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
                <p className="mt-3 text-2xl font-bold text-gray-900">{plan.price}</p>
                {plan.sub && (
                  <p className="mt-0.5 text-xs text-gray-400">{plan.sub}</p>
                )}

                <ul className="mt-6 flex-1 space-y-2.5 pb-6">
                  {plan.features.map(([included, text]) => (
                    <li key={text} className="flex items-start gap-2 text-sm">
                      <span
                        className="mt-0.5 font-bold"
                        style={{ color: included ? PRIMARY : '#D1D5DB' }}
                      >
                        {included ? '✓' : '✕'}
                      </span>
                      <span className={included ? 'text-gray-700' : 'text-gray-400'}>
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent || isDowngrade ? (
                  <button
                    disabled
                    className="mt-auto w-full rounded-lg bg-gray-100 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed"
                  >
                    {isCurrent ? 'Trenutni plan' : 'Downgrade'}
                  </button>
                ) : plan.waitlistPlan ? (
                  <button
                    onClick={() => setModal(plan.waitlistPlan!)}
                    className="mt-auto w-full rounded-lg py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: plan.featured ? PRIMARY : '#374151' }}
                  >
                    {plan.cta}
                  </button>
                ) : (
                  <a
                    href={plan.ctaHref}
                    className="mt-auto block w-full rounded-lg py-2.5 text-center text-sm font-bold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#4338CA' }}
                  >
                    {plan.cta}
                  </a>
                )}
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Sva plaćanja se obrađuju kroz siguran payment gateway. Možete otkazati u svakom trenutku.
          Cene su prikazane bez PDV-a.
        </p>
      </main>

      {modal && <WaitlistModal plan={modal} onClose={() => setModal(null)} />}
    </div>
  )
}
