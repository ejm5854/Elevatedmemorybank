import { useTheme } from '../ThemeContext'

export default function Hero() {
  const { theme } = useTheme()
  const isMarisa = theme?.name === 'marisa'

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      <img
        src="/hawaii-bg.jpg"
        alt="Hawaii"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div
        className="absolute inset-0"
        style={{
          background: isMarisa
            ? 'linear-gradient(to top, rgba(252,228,236,0.95) 0%, rgba(252,228,236,0.4) 40%, transparent 70%)'
            : 'linear-gradient(to top, rgba(6,14,30,0.97) 0%, rgba(6,14,30,0.5) 40%, transparent 70%)',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: isMarisa
            ? 'linear-gradient(to right, rgba(252,228,236,0.5) 0%, transparent 30%, transparent 70%, rgba(252,228,236,0.5) 100%)'
            : 'linear-gradient(to right, rgba(6,14,30,0.6) 0%, transparent 30%, transparent 70%, rgba(6,14,30,0.6) 100%)',
        }}
      />

      <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
        <img
          src="/hero-composite.jpg"
          alt="Erik and Marisa"
          className="relative z-10 h-[85%] w-auto max-w-3xl object-contain object-bottom"
          style={{ filter: 'drop-shadow(0 -20px 40px rgba(0,0,0,0.3))' }}
        />
      </div>

      <div className="relative z-20 w-full max-w-6xl mx-auto px-6 pb-16 flex flex-col md:flex-row items-end justify-between gap-8">
        <div>
          {isMarisa ? (
            <>
              <p className="text-[#e8829a] uppercase tracking-[0.3em] text-xs font-medium mb-2">Our Love Story</p>
              <h1 className="font-serif text-5xl md:text-7xl text-[#5c2d3a] font-bold leading-tight drop-shadow-sm">
                Erik <span className="text-[#e8829a]">&amp;</span> Marisa
              </h1>
              <p className="text-[#c2849a] font-serif italic text-xl mt-3">Every moment, captured with love.</p>
            </>
          ) : (
            <>
              <p className="text-[#C9A84C] uppercase tracking-[0.3em] text-xs font-medium mb-2">The Life Of</p>
              <h1 className="font-serif text-5xl md:text-7xl text-white font-bold leading-tight">
                Erik <span className="text-[#C9A84C]">&amp;</span> Marisa
              </h1>
              <p className="text-[#a89b7a] font-serif italic text-xl mt-3">Every adventure. Every memory. Every moment.</p>
            </>
          )}

          <div
            className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full border backdrop-blur-sm"
            style={{
              borderColor: isMarisa ? '#e8829a' : '#C9A84C',
              background: isMarisa ? 'rgba(232,130,154,0.15)' : 'rgba(201,168,76,0.12)',
            }}>
            <span style={{ color: isMarisa ? '#e8829a' : '#C9A84C' }}>&#9829;</span>
            <span className="text-xs tracking-widest uppercase font-medium" style={{ color: isMarisa ? '#5c2d3a' : '#f5f0e8' }}>
              Together since April 25, 2022
            </span>
          </div>
        </div>

        <div className="flex gap-6 md:gap-8 shrink-0">
          {[
            { val: '850+', label: 'Days' },
            { val: '12', label: 'Trips' },
            { val: '3', label: 'Countries' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-serif text-3xl md:text-4xl font-bold" style={{ color: isMarisa ? '#e8829a' : '#C9A84C' }}>
                {s.val}
              </p>
              <p className="text-xs uppercase tracking-widest mt-1" style={{ color: isMarisa ? '#c2849a' : '#a89b7a' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
