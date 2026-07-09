'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useChangelog } from '@/hooks/useChangelog'

const PRIMARY = '#1B6B4A'

export function ChangelogBell({ align = 'left' }: { align?: 'left' | 'right' }) {
  const { entries, unseenCount, markAllSeen, ready } = useChangelog()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  function toggle() {
    const next = !open
    setOpen(next)
    if (next && unseenCount > 0) markAllSeen()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        aria-label="Šta je novo"
        className="relative flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {ready && unseenCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
            style={{ backgroundColor: PRIMARY }}
          >
            {unseenCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute top-10 z-50 w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#1a2332] shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 ${align === 'right' ? 'right-0' : 'left-0'}`}
          style={{ borderTop: `2px solid ${PRIMARY}` }}
        >
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm font-semibold text-white">Šta je novo</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {entries.map(entry => (
              <Link
                key={entry.id}
                href={entry.href ?? '#'}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 border-b border-white/5 last:border-b-0 transition-colors hover:bg-white/5"
              >
                <p className="text-xs font-semibold text-white mb-0.5">{entry.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{entry.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
