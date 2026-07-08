'use client'

import { useState, useEffect, useCallback } from 'react'
import { CHANGELOG } from '@/lib/changelog'

const SEEN_KEY = 'aisistent_changelog_seen'

export function useChangelog() {
  const [seenIds, setSeenIds] = useState<string[] | null>(null)

  useEffect(() => {
    try {
      setSeenIds(JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]'))
    } catch {
      setSeenIds([])
    }
  }, [])

  const unseenCount = seenIds === null
    ? 0
    : CHANGELOG.filter(entry => !seenIds.includes(entry.id)).length

  const markAllSeen = useCallback(() => {
    const allIds = CHANGELOG.map(entry => entry.id)
    setSeenIds(allIds)
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(allIds)) } catch {}
  }, [])

  return { entries: CHANGELOG, unseenCount, markAllSeen, ready: seenIds !== null }
}
