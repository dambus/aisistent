'use client'

import Link from 'next/link'

const PRIMARY = '#1B6B4A'

const DOC_LIMITS: Record<string, number | null> = {
  free:    3,
  starter: 20,
  pro:     null,
  agency:  null,
}

const IMPROVE_LIMITS: Record<string, number | null> = {
  free:    0,
  starter: 15,
  pro:     null,
  agency:  null,
}

const PLAN_LABELS: Record<string, string> = {
  free:    'Besplatni',
  starter: 'Starter',
  pro:     'Pro',
  agency:  'Agencija',
}

interface LimitsCardProps {
  plan: string
  documentsThisMonth: number
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

function barColor(pct: number) {
  if (pct >= 100) return '#EF4444'
  if (pct >= 80) return '#F97316'
  return PRIMARY
}

export function LimitsCard({ plan, documentsThisMonth }: LimitsCardProps) {
  const docLimit = DOC_LIMITS[plan] ?? null
  const improveLimit = IMPROVE_LIMITS[plan] ?? null
  const planLabel = PLAN_LABELS[plan] ?? plan

  const docPct = docLimit !== null ? Math.min((documentsThisMonth / docLimit) * 100, 100) : 0
  const docColor = docLimit !== null ? barColor(docPct) : PRIMARY

  const isUpgrade = plan === 'free' || plan === 'starter'

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Vaši limiti</h2>
        <Link
          href="/profil"
          className="text-xs font-medium transition-colors hover:underline"
          style={{ color: PRIMARY }}
        >
          {planLabel} plan →
        </Link>
      </div>

      <div className="space-y-4">
        {/* Dokumenti ovog meseca */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm text-gray-600">Dokumenti ovog meseca</span>
            <span className="text-sm font-semibold tabular-nums" style={{ color: docColor }}>
              {docLimit !== null ? `${documentsThisMonth} / ${docLimit}` : `${documentsThisMonth} ∞`}
            </span>
          </div>
          {docLimit !== null ? (
            <ProgressBar value={documentsThisMonth} max={docLimit} color={docColor} />
          ) : (
            <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: `${PRIMARY}20` }}>
              <div className="h-full w-full rounded-full opacity-30" style={{ backgroundColor: PRIMARY }} />
            </div>
          )}
          {docLimit !== null && docPct >= 80 && (
            <p className="mt-1 text-xs" style={{ color: docColor }}>
              {docPct >= 100 ? 'Mesečni limit dostignut.' : `Ostalo ${docLimit - documentsThisMonth} ${docLimit - documentsThisMonth === 1 ? 'dokument' : 'dokumenata'}.`}
            </p>
          )}
        </div>

        {/* AI izmene */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm text-gray-600">AI izmene dokumenta</span>
            <span className="text-sm font-semibold tabular-nums text-gray-700">
              {improveLimit === 0
                ? 'Nije dostupno'
                : improveLimit !== null
                ? `do ${improveLimit}/dan`
                : '∞ /dan'}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: improveLimit === 0 ? '0%' : '100%',
                backgroundColor: improveLimit === 0 ? '#E5E7EB' : `${PRIMARY}40`,
              }}
            />
          </div>
          {improveLimit === 0 && (
            <p className="mt-1 text-xs text-gray-400">Dostupno od Starter plana.</p>
          )}
        </div>
      </div>

      {isUpgrade && docLimit !== null && docPct >= 80 && (
        <div className="mt-4 rounded-xl bg-gray-50 px-3 py-2.5 text-center">
          <p className="text-xs text-gray-500 mb-1.5">
            {plan === 'free' ? 'Pro plan nudi neograničen broj dokumenata.' : 'Pro plan nudi neograničen broj dokumenata i AI izmena.'}
          </p>
          <Link
            href="/#cenovnik"
            className="text-xs font-semibold underline"
            style={{ color: PRIMARY }}
          >
            Pogledajte planove
          </Link>
        </div>
      )}
    </div>
  )
}
