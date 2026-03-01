import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import type { ThemeTokens } from '@/types'

interface PhotoUploadProps {
  tripId: string
  theme: ThemeTokens
  isErik: boolean
  bodyFont: string
  onDone: () => void
}

const MAX_SIZE_MB = 4

export default function PhotoUpload({ tripId, theme, isErik, bodyFont, onDone }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const addMemory = useAppStore((s) => s.addMemory)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  function processFile(file: File) {
    setError(null)
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) { setError(`Image must be under ${MAX_SIZE_MB}MB.`); return }
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  function handleSave() {
    if (!preview) return
    addMemory({
      tripId,
      type: 'photo',
      photoUrl: preview,
      caption: caption.trim() || undefined,
    })
    onDone()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: theme.cardBgHex,
    color: theme.textHex,
    border: `1px solid ${theme.accentHex}30`,
    borderRadius: 10,
    padding: '0.65rem 0.9rem',
    fontSize: '0.875rem',
    outline: 'none',
    fontFamily: bodyFont,
    boxSizing: 'border-box',
    marginTop: '0.6rem',
  }

  return (
    <div style={{
      backgroundColor: theme.surfaceHex,
      border: `1px solid ${theme.accentHex}20`,
      borderRadius: 16,
      padding: '1.25rem',
      fontFamily: bodyFont,
    }}>
      <p style={{
        color: theme.accentHex, fontSize: '0.65rem',
        letterSpacing: '0.2em', textTransform: 'uppercase',
        fontWeight: 600, marginBottom: '0.75rem',
      }}>Add Photo</p>

      <input ref={inputRef} type="file" accept="image/*"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f) }}
        style={{ display: 'none' }} />

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: '0.75rem' }}>
            <img src={preview} alt="Preview" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => { setPreview(null); inputRef.current?.click() }}
              style={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 8, padding: '4px 10px', fontSize: '0.72rem', cursor: 'pointer', fontFamily: bodyFont }}>
              Replace
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f) }}
            style={{ border: `2px dashed ${dragging ? theme.accentHex : `${theme.accentHex}40`}`, borderRadius: 12, padding: '1.5rem 1rem', textAlign: 'center', cursor: 'pointer', backgroundColor: dragging ? `${theme.accentHex}0a` : 'transparent', transition: 'border-color 0.18s', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>🖼️</div>
            <p style={{ color: theme.accentHex, fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.2rem' }}>Upload Photo</p>
            <p style={{ color: theme.textMutedHex, fontSize: '0.7rem' }}>Drag & drop or click — max {MAX_SIZE_MB}MB</p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p style={{ color: '#e05252', fontSize: '0.75rem', marginBottom: '0.5rem' }}>{error}</p>}

      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Caption (optional)"
        style={inputStyle}
      />

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.85rem' }}>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onDone}
          style={{ background: 'none', border: `1px solid ${theme.accentHex}30`, borderRadius: 9999, padding: '0.4rem 1rem', fontSize: '0.78rem', color: theme.textMutedHex, cursor: 'pointer', fontFamily: bodyFont }}>
          Cancel
        </motion.button>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={handleSave} disabled={!preview}
          style={{ backgroundColor: theme.accentHex, color: isErik ? '#0a1628' : '#fff', border: 'none', borderRadius: 9999, padding: '0.4rem 1.1rem', fontSize: '0.78rem', cursor: preview ? 'pointer' : 'not-allowed', opacity: preview ? 1 : 0.5, fontFamily: bodyFont }}>
          Save Photo
        </motion.button>
      </div>
    </div>
  )
}
