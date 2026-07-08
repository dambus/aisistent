'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTip, useFirstUnseenTip } from '@/hooks/useTip'

interface TipCardProps {
  tipId: string
  title: string
  content: string
  delay?: number
  href?: string
  ctaLabel?: string
}

function TipCardBase({
  title,
  content,
  href,
  ctaLabel,
  onDismiss,
  onDisableAll,
}: {
  title: string
  content: string
  href?: string
  ctaLabel?: string
  onDismiss: () => void
  onDisableAll: () => void
}) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-72 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-3 duration-300"
      style={{ borderLeft: '3px solid #1B6B4A', boxShadow: '0 12px 32px -8px rgba(27,107,74,0.28), 0 4px 12px -2px rgba(0,0,0,0.08)' }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.052A3 3 0 0112 17H9.5l-.348-.048A3 3 0 016.9 14.9z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 mb-0.5">{title}</p>
          <p className="text-xs text-gray-500 leading-relaxed">{content}</p>
          {href && (
            <Link
              href={href}
              onClick={onDismiss}
              className="mt-1.5 inline-block text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              {ctaLabel ?? 'Pogledajte →'}
            </Link>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
          aria-label="Zatvori"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <button
        onClick={onDisableAll}
        className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors w-full text-right"
      >
        Isključi savete
      </button>
    </div>
  )
}

export function TipCard({ tipId, title, content, delay, href, ctaLabel }: TipCardProps) {
  const { visible, dismiss, disableAll } = useTip(tipId, delay)
  if (!visible) return null
  return (
    <TipCardBase
      title={title}
      content={content}
      href={href}
      ctaLabel={ctaLabel}
      onDismiss={dismiss}
      onDisableAll={disableAll}
    />
  )
}

export interface TipDefinition {
  id: string
  title: string
  content: string
  maxDocs?: number
  minDocs?: number
  href?: string
  ctaLabel?: string
}

interface TipSequenceProps {
  tips: TipDefinition[]
  delay?: number
  docCount?: number
}

export function TipSequence({ tips, delay, docCount }: TipSequenceProps) {
  const { activeTipId, dismiss, disableAll } = useFirstUnseenTip(
    tips.map(t => ({ id: t.id, maxDocs: t.maxDocs })),
    delay,
    docCount,
  )
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!activeTipId) return
    const timer = setTimeout(() => setVisible(true), delay ?? 1500)
    return () => clearTimeout(timer)
  }, [activeTipId, delay])

  if (!activeTipId || !visible) return null
  const tip = tips.find(t => t.id === activeTipId)!

  return (
    <TipCardBase
      title={tip.title}
      content={tip.content}
      href={tip.href}
      ctaLabel={tip.ctaLabel}
      onDismiss={() => { setVisible(false); dismiss(activeTipId) }}
      onDisableAll={disableAll}
    />
  )
}
