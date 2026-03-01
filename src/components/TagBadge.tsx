import { motion } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/utils/cn'
import type { ThemeTokens } from '@/types'

const FALLBACK_THEME = {
  accentHex: '#888',
  bgHex: 'rgba(128,128,128,0.12)',
} as const

interface TagBadgeProps {
  tag: string
  theme?: ThemeTokens
  active?: boolean
  onClick?: () => void
  size?: 'sm' | 'md'
}

export default function TagBadge({ tag, theme: themeProp, active = false, onClick, size = 'sm' }: TagBadgeProps) {
  const { theme: hookTheme, themeName } = useTheme()
  const theme = themeProp ?? hookTheme
  const isErik = themeName === 'erik'
  const bodyFont = isErik ? "'DM Sans', system-ui, sans-serif" : "'Nunito', system-ui, sans-serif"
  const accentHex = theme?.accentHex ?? FALLBACK_THEME.accentHex
  const bgHex = theme?.bgHex ?? FALLBACK_THEME.bgHex
  const isClickable = !!onClick
  return (
    <motion.span
      whileHover={isClickable ? { scale: 1.06 } : {}}
      whileTap={isClickable ? { scale: 0.95 } : {}}
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-all duration-180',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        isClickable ? 'cursor-pointer' : 'cursor-default'
      )}
      style={{
        backgroundColor: active ? accentHex : `${accentHex}18`,
        color: active ? bgHex : accentHex,
        border: `1px solid ${accentHex}${active ? 'cc' : '44'}`,
        fontFamily: bodyFont,
        letterSpacing: '0.03em',
        boxShadow: active ? `0 2px 10px ${accentHex}30` : 'none',
      }}
    >
      {tag}
    </motion.span>
  )
}
