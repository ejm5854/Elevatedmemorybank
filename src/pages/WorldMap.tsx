/**
 * WorldMap.tsx
 * ============
 * The showpiece interactive world map for Elevated.
 *
 * Features:
 *  - Themed tile layers (CartoDB Dark Matter / Positron) that swap with activeTheme
 *  - Custom DivIcon pins (navy+gold for Erik, blush+rose for Marisa)
 *  - Hover tooltip showing city name
 *  - Click → animated TripPopup card (desktop side panel / mobile bottom sheet)
 *  - Stats overlay (trips / countries / continents) — glassmorphism, top-left
 *  - Continent filter bar above the map
 *  - Opening zoom animation via useMap hook child component
 *  - Staggered pin drop-in with Framer Motion wrappers
 *  - Responsive: stats hidden on mobile, filter scrolls horizontally
 *
 * Architecture:
 *  MapContainer
 *    └─ TileLayerSwitcher   (useMap — swaps URL reactively)
 *    └─ MapAnimator         (useMap — opening zoom-in animation)
 *    └─ Marker × N          (DivIcon pins, event handlers)
 *  TripPopup                (absolute overlay, outside MapContainer)
 *  StatsOverlay             (absolute overlay, outside MapContainer)
 *  FilterBar                (above map, inside page wrapper)
 */

import 'leaflet/dist/leaflet.css'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'

import { useAppStore, useThemeTokens } from '@/store/useAppStore'
import { useAllTrips } from '@/hooks/useTrips'
import TripPopup from '@/components/TripPopup'
import { createPinIcon, createSelectedPinIcon } from '@/components/MapPin'
import type { Trip } from '@/types'

// ─── Fix Leaflet default icon (Vite asset pipeline) ──────────────────────────
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: '', iconUrl: '', shadowUrl: '' })

// ─── Tile layer URLs ──────────────────────────────────────────────────────────
const TILE_URLS = {
  erik:   'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  marisa: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
} as const

const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OSM</a> ' +
  '&copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>'

// ─── Continent list ───────────────────────────────────────────────────────────
const CONTINENTS = ['All', 'Americas', 'Europe', 'Asia', 'Oceania', 'Africa'] as const
type ContinentFilter = (typeof CONTINENTS)[number]

// ─── Map initial config ───────────────────────────────────────────────────────
const INITIAL_CENTER: [number, number] = [20, 10]
const INITIAL_ZOOM = 1
const TARGET_ZOOM  = 2.5

// ─── TileLayerSwitcher ────────────────────────────────────────────────────────
/**
 * Lives inside <MapContainer> so it can call useMap().
 * Watches activeTheme and swaps the tile layer URL reactively.
 */
function TileLayerSwitcher({ themeName }: { themeName: 'erik' | 'marisa' }) {
  const url = TILE_URLS[themeName]
  return (
    <TileLayer
      url={url}
      attribution={TILE_ATTRIBUTION}
      subdomains="abcd"
      maxZoom={19}
    />
  )
}

// ─── MapZoomController ────────────────────────────────────────────────────────
/**
 * Lives inside <MapContainer>. Exposes zoom in/out via a ref callback so the
 * parent can trigger zoom from outside without fighting Leaflet's event system.
 */
interface MapZoomControllerProps {
  onRegister: (zoomIn: () => void, zoomOut: () => void) => void
}
function MapZoomController({ onRegister }: MapZoomControllerProps) {
  const map = useMap()
  useEffect(() => {
    onRegister(
      () => map.zoomIn(),
      () => map.zoomOut(),
    )
  }, [map, onRegister])
  return null
}

// ─── MapAnimator ──────────────────────────────────────────────────────────────
/**
 * On mount, flies from zoom 1 → 2.5 over 1.5 s.
 * Lives inside <MapContainer> to use useMap().
 */
