import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'

interface StarRatingProps {
  value: number
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP = { sm: 13, md: 18, lg: 24 }

export default function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const { theme } = useTheme()
  const [hovered, setHovered] = useState(0)
  const px = SIZE_MAP[size]
  const display = readonly ? value : (hovered || value)
  return (
    <div className="flex" style={{ gap: size === 'sm' ? 2 : 3, cursor: readonly ? 'default' : 'pointer' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= display
        return (
          <motion.svg
            key={star}
            width={px} height={px} viewBox="0 0 24 24"
            fill={filled ? theme.accentHex : 'none'}
            stroke={filled ? theme.accentHex : `${theme.accentHex}66`}
            strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onClick={() => !readonly && onChange?.(star)}
            whileHover={!readonly ? { scale: 1.2 } : {}}
            whileTap={!readonly ? { scale: 0.9 } : {}}
            transition={{ duration: 0.12 }}
            style={{ flexShrink: 0 }}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </motion.svg>
        )
      })}
    </div>
  )
}
