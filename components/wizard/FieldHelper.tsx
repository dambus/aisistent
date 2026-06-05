'use client'

import { useState, useRef, useEffect } from 'react'

// ── TooltipIcon ──────────────────────────────────────────────────────────────
// Renders ⓘ icon next to a label. On hover (desktop) or click (all) opens
// a popover with the tooltip text. Closes on outside click or Escape.

interface TooltipIconProps {
  tooltip: string
}

export function TooltipIcon({ tooltip }: TooltipIconProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [open])

  const lines = tooltip.split('\n')

  return (
    <span ref={containerRef} className="relative ml-1 inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-[10px] font-bold leading-none text-gray-400 ring-1 ring-gray-300 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
        aria-label="Više informacija"
        tabIndex={0}
      >
        i
      </button>

      {open && (
        <div
          className="absolute left-0 top-6 z-50 w-[280px] max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
            aria-label="Zatvori"
          >
            ✕
          </button>
          <div className="pr-5 text-[13px] leading-relaxed text-gray-700">
            {lines.map((line, i) => (
              <p key={i} className={line === '' ? 'h-2' : ''}>
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </span>
  )
}

// ── HelperText ───────────────────────────────────────────────────────────────
// Renders a small helper/example text below an input field.

interface HelperTextProps {
  text: string
}

export function HelperText({ text }: HelperTextProps) {
  return (
    <p className="mt-1 text-[12px] italic text-gray-500">{text}</p>
  )
}
