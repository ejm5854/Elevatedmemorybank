import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'

interface PhotoUploadProps { onUpload: (base64: string) => void; label?: string; accept?: string }
const MAX_SIZE_MB = 4

export default function PhotoUpload({ onUpload, label = 'Upload photo', accept = 'image/*' }: PhotoUploadProps) {
  const { theme, themeName } = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview,  setPreview]  = useState<string | null>(null)
  const [error,    setError]    = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const isErik = themeName === 'erik'
  const bodyFont = isErik ? "'DM Sans', system-ui, sans-serif" : "'Nunito', system-ui, sans-serif"

  function processFile(file: File) {
    setError(null)
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) { setError(`Image must be under ${MAX_SIZE_MB}MB.`); return }
    const reader = new FileReader()
    reader.onload = (e) => { const b64 = e.target?.result as string; setPreview(b64); onUpload(b64) }
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ fontFamily: bodyFont }}>
      <input ref={inputRef} type="file" accept={accept} onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f) }} style={{ display: 'none' }} />
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden' }}>
            <img src={preview} alt="Preview" style={{ width: '100%', height: 210, objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)' }} />
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => { setPreview(null); inputRef.current?.click() }}
              style={{ position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 8, padding: '5px 12px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: bodyFont }}>Replace</motion.button>
            <div style={{ position: 'absolute', top: 10, left: 10, backgroundColor: theme.accentHex, borderRadius: 6, padding: '3px 8px', fontSize: '0.7rem', fontWeight: 600, color: theme.bgHex }}>✓ Ready</div>
          </motion.div>
        ) : (
          <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f) }}
            style={{ border: `2px dashed ${dragging ? theme.accentHex : `${theme.accentHex}55`}`, borderRadius: 14, padding: '2.25rem 1.5rem', textAlign: 'center', cursor: 'pointer', backgroundColor: dragging ? `${theme.accentHex}12` : `${theme.accentHex}06`, transition: 'border-color 0.2s, background-color 0.2s' }}
          >
            <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{dragging ? '📂' : '📷'}</div>
            <p style={{ color: theme.textHex, fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.3rem' }}>{label}</p>
            <p style={{ color: theme.textMutedHex, fontSize: '0.75rem' }}>{dragging ? 'Drop it here!' : `Click or drag & drop · Max ${MAX_SIZE_MB}MB`}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.4rem', fontFamily: bodyFont }}>{error}</motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
