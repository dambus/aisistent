'use client'

import { useState } from 'react'

const SLUGS_WITH_PREVIEWS = [
  'nda', 'opsti-uslovi', 'ugovor-o-delu',
  'ugovor-o-radu', 'ugovor-o-saradnji', 'ugovor-o-zakupu',
] as const

interface HeroPreviewProps {
  previewSlug?: string
}

export function HeroPreview({ previewSlug }: HeroPreviewProps) {
  const hasPreview = !!previewSlug && (SLUGS_WITH_PREVIEWS as readonly string[]).includes(previewSlug)

  const docSrc = hasPreview
    ? `/images/previews/${previewSlug}-doc.png`
    : '/images/document-preview.png'

  const wizardSrc = hasPreview
    ? `/images/previews/${previewSlug}-wizard.png`
    : null

  const [active, setActive] = useState<'wizard' | 'doc'>('wizard')
  const currentSrc = active === 'wizard' && wizardSrc ? wizardSrc : docSrc

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '320px',
        flexShrink: 0,
      }}
    >
      <style>{`
        @keyframes hero-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .hero-preview-img { animation: hero-fade-in 0.2s ease; }
      `}</style>

      {wizardSrc && (
        <div
          style={{
            display: 'flex',
            gap: '4px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '4px',
            marginBottom: '12px',
            width: '320px',
            boxSizing: 'border-box',
          }}
        >
          <button
            onClick={() => setActive('wizard')}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: active === 'wizard' ? 'white' : 'transparent',
              color: active === 'wizard' ? '#052e16' : '#6ee7b7',
              transition: 'all 0.15s',
            }}
          >
            ① Unesite podatke
          </button>
          <button
            onClick={() => setActive('doc')}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: active === 'doc' ? 'white' : 'transparent',
              color: active === 'doc' ? '#052e16' : '#6ee7b7',
              transition: 'all 0.15s',
            }}
          >
            ② Preuzmite dokument
          </button>
        </div>
      )}

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '320px',
          height: '380px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '85%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: '8px',
            filter: 'blur(12px)',
            zIndex: 0,
          }}
        />
        <img
          key={active}
          className="hero-preview-img"
          src={currentSrc}
          alt={active === 'wizard' ? 'Wizard za unos podataka' : 'Generisani dokument'}
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            borderRadius: '8px',
            transform: 'rotate(-2deg)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)',
          }}
        />
        {active === 'doc' && (
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '-8px',
              zIndex: 2,
              backgroundColor: '#1B6B4A',
              color: 'white',
              padding: '8px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transform: 'rotate(2deg)',
            }}
          >
            ✓ Generisan za 45 sekundi
          </div>
        )}
      </div>
    </div>
  )
}
