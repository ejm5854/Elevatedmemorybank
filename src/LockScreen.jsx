import { useState } from 'react'
import { useTheme } from './ThemeContext'

const PINS = [
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

export default function LockScreen() {
  const { unlock } = useTheme()
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)
  const [hint, setHint] = useState('')

  const handleKey = (key) => {
    if (key === '') return
    if (key === '⌫') {
      setPin(p => p.slice(0, -1))
      return
    }
    const next = pin + key
    setPin(next)

    if (next.length === 4) {
      const success = unlock(next)
      if (!success) {
        setShake(true)
        setHint('Wrong PIN. Try again.')
        setTimeout(() => { setShake(false); setPin(''); setHint('') }, 800)
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1a2a4a 50%, #0a1628 100%)' }}>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="/hero-composite.jpg"
          alt=""
          className="w-full h-full object-cover opacity-30 blur-xl scale-110"
        />
        <div className="absolute inset-0 bg-[#0a1628]/70" />
      </div>

      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl animate-pulse"
        style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl animate-pulse"
        style={{ background: 'radial-gradient(circle, #e8829a, transparent)', animationDelay: '1s' }} />

      <div className={`relative z-10 flex flex-col items-center gap-6 px-8 py-10 rounded-3xl
        border border-white/10 backdrop-blur-md bg-white/5 shadow-2xl w-full max-w-xs
        ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
        style={{ boxShadow: '0 0 60px rgba(201,168,76,0.1), 0 25px 50px rgba(0,0,0,0.5)' }}>

        <div className="w-16 h-16 rounded-full flex items-center justify-center border border-white/20"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(232,130,154,0.2))' }}>
          <span className="text-2xl">🔐</span>
        </div>

        <div className="text-center">
          <h1 className="font-serif text-2xl text-white font-bold tracking-wide">Elevated Memory Bank</h1>
          <p className="text-white/40 text-xs mt-1 tracking-widest uppercase">Enter your PIN to unlock</p>
        </div>

        <div className="flex gap-4 items-center h-6">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-3 h-3 rounded-full border-2 transition-all duration-200
              ${i < pin.length
                ? 'border-[#C9A84C] bg-[#C9A84C] scale-110'
                : 'border-white/30 bg-transparent'
              }`} />
          ))}
        </div>

        <p className="text-red-400 text-xs h-4 tracking-wide">{hint}</p>

        <div className="grid grid-cols-3 gap-3 w-full">
          {PINS.map((k, i) => (
            <button
              key={i}
              onClick={() => handleKey(k.label)}
              disabled={k.label === ''}
              className={`flex flex-col items-center justify-center h-14 rounded-2xl transition-all duration-150
                ${k.label === ''
                  ? 'opacity-0 cursor-default'
                  : k.label === '⌫'
                    ? 'bg-white/5 hover:bg-white/15 active:scale-95 text-white/60'
                    : 'hover:bg-white/15 active:scale-95 active:bg-white/20 text-white border border-white/10'
                }`}
              style={k.label !== '' && k.label !== '⌫' ? { background: 'rgba(255,255,255,0.08)' } : {}}>
              <span className="text-xl font-light">{k.label}</span>
              {k.sub && <span className="text-[9px] tracking-widest text-white/30 mt-0.5">{k.sub}</span>}
            </button>
          ))}
        </div>

        <div className="flex gap-6 mt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#C9A84C]" />
            <span className="text-white/30 text-xs">Erik</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#e8829a]" />
            <span className="text-white/30 text-xs">Marisa</span>
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
