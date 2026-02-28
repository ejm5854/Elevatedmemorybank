/**
 * TripPopup.tsx
 * Floating trip detail card that appears when a map pin is clicked.
 *
 * Desktop: fixed panel anchored top-right of the map area
 * Mobile:  full-width bottom sheet
 *
 * Animates in with Framer Motion (slide up + fade).
 */

import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { Trip } from '@/types'
import type { ThemeTokens } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T12:00:00')
  const e = new Date(end + 'T12:00:00')

  const sameYear = s.getFullYear() === e.getFullYear()
  const sameMonth = sameYear && s.getMonth() === e.getMonth()

  const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'short' })
  const dayFmt   = new Intl.DateTimeFormat('en-US', { day: 'numeric' })

  const startStr = `${monthFmt.format(s)} ${dayFmt.format(s)}`

  if (sameMonth) {
    // "Mar 12 – 18, 2024"
    return `${startStr} \u2013 ${dayFmt.format(e)}, ${e.getFullYear()}`
  } else if (sameYear) {
    // "Dec 30 – Jan 3, 2024"
    return `${startStr} \u2013 ${monthFmt.format(e)} ${dayFmt.format(e)}, ${e.getFullYear()}`
  } else {
    // "Dec 30, 2023 – Jan 3, 2024"
    return `${startStr}, ${s.getFullYear()} \u2013 ${monthFmt.format(e)} ${dayFmt.format(e)}, ${e.getFullYear()}`
  }
}

function StarRating({ rating, accentHex }: { rating: number; accentHex: string }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{
            fontSize: '0.85rem',
            color: n <= rating ? accentHex : 'currentColor',
            opacity: n <= rating ? 1 : 0.25,
          }}
        >
          &#9733;
        </span>
      ))}
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

interface TripPopupProps {
  trip: Trip | null
  theme: ThemeTokens
  onClose: () => void
}

export default function TripPopup({ trip, theme, onClose }: TripPopupProps) {
  const navigate = useNavigate()
  const isErik = theme.name === 'erik'

  return (
    <AnimatePresence>
      {trip && (
        <>
          {/* ── Desktop card (top-right panel) ── */}
          <motion.div
            key="popup-desktop"
            initial={{ opacity: 0, x: 32, scale: 0.95 }}
            animate={{ opacity: 1, x: 0,  scale: 1    }}
            exit={{   opacity: 0, x: 32, scale: 0.95  }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            style={{
              position: 'absolute',
              top: '50%',
              right: '1.5rem',
              transform: 'translateY(-50%)',
              width: 300,
              borderRadius: 20,
              overflow: 'hidden',
              zIndex: 1000,
              backgroundColor: theme.cardBgHex,
              border: `1px solid ${theme.accentHex}30`,
              boxShadow: isErik
                ? '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.15)'
                : '0 16px 48px rgba(196,113,106,0.18), 0 0 0 1px rgba(232,130,154,0.2)',
            }}
            // Hide on mobile via CSS class
            className="map-popup-desktop"
          >
            <PopupInner trip={trip} theme={theme} onClose={onClose} navigate={navigate} />
          </motion.div>

          {/* ── Mobile bottom sheet ── */}
          <motion.div
            key="popup-mobile"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0       }}
            exit={{   opacity: 0, y: '100%'   }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              borderRadius: '20px 20px 0 0',
              overflow: 'hidden',
              zIndex: 1000,
              backgroundColor: theme.cardBgHex,
              border: `1px solid ${theme.accentHex}30`,
              borderBottom: 'none',
              boxShadow: isErik
                ? '0 -8px 32px rgba(0,0,0,0.5)'
                : '0 -8px 32px rgba(196,113,106,0.15)',
            }}
            className="map-popup-mobile"
          >
            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '0.75rem' }}>
              <div style={{
                width: 36, height: 4, borderRadius: 2,
                backgroundColor: `${theme.accentHex}44`,
              }} />
            </div>
            <PopupInner trip={trip} theme={theme} onClose={onClose} navigate={navigate} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Shared inner content ─────────────────────────────────────────────────────

