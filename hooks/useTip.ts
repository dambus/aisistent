'use client'

import { useState, useEffect, useCallback } from 'react'

const SEEN_KEY = 'aisistent_tips_seen'
const DISABLED_KEY = 'aisistent_tips_disabled'

export function useTip(id: string, delay = 1500) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(DISABLED_KEY) === 'true') return
      const seen: string[] = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]')
      if (seen.includes(id)) return
    } catch { return }

    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [id, delay])

  const dismiss = useCallback(() => {
    setVisible(false)
    try {
      const seen: string[] = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]')
      localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, id]))
    } catch {}
  }, [id])

  const disableAll = useCallback(() => {
    setVisible(false)
    try { localStorage.setItem(DISABLED_KEY, 'true') } catch {}
  }, [])

  return { visible, dismiss, disableAll }
}

export function useFirstUnseenTip(ids: string[], delay = 1500) {
  const [activeTipId, setActiveTipId] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (localStorage.getItem(DISABLED_KEY) === 'true') return
      const seen: string[] = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]')
      const first = ids.find(id => !seen.includes(id)) ?? null
      setActiveTipId(first)
    } catch {}
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = useCallback((id: string) => {
    try {
      const seen: string[] = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]')
      localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, id]))
    } catch {}
    setActiveTipId(null)
  }, [])

  const disableAll = useCallback(() => {
    setActiveTipId(null)
    try { localStorage.setItem(DISABLED_KEY, 'true') } catch {}
  }, [])

  return { activeTipId, dismiss, disableAll, delay }
}

export function useTipsSettings() {
  const [disabled, setDisabled] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setDisabled(localStorage.getItem(DISABLED_KEY) === 'true')
    setReady(true)
  }, [])

  const enable = useCallback(() => {
    try {
      localStorage.removeItem(DISABLED_KEY)
      localStorage.removeItem(SEEN_KEY)
    } catch {}
    setDisabled(false)
  }, [])

  const disable = useCallback(() => {
    try { localStorage.setItem(DISABLED_KEY, 'true') } catch {}
    setDisabled(true)
  }, [])

  return { disabled, ready, enable, disable }
}
