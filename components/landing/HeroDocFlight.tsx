'use client'

import { useEffect, useRef, useState } from 'react'
import { useAnimate, useReducedMotion } from 'motion/react'

interface HeroDocFlightProps {
  label?: string
}

const PRIMARY = '#1B6B4A'
const DARK = '#052e16'

function DocFace({ filled }: { filled: boolean }) {
  return (
    <div
      style={{
        width: 160,
        height: 208,
        borderRadius: 14,
        background: 'white',
        padding: '16px',
        boxShadow: '0 22px 44px rgba(0,0,0,0.4)',
      }}
    >
      {filled && (
        <>
          <div style={{ display: 'flex', gap: 7, marginBottom: 13 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, border: `1.5px solid ${DARK}`, flexShrink: 0 }} />
            <div style={{ flex: 1, height: 24, borderRadius: 6, background: PRIMARY }} />
          </div>
          {[100, 82, 92, 70, 58].map((w, i) => (
            <div
              key={i}
              style={{ height: 5, width: `${w}%`, borderRadius: 2, background: '#e5e7eb', marginBottom: 8 }}
            />
          ))}
        </>
      )}
    </div>
  )
}

export function HeroDocFlight({ label }: HeroDocFlightProps) {
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const [filled, setFilled] = useState(false)
  const [badgeVisible, setBadgeVisible] = useState(false)
  const reduceMotion = useReducedMotion()
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    if (reduceMotion) {
      setFilled(true)
      setBadgeVisible(true)
      return
    }

    let cancelled = false

    async function sequence() {
      // uskace sa desne strane, bounce sletanje
      await animate(
        scope.current,
        { x: [280, -14, 0], y: [30, 4, 0], opacity: [0, 1, 1] },
        { duration: 0.7, ease: ['easeOut', 'easeOut'] }
      )
      if (cancelled) return

      // poskoci
      await animate(scope.current, { y: [0, -22, 0] }, { duration: 0.38, ease: ['easeOut', 'easeIn'] })
      if (cancelled) return

      // poskoci malo vise
      await animate(scope.current, { y: [0, -36, 0] }, { duration: 0.44, ease: ['easeOut', 'easeIn'] })
      if (cancelled) return

      // rotira oko Y ose nekoliko puta — sadrzaj se popunjava blizu kraja rotacije
      // (kad je "na ivici", nevidljivo, pa se ne vidi trenutna zamena)
      const spinDuration = 0.9
      const fillTimer = setTimeout(() => {
        if (!cancelled) setFilled(true)
      }, spinDuration * 850)
      await animate(scope.current, { rotateY: 1080 }, { duration: spinDuration, ease: 'easeInOut' })
      clearTimeout(fillTimer)
      if (cancelled) return

      // slece na svoje mesto
      await animate(scope.current, { y: [0, 8, -3, 0] }, { duration: 0.4, ease: 'easeOut' })
      if (!cancelled) setBadgeVisible(true)
    }

    sequence()
    return () => {
      cancelled = true
    }
  }, [animate, scope, reduceMotion])

  return (
    <div style={{ position: 'relative', width: '360px', height: '420px', flexShrink: 0 }}>
      <div
        style={{
          position: 'absolute',
          top: '90px',
          left: '110px',
          perspective: '900px',
        }}
      >
        <div ref={scope} style={{ opacity: reduceMotion ? 1 : 0 }}>
          <DocFace filled={filled} />
        </div>
      </div>

      {label && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '4px',
            backgroundColor: PRIMARY,
            color: 'white',
            padding: '8px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            opacity: badgeVisible || reduceMotion ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
        >
          ✓ {label} za nekoliko sekundi
        </div>
      )}
    </div>
  )
}