interface PopupInnerProps {
  trip: Trip
  theme: ThemeTokens
  onClose: () => void
  navigate: ReturnType<typeof useNavigate>
}

function PopupInner({ trip, theme, onClose, navigate }: PopupInnerProps) {
  const dateRange = formatDateRange(trip.startDate, trip.endDate)

  return (
    <div>
      {/* Cover photo */}
      <div style={{ position: 'relative' }}>
        <img
          src={trip.coverPhotoUrl}
          alt={trip.title}
          style={{
            width: '100%',
            aspectRatio: '16/9',
            objectFit: 'cover',
            display: 'block',
          }}
          onError={(e) => {
            // Fallback gradient on broken image
            const el = e.currentTarget
            el.style.display = 'none'
            const parent = el.parentElement
            if (parent) {
              parent.style.background = `linear-gradient(135deg, ${theme.surfaceHex}, ${theme.cardBgHex})`
              parent.style.aspectRatio = '16/9'
            }
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '0.6rem',
            right: '0.6rem',
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.55)',
            border: 'none',
            color: '#fff',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            backdropFilter: 'blur(4px)',
          }}
          aria-label="Close"
        >
          &#10005;
        </button>

        {/* Continent badge */}
        <div style={{
          position: 'absolute',
          bottom: '0.5rem',
          left: '0.6rem',
          backgroundColor: `${theme.accentHex}cc`,
          borderRadius: 6,
          padding: '0.15rem 0.5rem',
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: theme.name === 'erik' ? '#0a1628' : '#fff',
          backdropFilter: 'blur(4px)',
        }}>
          {trip.destination.continent}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1rem 1.1rem 1.1rem' }}>
        {/* City + Country */}
        <p style={{
          color: theme.accentHex,
          fontSize: '0.68rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          marginBottom: '0.3rem',
        }}>
          {trip.destination.city}, {trip.destination.country}
        </p>

        {/* Title */}
        <h2 style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontWeight: 700,
          fontSize: '1.15rem',
          color: theme.textHex,
          marginBottom: '0.35rem',
          lineHeight: 1.3,
        }}>
          {trip.title}
        </h2>

        {/* Date range + stars row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.65rem',
        }}>
          <p style={{
            color: theme.textMutedHex,
            fontSize: '0.75rem',
          }}>
            {dateRange}
          </p>
          <StarRating rating={trip.rating} accentHex={theme.accentHex} />
        </div>

        {/* Tags */}
        {trip.tags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.35rem',
            marginBottom: '0.85rem',
          }}>
            {trip.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                style={{
                  backgroundColor: `${theme.accentHex}1a`,
                  border: `1px solid ${theme.accentHex}33`,
                  color: theme.accentHex,
                  borderRadius: 20,
                  padding: '0.15rem 0.55rem',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'capitalize',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Who attended */}
        <div style={{
          display: 'flex',
          gap: '0.4rem',
          marginBottom: '0.85rem',
        }}>
          {trip.erikAttended && (
            <span style={{
              fontSize: '0.65rem',
              padding: '0.15rem 0.5rem',
              borderRadius: 20,
              backgroundColor: 'rgba(201,168,76,0.12)',
              color: '#C9A84C',
              border: '1px solid rgba(201,168,76,0.25)',
              fontWeight: 600,
            }}>
              Erik
            </span>
          )}
          {trip.marisaAttended && (
            <span style={{
              fontSize: '0.65rem',
              padding: '0.15rem 0.5rem',
              borderRadius: 20,
              backgroundColor: 'rgba(232,130,154,0.12)',
              color: '#e8829a',
              border: '1px solid rgba(232,130,154,0.25)',
              fontWeight: 600,
            }}>
              Marisa
            </span>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate(`/memories/${trip.id}`)}
          style={{
            width: '100%',
            padding: '0.6rem 1rem',
            borderRadius: 12,
            border: 'none',
            backgroundColor: theme.accentHex,
            color: theme.name === 'erik' ? '#0a1628' : '#fff',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            letterSpacing: '0.02em',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'    }}
        >
          View Memories
          <span style={{ fontSize: '1rem' }}>&#8594;</span>
        </button>
      </div>
    </div>
  )
}
