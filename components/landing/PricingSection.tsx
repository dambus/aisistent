'use client'

import { useState } from 'react'
import WaitlistModal from './WaitlistModal'

const PRIMARY = '#1B6B4A'

export interface PricingPlan {
  name: string
  price: string
  euroEquivalent?: string
  badge?: string
  badgeColor?: string
  cta: string
  href?: string
  featured?: boolean
  waitlistPlan?: 'starter' | 'pro' | 'business'
}

export default function PricingSection({ plans }: { plans: PricingPlan[] }) {
  const [modal, setModal] = useState<'starter' | 'pro' | 'business' | null>(null)

  return (
    <>
      <div className="mx-auto mt-12 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
        {plans.map(plan => (
          <article
            key={plan.name}
            className={`flex flex-col relative rounded-2xl border p-6 transition-all duration-200 ${
              plan.featured
                ? 'border-2 bg-white text-gray-900 shadow-xl'
                : 'border-white/10 bg-white/5 hover:bg-white/8'
            }`}
            style={plan.featured ? { borderColor: PRIMARY } : {}}
          >
            {plan.badge && (
              <span
                className="absolute -top-3 left-5 rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{ backgroundColor: plan.badgeColor ?? '#F59E0B' }}
              >
                {plan.badge}
              </span>
            )}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold">{plan.name}</h3>
              {plan.waitlistPlan && (
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
                >
                  Uskoro
                </span>
              )}
            </div>
            <p className="mt-3 min-h-[4rem] text-2xl font-bold leading-tight">
              {plan.price}
            </p>
            {plan.euroEquivalent && (
              <p className="mt-1 text-xs font-medium opacity-60">{plan.euroEquivalent}</p>
            )}
            <ul className="mt-6 grid flex-1 gap-2.5 pb-6 text-sm">
              {(plan as PricingPlan & { features?: [string, string][] }).features?.map(([mark, text]: [string, string]) => (
                <li key={text} className="flex gap-2.5">
                  <span
                    className={mark === '✓' ? 'font-bold' : 'opacity-30'}
                    style={mark === '✓' ? { color: plan.featured ? PRIMARY : '#6ee7b7' } : {}}
                  >
                    {mark}
                  </span>
                  <span className={mark === '✓' ? '' : 'opacity-40'}>{text}</span>
                </li>
              ))}
            </ul>
            {plan.waitlistPlan ? (
              <button
                onClick={() => setModal(plan.waitlistPlan!)}
                className="mt-auto flex min-h-12 items-center justify-center rounded-lg px-5 py-3 text-center text-sm font-bold transition-all duration-200 hover:scale-[1.02]"
                style={
                  plan.featured
                    ? { backgroundColor: PRIMARY, color: '#fff' }
                    : { backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff' }
                }
              >
                {plan.cta}
              </button>
            ) : (
              <a
                href={plan.href}
                className="mt-auto flex min-h-12 items-center justify-center rounded-lg px-5 py-3 text-center text-sm font-bold transition-all duration-200 hover:scale-[1.02]"
                style={
                  plan.featured
                    ? { backgroundColor: PRIMARY, color: '#fff' }
                    : { backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff' }
                }
              >
                {plan.cta}
              </a>
            )}
          </article>
        ))}
      </div>

      {modal && (
        <WaitlistModal plan={modal} onClose={() => setModal(null)} />
      )}
    </>
  )
}
