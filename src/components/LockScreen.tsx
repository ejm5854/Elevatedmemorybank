import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'

const KEYS = [
  { label: '1', sub: '' },
  { label: '2', sub: 'ABC' },
  { label: '3', sub: 'DEF' },
  { label: '4', sub: 'GHI' },
  { label: '5', sub: 'JKL' },
  { label: '6', sub: 'MNO' },
  { label: '7', sub: 'PQRS' },
  { label: '8', sub: 'TUV' },
  { label: '9', sub: 'WXYZ' },
  { label: '', sub: '' },
  { label: '0', sub: '+' },
  { label: '⌫', sub: '' },
]

const PINS: Record<string, string> = {
  '1234': 'erik',
  '5678': 'marisa',
}

export default function LockScreen() {
  const setActiveTheme = useAppStore((s) => s.setActiveTheme)
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)
  const [hint, setHint] = useState('')

  const handleKey = (key: string) => {
    if (key === '') return
    if (key === '⌫') {
      setPin(p => p.slice(0, -1))
      return
    }
    const next = pin + key
    setPin(next)
    if (next.length === 4) {
      const theme = PINS[next]
      if (theme) {
        setActiveTheme(theme as 'erik' | 'marisa')
      } else {
        setShake(true)
        setHint('Wrong PIN. Try again.')
        setTimeout(() => { setShake(false); setPin(''); setHint('') }, 800)
      }
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a1628 0%, #1a2a4a 50%, #0a1628 100%)',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '320px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '1.5rem',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        boxShadow: '0 0 60px rgba(201,168,76,0.1), 0 25px 50px rgba(0,0,0,0.5)',
        animation: shake ? 'shake 0.4s ease-in-out' : 'none',
      }}>

        {/* Icon */}
        <div style={{
          width: '4rem', height: '4rem', borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(232,130,154,0.2))',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem',
        }}>🔐</div>

        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>
            Elevated Memory Bank
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', marginTop: '0.25rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Enter your PIN to unlock
          </p>
        </div>

        {/* PIN dots */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: '0.75rem', height: '0.75rem', borderRadius: '50%',
              border: `2px solid ${i < pin.length ? '#C9A84C' : 'rgba(255,255,255,0.3)'}`,
              background: i < pin.length ? '#C9A84C' : 'transparent',
              transition: 'all 0.2s',
              transform: i < pin.length ? 'scale(1.1)' : 'scale(1)',
            }} />
          ))}
        </div>

        {/* Error hint */}
        <p style={{ color: 'rgba(248,113,113,0.8)', fontSize: '0.75rem', minHeight: '1rem', margin: 0 }}>
          {hint}
        </p>

        {/* Keypad */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
          width: '100%',
        }}>
          {KEYS.map(({ label, sub }, idx) => (
            <button
              key={idx}
              onClick={() => handleKey(label)}
              disabled={label === ''}
              style={{
                height: '3.5rem',
                borderRadius: '1rem',
                border: label === '' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                background: label === '' ? 'transparent' : label === '⌫' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)',
                color: label === '⌫' ? 'rgba(255,255,255,0.6)' : '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                cursor: label === '' ? 'default' : 'pointer',
                visibility: label === '' ? 'hidden' : 'visible',
                transition: 'all 0.15s',
                boxShadow: label !== '' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              <span style={{ fontSize: '1.25rem', fontWeight: 300, lineHeight: 1 }}>{label}</span>
              {sub && <span style={{ fontSize: '0.5rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)' }}>{sub}</span>}
            </button>
          ))}
        </div>

        {/* User indicators */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#C9A84C' }} />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>Erik</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#e8829a' }} />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>Marisa</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  )
}
