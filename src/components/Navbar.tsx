import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/utils/cn'

const NAV_LINKS = [
  { to: '/',         label: 'Home'     },
  { to: '/memories', label: 'Memories' },
  { to: '/map',      label: 'Map'      },
]

export default function Navbar() {
  const { theme, themeName, lock } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  const isErik = themeName === 'erik'
  const displayFont = isErik
    ? "'Cormorant Garamond', Georgia, serif"
    : "'Playfair Display', Georgia, serif"
  const bodyFont = isErik
    ? "'DM Sans', system-ui, sans-serif"
    : "'Nunito', system-ui, sans-serif"

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.nav
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32, delay: 0.1 }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        backgroundColor: scrolled
          ? `${theme.navBgHex}ee`
          : `${theme.navBgHex}99`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: scrolled
          ? `1px solid ${theme.accentHex}28`
          : `1px solid ${theme.accentHex}14`,
        transition: 'background-color 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease',
        boxShadow: scrolled ? `0 4px 24px rgba(0,0,0,0.18)` : 'none',
        fontFamily: bodyFont,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 1.5rem',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* -- Wordmark */}
        <NavLink
          to="/"
          style={{
            fontFamily: displayFont,
            fontSize: '1.5rem',
            fontWeight: isErik ? 400 : 700,
            fontStyle: isErik ? 'italic' : 'normal',
            color: theme.accentHex,
            textDecoration: 'none',
            letterSpacing: isErik ? '0.06em' : '0.02em',
            lineHeight: 1,
          }}
        >
          Elevated
        </NavLink>

        {/* -- Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn('transition-all duration-200', isActive ? '' : 'hover:opacity-90')
              }
              style={({ isActive }) => ({
                color: isActive ? theme.accentHex : theme.textHex,
                backgroundColor: isActive ? `${theme.accentHex}18` : 'transparent',
                textDecoration: 'none',
                padding: '0.4rem 0.9rem',
                borderRadius: 8,
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                letterSpacing: '0.02em',
                opacity: isActive ? 1 : 0.75,
              })}
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* -- Lock / user indicator */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={lock}
          title="Lock & switch user"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.85rem',
            borderRadius: 9999,
            border: `1px solid ${theme.accentHex}30`,
            backgroundColor: `${theme.accentHex}0e`,
            color: theme.textMutedHex,
            fontSize: '0.78rem',
            fontWeight: 500,
            cursor: 'pointer',
            letterSpacing: '0.03em',
            transition: 'border-color 0.2s, background-color 0.2s',
            fontFamily: bodyFont,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.borderColor = `${theme.accentHex}66`
            el.style.backgroundColor = `${theme.accentHex}1a`
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.borderColor = `${theme.accentHex}30`
            el.style.backgroundColor = `${theme.accentHex}0e`
          }}
        >
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            backgroundColor: theme.accentHex,
            display: 'inline-block', flexShrink: 0,
          }} />
          <span className="hidden sm:inline">
            {themeName === 'erik' ? 'Erik' : 'Marisa'}
          </span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>Lock</span>
        </motion.button>
      </div>
    </motion.nav>
  )
}
