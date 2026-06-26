'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toVocative } from '@/lib/utils/vocative'

const PRIMARY = '#1B6B4A'

const planLabels: Record<string, { label: string; cls: string }> = {
  free:    { label: 'Besplatno', cls: 'bg-gray-100 text-gray-600' },
  starter: { label: 'Starter',   cls: 'bg-blue-100 text-blue-700' },
  pro:     { label: 'Pro',       cls: 'bg-purple-100 text-purple-700' },
  agency:  { label: 'Agencija',  cls: 'bg-indigo-100 text-indigo-700' },
}

interface GreetingHeaderProps {
  displayName?: string
  plan: string
  documentsThisMonth: number
}

export function GreetingHeader({ displayName, plan, documentsThisMonth }: GreetingHeaderProps) {
  const [greeting, setGreeting] = useState('Dobro jutro')

  useEffect(() => {
    const h = new Date().getHours()
    if (h >= 6 && h < 12) setGreeting('Dobro jutro')
    else if (h >= 12 && h < 18) setGreeting('Dobar dan')
    else setGreeting('Dobro veče')
  }, [])

  const planMeta = planLabels[plan] ?? planLabels.free
  const isFree = plan === 'free'
  const limitReached = isFree && documentsThisMonth >= 1

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">
        {greeting}{displayName ? `, ${toVocative(displayName)}` : ''}!
      </h1>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${planMeta.cls}`}>
          {planMeta.label}
        </span>
        <span>·</span>
        {limitReached ? (
          <span>
            Mesečni limit dostignut —{' '}
            <Link href="/#cenovnik" className="font-semibold underline underline-offset-2" style={{ color: PRIMARY }}>
              Nadogradite plan
            </Link>
          </span>
        ) : (
          <span>{documentsThisMonth} {documentsThisMonth === 1 ? 'dokument' : 'dokumenata'} ovog meseca</span>
        )}
      </div>
    </div>
  )
}
