import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useTheme } from '../ThemeContext'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Trips', path: '/trips' },
  { label: 'Map', path: '/map' },
  { label: 'Favorites', path: '/favorites' },
  { label: 'Bucket List', path: '/bucket-list' },
  { label: 'Stats', path: '/stats' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, lock } = useTheme()
  const isMarisa = theme?.name === 'marisa'

  const navBg = isMarisa ? '#fce4ec' : '#060e1e'
  const navText = isMarisa ? '#5c2d3a' : '#f5f0e8'
  const accentColor = isMarisa ? '#e8829a' : '#C9A84C'
  const mutedText = isMarisa ? '#c2849a' : '#a89b7a'
  const borderColor = isMarisa ? '#f4b8c8' : '#1a2a4a'

  return (
    <nav className="sticky top-0 z-50 shadow-lg" style={{ background: navBg, borderBottom: `1px solid ${borderColor}` }}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        <div className="flex items-center gap-2">
          <span style={{ color: accentColor }} className="text-xl">&#9829;</span>
          <span className="font-serif text-lg font-semibold tracking-wide" style={{ color: navText }}>
            Elevated Memory Bank
          </span>
          <span
            className="ml-2 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-medium"
            style={{
              background: isMarisa ? 'rgba(232,130,154,0.2)' : 'rgba(201,168,76,0.15)',
              color: accentColor,
              border: `1px solid ${accentColor}40`,
            }}>
            {theme?.displayName}
          </span>
        </div>

        <ul className="hidden md:flex gap-8 items-center">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `text-xs font-medium tracking-widest uppercase transition-colors duration-200 ${isActive ? 'border-b-2 pb-1' : ''}`
                }
                style={({ isActive }) => ({
                  color: isActive ? accentColor : mutedText,
                  borderColor: isActive ? accentColor : 'transparent',
                })}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              onClick={lock}
              className="text-xs tracking-widest uppercase px-3 py-1.5 rounded-full border transition-all duration-200 hover:opacity-80"
              style={{ color: accentColor, borderColor: `${accentColor}50` }}>
              Lock
            </button>
          </li>
        </ul>

        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={lock}
            className="text-xs px-3 py-1 rounded-full border"
            style={{ color: accentColor, borderColor: `${accentColor}50` }}>
            Lock
          </button>
          <button
            className="focus:outline-none"
            style={{ color: navText }}
            onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden px-6 pb-5 pt-2" style={{ background: navBg, borderTop: `1px solid ${borderColor}` }}>
          <ul className="flex flex-col gap-4">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) => ({ color: isActive ? accentColor : mutedText })}
                  className="text-sm font-medium tracking-wider uppercase">
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
