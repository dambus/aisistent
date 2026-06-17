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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
            width: 'fit-content',
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
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
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
          key={currentSrc}
          className="hero-preview-img"
          src={currentSrc}
          alt="Primer generisanog dokumenta"
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '340px',
            borderRadius: '8px',
            transform: 'rotate(-2deg)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)',
          }}
        />
        {(active === 'doc' || !wizardSrc) && (
          <div
            style={{
              position: 'absolute',
              bottom: '-8px',
              right: '0px',
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
