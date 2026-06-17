'use client'

const KEYFRAMES = `
@keyframes typing {
  from { width: 0 }
  to { width: 180px }
}
@keyframes blink {
  0%, 100% { opacity: 1 }
  50% { opacity: 0 }
}
@keyframes heroPulse {
  0%, 100% { transform: scale(1); opacity: 0.5 }
  50% { transform: scale(1.3); opacity: 1 }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px) }
  to { opacity: 1; transform: translateY(0) }
}
`

export function HeroAnimation() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      <div style={{ position: 'relative', width: '460px', height: '420px', flexShrink: 0 }}>
        {/* Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#f0fdf4',
          borderRadius: '20px',
          border: '1px solid #d1fae5',
        }} />

        {/* Element 1: AI prompt box */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '320px',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeInUp 0.5s ease 0s both',
          zIndex: 10,
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            backgroundColor: '#1B6B4A',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: 700,
            flexShrink: 0,
          }}>A</div>
          <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '13px',
              color: '#111827',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              width: '0',
              display: 'inline-block',
              animation: 'typing 2s steps(22) 0.3s both',
            }}>Ugovor o radu...</span>
            <span style={{
              display: 'inline-block',
              width: '2px',
              height: '16px',
              backgroundColor: '#1B6B4A',
              marginLeft: '2px',
              flexShrink: 0,
              animation: 'blink 1s infinite',
            }} />
          </div>
        </div>

        {/* Element 2: Processing indicator */}
        <div style={{
          position: 'absolute',
          top: '88px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          whiteSpace: 'nowrap',
          animation: 'fadeInUp 0.5s ease 2.5s both',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {([0, 0.2, 0.4] as const).map((delay, i) => (
              <span key={i} style={{
                display: 'block',
                width: '6px',
                height: '6px',
                backgroundColor: '#1B6B4A',
                borderRadius: '50%',
                animation: `heroPulse 1.2s ease ${delay}s infinite`,
              }} />
            ))}
          </div>
          <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
            Generišem dokument...
          </span>
        </div>

        {/* Element 3: Main document card */}
        <div style={{
          position: 'absolute',
          top: '130px',
          left: '20px',
          width: '260px',
          backgroundColor: 'white',
          borderRadius: '14px',
          padding: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
          border: '1px solid #e5e7eb',
          animation: 'fadeInUp 0.6s ease 3s both',
          zIndex: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Ugovor o radu</span>
            <span style={{
              fontSize: '10px',
              fontWeight: 600,
              color: '#1B6B4A',
              backgroundColor: '#d1fae5',
              padding: '2px 8px',
              borderRadius: '20px',
            }}>✓ Spreman</span>
          </div>
          {([
            { w: '95%', bg: '#d1fae5' },
            { w: '80%', bg: '#f3f4f6' },
            { w: '90%', bg: '#f3f4f6' },
            { w: '70%', bg: '#f3f4f6' },
            { w: '85%', bg: '#f3f4f6' },
            { w: '60%', bg: '#f3f4f6' },
          ] as const).map((line, i) => (
            <div key={i} style={{
              height: '7px',
              width: line.w,
              backgroundColor: line.bg,
              borderRadius: '4px',
              marginBottom: '7px',
            }} />
          ))}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: '#1B6B4A',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '8px',
              flex: 1,
              textAlign: 'center',
            }}>PDF</div>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: '#f0fdf4',
              color: '#1B6B4A',
              border: '1px solid #bbf7d0',
              padding: '6px 12px',
              borderRadius: '8px',
              flex: 1,
              textAlign: 'center',
            }}>Word</div>
          </div>
        </div>

        {/* Element 4: Mini card — Poslovni mejl */}
        <div style={{
          position: 'absolute',
          top: '150px',
          right: '20px',
          width: '175px',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          animation: 'fadeInUp 0.6s ease 3.4s both',
          zIndex: 9,
        }}>
          <p style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '4px', fontWeight: 500 }}>Sledeći dokument</p>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>📧 Poslovni mejl</p>
          <div style={{ height: '6px', width: '85%', backgroundColor: '#f3f4f6', borderRadius: '3px', marginBottom: '5px' }} />
          <div style={{ height: '6px', width: '65%', backgroundColor: '#f3f4f6', borderRadius: '3px' }} />
        </div>

        {/* Element 5: Mini card — NDA */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          right: '20px',
          width: '160px',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          animation: 'fadeInUp 0.6s ease 3.8s both',
          zIndex: 9,
        }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>📋 NDA sporazum</p>
          <span style={{
            display: 'inline-block',
            fontSize: '10px',
            fontWeight: 600,
            color: '#1B6B4A',
            backgroundColor: '#d1fae5',
            padding: '2px 8px',
            borderRadius: '20px',
          }}>✓ Generisan</span>
        </div>

        {/* Element 6: Stat badge */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '20px',
          backgroundColor: '#1B6B4A',
          borderRadius: '14px',
          padding: '12px 16px',
          animation: 'fadeInUp 0.6s ease 4.2s both',
          zIndex: 10,
        }}>
          <p style={{ fontSize: '22px', fontWeight: 700, color: 'white', lineHeight: 1 }}>45s</p>
          <p style={{ fontSize: '11px', color: '#a7f3d0', marginTop: '3px', fontWeight: 500 }}>prosečno vreme</p>
        </div>
      </div>
    </>
  )
}
