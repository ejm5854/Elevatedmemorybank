import { motion } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { computeStats } from '@/utils/stats'
import type { Trip } from '@/types'

interface StatsBarProps { trips: Trip[] }

export default function StatsBar({ trips }: StatsBarProps) {
  const { theme, themeName } = useTheme()
  const stats = computeStats(trips)
  const isErik = themeName === 'erik'
  const displayFont = isErik ? "'Cormorant Garamond', Georgia, serif" : "'Playfair Display', Georgia, serif"
  const bodyFont = isErik ? "'DM Sans', system-ui, sans-serif" : "'Nunito', system-ui, sans-serif"

  const items = [
    { value: stats.totalTrips,       label: 'Trips'      },
    { value: stats.totalCountries,   label: 'Countries'  },
    { value: stats.totalContinents,  label: 'Continents' },
    { value: stats.totalDays,        label: 'Days'       },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${items.length}, 1fr)`,
      gap: '0.75rem',
      fontFamily: bodyFont,
    }}>
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.06, ease: 'easeOut' }}
          style={{
            backgroundColor: theme.cardBgHex,
            border: `1px solid ${theme.accentHex}20`,
            borderRadius: 14,
            padding: '1rem 0.5rem',
            textAlign: 'center',
          }}
        >
          <p style={{
            fontFamily: displayFont,
            fontSize: isErik ? '2rem' : '1.85rem',
            fontWeight: isErik ? 400 : 700,
            fontStyle: isErik ? 'italic' : 'normal',
            color: theme.accentHex,
            lineHeight: 1,
            marginBottom: '0.3rem',
          }}>
            {item.value}
          </p>
          <p style={{
            color: theme.textMutedHex,
            fontSize: '0.65rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}>
            {item.label}
          </p>
        </motion.div>
      ))}
    </div>
  )
}
