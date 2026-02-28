import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { useAllTrips } from '@/hooks/useTrips'
import { computeStats } from '@/utils/stats'

export default function StatsBar() {
  const { theme, themeName } = useTheme()
  const trips  = useAllTrips()
  const stats  = computeStats(trips)
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const isErik = themeName === 'erik'
  const displayFont = isErik ? "'Cormorant Garamond', Georgia, serif" : "'Playfair Display', Georgia, serif"
  const bodyFont = isErik ? "'DM Sans', system-ui, sans-serif" : "'Nunito', system-ui, sans-serif"
  const items = [
    { label: 'Trips',      value: stats.totalTrips,      icon: '✈️' },
    { label: 'Countries',  value: stats.totalCountries,  icon: '🌍' },
    { label: 'Days Away',  value: stats.totalDays,        icon: '📅' },
    { label: 'Continents', value: stats.totalContinents, icon: '🗺️' },
  ]
  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem', fontFamily: bodyFont }}>
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.09, duration: 0.42, ease: 'easeOut' }}
          style={{
            backgroundColor: theme.cardBgHex,
            border: `1px solid ${theme.accentHex}22`,
            borderRadius: 14, padding: '1.25rem 1rem',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 36, height: 2, backgroundColor: theme.accentHex, borderRadius: '0 0 3px 3px', opacity: 0.7 }} />
          <div style={{ fontSize: '1.1rem', marginBottom: '0.4rem', lineHeight: 1 }}>{item.icon}</div>
          <div style={{ fontFamily: displayFont, fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', fontWeight: 700, color: theme.accentHex, lineHeight: 1, letterSpacing: '-0.02em' }}>{item.value}</div>
          <div style={{ color: theme.textMutedHex, fontSize: '0.62rem', marginTop: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500 }}>{item.label}</div>
        </motion.div>
      ))}
    </div>
  )
}