function MapAnimator() {
  const map = useMap()
  const animated = useRef(false)

  useEffect(() => {
    if (animated.current) return
    animated.current = true

    const timer = setTimeout(() => {
      map.flyTo(INITIAL_CENTER, TARGET_ZOOM, {
        duration: 1.5,
        easeLinearity: 0.4,
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [map])

  return null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns unique count of a key across trips */
function countUnique(trips: Trip[], key: (t: Trip) => string): number {
  return new Set(trips.map(key)).size
}

/** Animated counter from 0 → target */
function useCountUp(target: number, duration = 800): number {
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (target === 0) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setVal(Math.round(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    const raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return val
}

// ─── StatsOverlay ─────────────────────────────────────────────────────────────
interface StatsOverlayProps {
  trips: Trip[]
  isErik: boolean
  accentHex: string
  textHex: string
  textMutedHex: string
}

function StatsOverlay({ trips, isErik, accentHex, textHex, textMutedHex }: StatsOverlayProps) {
  const nTrips      = useCountUp(trips.length, 900)
  const nCountries  = useCountUp(countUnique(trips, (t) => t.destination.country), 1000)
  const nContinents = useCountUp(countUnique(trips, (t) => t.destination.continent), 800)

  const glass = isErik
    ? 'rgba(10, 22, 40, 0.72)'
    : 'rgba(255, 248, 250, 0.72)'

  const border = isErik
    ? 'rgba(201,168,76,0.2)'
    : 'rgba(232,130,154,0.25)'

  const stats = [
    { label: 'trips',      val: nTrips      },
    { label: 'countries',  val: nCountries  },
    { label: 'continents', val: nContinents },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0   }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="map-stats-overlay"
      style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        zIndex: 500,
        display: 'flex',
        gap: '0.5rem',
        padding: '0.6rem 0.9rem',
        borderRadius: 14,
        backgroundColor: glass,
        border: `1px solid ${border}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: isErik
          ? '0 4px 24px rgba(0,0,0,0.4)'
          : '0 4px 24px rgba(232,130,154,0.12)',
      }}
    >
      {stats.map((s, i) => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: i < stats.length - 1 ? '0.5rem' : 0 }}>
          <div style={{ textAlign: 'center', minWidth: 40 }}>
            <div style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontWeight: 700,
              fontSize: '1.1rem',
              color: accentHex,
              lineHeight: 1,
            }}>
              {s.val}
            </div>
            <div style={{
              fontSize: '0.58rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: textMutedHex,
              marginTop: '0.15rem',
            }}>
              {s.label}
            </div>
          </div>
          {i < stats.length - 1 && (
            <div style={{
              width: 1,
              height: 24,
              backgroundColor: isErik ? 'rgba(201,168,76,0.2)' : 'rgba(232,130,154,0.2)',
              marginRight: '0.5rem',
            }} />
          )}
        </div>
      ))}
    </motion.div>
  )
}

// ─── FilterBar ────────────────────────────────────────────────────────────────
interface FilterBarProps {
  active: ContinentFilter
  onChange: (c: ContinentFilter) => void
  isErik: boolean
  accentHex: string
  textHex: string
  textMutedHex: string
  bgHex: string
  surfaceHex: string
}

function FilterBar({
  active, onChange, isErik, accentHex, textHex, textMutedHex, bgHex, surfaceHex,
}: FilterBarProps) {
  return (
    <div
      className="map-filter-bar"
      style={{
        position: 'relative',
        zIndex: 600,
        display: 'flex',
        gap: '0.4rem',
        padding: '0.65rem 1rem',
        overflowX: 'auto',
        backgroundColor: bgHex,
        borderBottom: `1px solid ${accentHex}18`,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {CONTINENTS.map((c) => {
        const isActive = active === c
        return (
          <motion.button
            key={c}
            onClick={() => onChange(c)}
            whileTap={{ scale: 0.93 }}
            style={{
              flexShrink: 0,
              padding: '0.3rem 0.85rem',
              borderRadius: 20,
              border: isActive
                ? `1.5px solid ${accentHex}`
                : `1.5px solid ${accentHex}28`,
              backgroundColor: isActive
                ? accentHex
                : isErik
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(0,0,0,0.04)',
              color: isActive
                ? (isErik ? '#0a1628' : '#fff')
                : textMutedHex,
              fontSize: '0.72rem',
              fontWeight: isActive ? 700 : 500,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {c}
          </motion.button>
        )
      })}
    </div>
  )
}

// ─── WorldMap (main) ──────────────────────────────────────────────────────────
export default function WorldMap() {
  const theme      = useThemeTokens()
  const activeThemeName = useAppStore((s) => s.activeTheme) ?? 'erik'
  const allTrips   = useAllTrips()

  const [selected,        setSelected]        = useState<Trip | null>(null)
  const [hoveredId,       setHoveredId]       = useState<string | null>(null)
  const [continentFilter, setContinentFilter] = useState<ContinentFilter>('All')

  // Zoom callbacks registered by MapZoomController (inside MapContainer)
  const zoomInRef  = useRef<(() => void) | null>(null)
  const zoomOutRef = useRef<(() => void) | null>(null)
  const handleRegisterZoom = useCallback((zIn: () => void, zOut: () => void) => {
    zoomInRef.current  = zIn
    zoomOutRef.current = zOut
  }, [])

  const isErik = activeThemeName === 'erik'

  // ── Filter trips by continent ──
  const visibleTrips = useMemo(() => {
    const mappable = allTrips.filter(
      (t) => t.destination.coordinates.lat !== 0 || t.destination.coordinates.lng !== 0
    )
    if (continentFilter === 'All') return mappable
    return mappable.filter((t) => t.destination.continent === continentFilter)
  }, [allTrips, continentFilter])

  // ── All mappable trips (for stats — always unfiltered) ──
  const allMappable = useMemo(
    () => allTrips.filter((t) => t.destination.coordinates.lat !== 0 || t.destination.coordinates.lng !== 0),
    [allTrips]
  )

  // ── Close popup on Escape ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ── Pin icon factory (memoized per theme + hover state) ──
  const getPinIcon = useCallback(
    (trip: Trip) => {
      const visited = trip.erikAttended || trip.marisaAttended
      const isSelected = selected?.id === trip.id
      const isHovered  = hoveredId === trip.id

      if (isSelected) {
        return createSelectedPinIcon({
          accentHex: theme.accentHex,
          bgHex: isErik ? '#0a1628' : '#fff0f4',
          visited,
        })
      }

      return createPinIcon({
        accentHex: theme.accentHex,
        bgHex: isErik ? '#0a1628' : '#fff0f4',
        visited,
        hovered: isHovered,
      })
    },
    [theme.accentHex, isErik, selected, hoveredId]
  )

  // ── Stagger animation delay per pin ──
  const pinDelay = (i: number) => 0.7 + i * 0.08

  return (
    <>
      {/* Scoped styles for responsive show/hide and scrollbar suppression */}
      <style>{`
        .map-popup-mobile  { display: none !important; }
        .map-stats-overlay { display: flex !important; }
        @media (max-width: 640px) {
          .map-popup-desktop  { display: none !important; }
          .map-popup-mobile   { display: block !important; }
          .map-stats-overlay  { display: none !important; }
        }
        .map-filter-bar::-webkit-scrollbar { display: none; }
        .leaflet-control-attribution {
          font-size: 9px !important;
          opacity: 0.55 !important;
        }
        @keyframes pin-pulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          70%  { transform: scale(1.9); opacity: 0;   }
          100% { transform: scale(1.9); opacity: 0;   }
        }
        /* Ensure Leaflet popups don't fight with our custom popups */
        .leaflet-popup { display: none !important; }
      `}</style>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          position: 'relative',
          width: '100%',
          height: 'calc(100dvh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.bgHex,
          overflow: 'hidden',
        }}
      >
        {/* ── Continent Filter Bar ── */}
        <FilterBar
          active={continentFilter}
          onChange={(c) => {
            setContinentFilter(c)
            // Deselect if selected trip is now hidden
            if (selected && c !== 'All' && selected.destination.continent !== c) {
              setSelected(null)
            }
          }}
          isErik={isErik}
          accentHex={theme.accentHex}
          textHex={theme.textHex}
          textMutedHex={theme.textMutedHex}
          bgHex={theme.bgHex}
          surfaceHex={theme.surfaceHex}
        />

        {/* ── Map area (relative container for overlays) ── */}
        <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>

          {/* ── Leaflet Map ── */}
          <MapContainer
            center={INITIAL_CENTER}
            zoom={INITIAL_ZOOM}
            minZoom={2}
            maxZoom={18}
            maxBounds={[[-85, -190], [85, 190]]}
            maxBoundsViscosity={0.85}
            zoomControl={false}
            attributionControl={true}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Tile layer — swaps reactively with theme */}
            <TileLayerSwitcher themeName={activeThemeName} />

            {/* Opening zoom animation */}
            <MapAnimator />

            {/* Register zoom callbacks via useMap() */}
            <MapZoomController onRegister={handleRegisterZoom} />

            {/* ── Pins ── */}
            {visibleTrips.map((trip, i) => (
              <Marker
                key={`${trip.id}-${activeThemeName}-${selected?.id ?? 'none'}-${hoveredId ?? 'none'}`}
                position={[
                  trip.destination.coordinates.lat,
                  trip.destination.coordinates.lng,
                ]}
                icon={getPinIcon(trip)}
                eventHandlers={{
                  click: () => {
                    setSelected((prev) => (prev?.id === trip.id ? null : trip))
                  },
                  mouseover: () => setHoveredId(trip.id),
                  mouseout:  () => setHoveredId(null),
                }}
              />
            ))}
          </MapContainer>

          {/* ── Staggered pin drop-in overlay (visual animation layer) ──
               We can't animate Leaflet Marker DOM nodes directly with Framer,
               so we use a transparent pointer-events-none overlay with
               absolutely positioned dots that fade+fall in, then disappear.
               The real pins are already rendered above via Leaflet. */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 400,
              overflow: 'hidden',
            }}
            aria-hidden="true"
          >
            {visibleTrips.map((trip, i) => (
              <motion.div
                key={`anim-${trip.id}-${continentFilter}`}
                initial={{ opacity: 0, scaleY: 0, y: -20 }}
                animate={{ opacity: [0, 1, 1, 0], scaleY: 1, y: 0 }}
                transition={{
                  delay: pinDelay(i),
                  duration: 0.5,
                  times: [0, 0.3, 0.7, 1],
                }}
                style={{
                  position: 'absolute',
                  // Centered — purely decorative flash; real pin is from Leaflet
                  top: '50%',
                  left: '50%',
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  backgroundColor: theme.accentHex,
                  transformOrigin: 'bottom center',
                }}
              />
            ))}
          </div>

          {/* ── Stats Overlay (top-left, hidden on mobile) ── */}
          <StatsOverlay
            trips={allMappable}
            isErik={isErik}
            accentHex={theme.accentHex}
            textHex={theme.textHex}
            textMutedHex={theme.textMutedHex}
          />

          {/* ── Zoom controls (custom, themed) ── */}
          <div style={{
            position: 'absolute',
            bottom: '1.5rem',
            right: '1rem',
            zIndex: 500,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.3rem',
          }}>
            <ZoomButton
              label="+"
              accentHex={theme.accentHex}
              isErik={isErik}
              bgHex={theme.surfaceHex}
              textHex={theme.textHex}
              onClick={() => zoomInRef.current?.()}
            />
            <ZoomButton
              label="&#8722;"
              accentHex={theme.accentHex}
              isErik={isErik}
              bgHex={theme.surfaceHex}
              textHex={theme.textHex}
              onClick={() => zoomOutRef.current?.()}
            />
          </div>

          {/* ── Trip Popup (side panel / bottom sheet) ── */}
          <TripPopup
            trip={selected}
            theme={theme}
            onClose={() => setSelected(null)}
          />

          {/* ── Dim backdrop when popup open on desktop ── */}
          <AnimatePresence>
            {selected && (
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelected(null)}
                className="map-popup-desktop"
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 999,
                  backgroundColor: 'rgba(0,0,0,0)',
                  pointerEvents: 'none', // click passthrough — popup handles its own close
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )
}

// ─── ZoomButton ───────────────────────────────────────────────────────────────
/**
 * Themed zoom button. onClick is wired to zoomInRef/zoomOutRef
 * which are registered by MapZoomController (inside MapContainer via useMap).
 */
function ZoomButton({
  label, accentHex, isErik, bgHex, textHex, onClick,
}: {
  label: string
  accentHex: string
  isErik: boolean
  bgHex: string
  textHex: string
  onClick: () => void
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      aria-label={label === '+' ? 'Zoom in' : 'Zoom out'}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: `1px solid ${accentHex}33`,
        backgroundColor: isErik
          ? 'rgba(10,22,40,0.82)'
          : 'rgba(255,240,244,0.88)',
        color: textHex,
        fontSize: '1.15rem',
        fontWeight: 400,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      {label}
    </motion.button>
  )
}
