'use client'

import { useEffect, useState } from 'react'
import { useTip, useFirstUnseenTip } from '@/hooks/useTip'

interface TipCardProps {
  tipId: string
  title: string
  content: string
  delay?: number
}

function TipCardBase({
  title,
  content,
  onDismiss,
  onDisableAll,
}: {
  title: string
  content: string
  onDismiss: () => void
  onDisableAll: () => void
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.052A3 3 0 0112 17H9.5l-.348-.048A3 3 0 016.9 14.9z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 mb-0.5">{title}</p>
          <p className="text-xs text-gray-500 leading-relaxed">{content}</p>
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

export function TipCard({ tipId, title, content, delay }: TipCardProps) {
  const { visible, dismiss, disableAll } = useTip(tipId, delay)
  if (!visible) return null
  return (
    <TipCardBase
      title={title}
      content={content}
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
      onDismiss={() => { setVisible(false); dismiss(activeTipId) }}
      onDisableAll={disableAll}
    />
  )
}
