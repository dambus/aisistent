'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PLANS = ['free', 'starter', 'pro', 'business', 'agency']

const PLAN_COLORS: Record<string, { bg: string; text: string }> = {
  free:     { bg: '#F3F4F6', text: '#6B7280' },
  starter:  { bg: '#EFF6FF', text: '#2563EB' },
  pro:      { bg: '#F0FDF4', text: '#16A34A' },
  business: { bg: '#FEF3C7', text: '#D97706' },
  agency:   { bg: '#EEF2FF', text: '#4338CA' },
}

interface Props {
  userId: string
  currentPlan: string
}

export function PlanSelector({ userId, currentPlan }: Props) {
  const [plan, setPlan] = useState(currentPlan)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  async function handleChange(newPlan: string) {
    if (newPlan === plan) return
    setLoading(true)
    setSaved(false)
    try {
      const res = await fetch('/api/admin/set-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan: newPlan }),
      })
      if (res.ok) {
        setPlan(newPlan)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  const color = PLAN_COLORS[plan] ?? PLAN_COLORS.free

  return (
    <div className="flex items-center gap-2">
      <select
        value={plan}
        onChange={e => handleChange(e.target.value)}
        disabled={loading}
        className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold outline-none focus:border-gray-400 disabled:opacity-50 cursor-pointer"
        style={{ backgroundColor: color.bg, color: color.text }}
      >
        {PLANS.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      {loading && (
        <span className="text-xs text-gray-400">Čuvam...</span>
      )}
      {saved && !loading && (
        <span className="text-xs text-green-600 font-medium">✓ Sačuvano</span>
      )}
    </div>
  )
}
