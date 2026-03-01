import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { useAppStore } from '@/store/useAppStore'
import type { Memory } from '@/types'
import type { ThemeTokens } from '@/types'

interface MemoryCardProps {
  memory: Memory
  theme?: ThemeTokens
  isErik?: boolean
  bodyFont?: string
  onDelete?: () => void
}

export default function MemoryCard({ memory, theme, isErik, bodyFont, onDelete }: MemoryCardProps) {
  const { theme: hookTheme, themeName } = useTheme()
  const resolvedTheme = theme ?? hookTheme
  const resolvedIsErik = isErik ?? (themeName === 'erik')
  const resolvedBodyFont = bodyFont ?? (resolvedIsErik ? "'DM Sans', system-ui, sans-serif" : "'Nunito', system-ui, sans-serif")
  const deleteMemory = useAppStore((s) => s.deleteMemory)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const displayFont = resolvedIsErik ? "'Cormorant Garamond', Georgia, serif" : "'Playfair Display', Georgia, serif"

  function handleDelete() { deleteMemory(memory.id); onDelete?.() }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      style={{ backgroundColor: resolvedTheme.cardBgHex, border: `1px solid ${resolvedTheme.accentHex}1e`, borderRadius: 16, overflow: 'hidden', fontFamily: resolvedBodyFont, boxShadow: '0 2px 10px rgba(0,0,0,0.10)', position: 'relative' }}
    >
      {memory.type === 'photo' && memory.photoUrl && (
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img src={memory.photoUrl} alt={memory.caption || 'Memory photo'} loading="lazy" style={{ width: '100%', height: 190, objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to top, rgba(0,0,0,0.45), transparent)' }} />
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setConfirmDelete(true)}
            style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >✕</motion.button>
        </div>
      )}
      {memory.caption && (
        <p style={{ padding: '0.6rem 0.85rem 0.4rem', fontSize: '0.78rem', color: resolvedTheme.textMutedHex, fontStyle: 'italic', lineHeight: 1.5 }}>{memory.caption}</p>
      )}
      {memory.type === 'note' && memory.note && (
        <div style={{ padding: '1rem 1rem 0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.85rem' }}>📝</span>
            <span style={{ color: resolvedTheme.accentHex, fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>Note</span>
          </div>
          <div style={{ fontFamily: displayFont, fontSize: '2.5rem', color: `${resolvedTheme.accentHex}30`, lineHeight: 0.6, marginBottom: '0.3rem' }}>&quot;</div>
          <p style={{ color: resolvedTheme.textHex, fontSize: '0.875rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>{memory.note}</p>
          <div style={{ height: 1, backgroundColor: `${resolvedTheme.accentHex}18`, margin: '0.8rem 0 0.6rem' }} />
          <button onClick={() => setConfirmDelete(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: resolvedTheme.textMutedHex, fontSize: '0.72rem', fontFamily: resolvedBodyFont }}>Delete note</button>
        </div>
      )}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.72)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', borderRadius: 16, padding: '1rem' }}
          >
            <p style={{ color: '#fff', fontSize: '0.8rem', textAlign: 'center', fontFamily: resolvedBodyFont }}>Delete this memory?</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleDelete}
                style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '0.4rem 0.9rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: resolvedBodyFont }}>Delete</motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setConfirmDelete(false)}
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '0.4rem 0.9rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: resolvedBodyFont }}>Cancel</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
