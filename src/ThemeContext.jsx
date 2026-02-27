import { createContext, useContext, useState } from 'react'

export const themes = {
  erik: {
    name: 'erik',
    displayName: 'Erik',
    pin: '1010',
    bg: 'bg-[#0a1628]',
    bgHex: '#0a1628',
    surface: 'bg-[#111f3a]',
    surfaceHex: '#111f3a',
    accent: 'bg-[#C9A84C]',
    accentHex: '#C9A84C',
    accentLight: 'bg-[#e8c97a]',
    text: 'text-[#f5f0e8]',
    textHex: '#f5f0e8',
    textMuted: 'text-[#a89b7a]',
    border: 'border-[#C9A84C]',
    borderHex: '#C9A84C',
    navBg: 'bg-[#060e1e]',
    pinActive: 'bg-[#C9A84C]',
    pinDot: 'bg-[#C9A84C]',
    btnPrimary: 'bg-[#C9A84C] hover:bg-[#e8c97a] text-[#060e1e]',
    gradient: 'from-[#0a1628] via-[#111f3a] to-[#0a1628]',
    lockGradient: 'from-[#060e1e] to-[#0a1628]',
    shimmer: '#C9A84C',
    label: 'Navy & Gold',
    vibe: 'luxury',
  },
  marisa: {
    name: 'marisa',
    displayName: 'Marisa',
    pin: '0103',
    bg: 'bg-[#fdf0f3]',
    bgHex: '#fdf0f3',
    surface: 'bg-[#fff5f7]',
    surfaceHex: '#fff5f7',
    accent: 'bg-[#e8829a]',
    accentHex: '#e8829a',
    accentLight: 'bg-[#f4b8c8]',
    text: 'text-[#5c2d3a]',
    textHex: '#5c2d3a',
    textMuted: 'text-[#c2849a]',
    border: 'border-[#e8829a]',
    borderHex: '#e8829a',
    navBg: 'bg-[#fce4ec]',
    pinActive: 'bg-[#e8829a]',
    pinDot: 'bg-[#e8829a]',
    btnPrimary: 'bg-[#e8829a] hover:bg-[#f4b8c8] text-white',
    gradient: 'from-[#fce4ec] via-[#fff5f7] to-[#fce4ec]',
    lockGradient: 'from-[#fce4ec] to-[#fdf0f3]',
    shimmer: '#e8829a',
    label: 'Pink & Rose',
    vibe: 'cutesy',
  },
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null)

  const unlock = (pin) => {
    if (pin === themes.erik.pin) { setTheme(themes.erik); return true }
    if (pin === themes.marisa.pin) { setTheme(themes.marisa); return true }
    return false
  }

  const lock = () => setTheme(null)

  return (
    <ThemeContext.Provider value={{ theme, unlock, lock }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
