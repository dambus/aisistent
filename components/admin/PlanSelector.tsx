'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PLANS = ['free', 'starter', 'pro', 'business', 'agency']

const PLAN_COLORS_DARK: Record<string, { border: string; text: string; bg: string }> = {
  free:     { border: '#3f3f46', text: '#a1a1aa', bg: '#27272a' },
  starter:  { border: '#1d4ed8', text: '#60a5fa', bg: '#1e3a5f' },
  pro:      { border: '#15803d', text: '#4ade80', bg: '#14532d' },
  business: { border: '#b45309', text: '#fbbf24', bg: '#451a03' },
  agency:   { border: '#6d28d9', text: '#a78bfa', bg: '#2e1065' },
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
      } else {
        setPlan(plan)
        console.error('set-plan failed:', await res.text())
      }
    } finally {
      setLoading(false)
    }
  }

  const color = PLAN_COLORS_DARK[plan] ?? PLAN_COLORS_DARK.free

  return (
    <div className="flex items-center gap-2">
      <select
        value={plan}
        onChange={e => handleChange(e.target.value)}
        disabled={loading}
        className="rounded-lg px-2 py-1 text-xs font-semibold outline-none disabled:opacity-50 cursor-pointer border"
        style={{ backgroundColor: color.bg, color: color.text, borderColor: color.border }}
      >
        {PLANS.map(p => (
          <option key={p} value={p} style={{ backgroundColor: '#18181b', color: '#e4e4e7' }}>{p}</option>
        ))}
      </select>
      {loading && (
        <span className="text-xs text-zinc-500">Čuvam...</span>
      )}
      {saved && !loading && (
        <span className="text-xs text-green-500 font-medium">✓</span>
      )}
    </div>
  )
}
