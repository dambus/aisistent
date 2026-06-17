'use client'

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

  if (!hasPreview) {
    return (
      <div style={{ position: 'relative', width: '320px', height: '380px', flexShrink: 0 }}>
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
          src={docSrc}
          alt="Generisani dokument"
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: '8px',
            transform: 'rotate(-2deg)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)',
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '420px', height: '480px', flexShrink: 0 }}>
      {/* Wizard — background, 3D receded */}
      <img
        src={wizardSrc!}
        alt="Wizard za unos podataka"
        style={{
          position: 'absolute',
          top: '20px',
          left: '-30px',
          width: '300px',
          opacity: 0.9,
          borderRadius: '10px',
          transform: 'perspective(1000px) rotateY(12deg) rotateX(6deg) scale(0.78)',
          transformOrigin: 'left center',
          boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
          zIndex: 1,
        }}
      />

      {/* Connector arrow */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '32%',
          zIndex: 4,
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: '#1B6B4A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          transform: 'translateY(-50%)',
        }}
      >
        →
      </div>

      {/* Doc — foreground, dominant */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          right: '10px',
          bottom: '-20px',
          zIndex: 2,
          transform: 'perspective(1000px) rotateY(-4deg) rotateX(-2deg)',
          transformOrigin: 'right center',
        }}
      >
        <img
          src={docSrc}
          alt="Generisani dokument"
          style={{
            width: '320px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 6px 20px rgba(0,0,0,0.3)',
            display: 'block',
          }}
        />
        {/* Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            backgroundColor: '#1B6B4A',
            color: 'white',
            padding: '8px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          ✓ Generisan za 45 sekundi
        </div>
      </div>
    </div>
  )
}
