import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { useFilteredTrips } from '@/hooks/useTrips'
import { useAppStore } from '@/store/useAppStore'
import { allTags } from '@/utils/stats'
import { useAllTrips } from '@/hooks/useTrips'
import TripGrid from '@/components/TripGrid'
import TripListItem from '@/components/TripListItem'
import ViewToggle from '@/components/ViewToggle'
import TagBadge from '@/components/TagBadge'
import type { FilterState, SortField } from '@/types'

const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.42, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.25 } },
}

const DEFAULT_FILTER: FilterState = {
  search:    '',
  tags:      [],
  sortField: 'startDate',
  sortOrder: 'desc',
}

export default function MemoryBank() {
  const { theme, themeName } = useTheme()
  const navigate    = useNavigate()
  const viewMode    = useAppStore((s) => s.viewMode)
  const setViewMode = useAppStore((s) => s.setViewMode)
  const allTrips    = useAllTrips()
  const tagOptions  = allTags(allTrips)
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER)
  const filtered = useFilteredTrips(filter)

  const isErik = themeName === 'erik'
  const displayFont = isErik
    ? "'Cormorant Garamond', Georgia, serif"
    : "'Playfair Display', Georgia, serif"
  const bodyFont = isErik
    ? "'DM Sans', system-ui, sans-serif"
    : "'Nunito', system-ui, sans-serif"

  const inputStyle = {
    backgroundColor: theme.surfaceHex,
    color: theme.textHex,
    border: `1px solid ${theme.accentHex}30`,
    borderRadius: 10,
    padding: '0.6rem 0.9rem',
    fontSize: '0.875rem',
    outline: 'none',
    fontFamily: bodyFont,
    transition: 'border-color 0.2s',
  } as React.CSSProperties

  function toggleTag(tag: string) {
    setFilter((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }))
  }

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ backgroundColor: theme.bgHex, minHeight: '100dvh', paddingTop: 64, fontFamily: bodyFont }}
    >
      {/* ── Page header banner ───────────────────────── */}
      <div style={{
        backgroundColor: theme.surfaceHex,
        borderBottom: `1px solid ${theme.accentHex}18`,
        padding: '2.5rem 1.5rem 2rem',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{
                color: theme.accentHex,
                fontSize: '0.65rem',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
                fontWeight: 600,
              }}>
                All Destinations
              </p>
              <h1 style={{
                fontFamily: displayFont,
                fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
                fontWeight: isErik ? 400 : 700,
                fontStyle: isErik ? 'italic' : 'normal',
                color: theme.textHex,
                lineHeight: 1.1,
              }}>
                Memory Bank
              </h1>
              <p style={{
                color: theme.textMutedHex,
                fontSize: '0.875rem',
                marginTop: '0.4rem',
                fontStyle: 'italic',
              }}>
                {allTrips.length} {allTrips.length === 1 ? 'adventure' : 'adventures'} captured
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/memories/new')}
              style={{
                backgroundColor: theme.accentHex,
                color: theme.bgHex,
                border: 'none',
                borderRadius: 9999,
                padding: '0.7rem 1.5rem',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                letterSpacing: '0.04em',
                fontFamily: bodyFont,
                boxShadow: `0 4px 18px ${theme.accentHex}38`,
                whiteSpace: 'nowrap',
              }}
            >
              + Add Trip
            </motion.button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* ── Filter row ───────────────────────────────── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
          {/* Search */}
          <input
            type="search"
            placeholder="Search trips, destinations…"
            value={filter.search}
            onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
            style={{ ...inputStyle, flex: 1, minWidth: 200 }}
            onFocus={(e) => (e.currentTarget.style.borderColor = theme.accentHex)}
            onBlur={(e) => (e.currentTarget.style.borderColor = `${theme.accentHex}30`)}
          />

          {/* Sort */}
          <select
            value={`${filter.sortField}-${filter.sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-') as [SortField, 'asc' | 'desc']
              setFilter((f) => ({ ...f, sortField: field, sortOrder: order }))
            }}
            style={inputStyle}
          >
            <option value="startDate-desc">Newest first</option>
            <option value="startDate-asc">Oldest first</option>
            <option value="rating-desc">Highest rated</option>
            <option value="title-asc">A → Z</option>
          </select>

          <ViewToggle value={viewMode} onChange={setViewMode} />
        </div>

        {/* ── Tag filter strip ─────────────────────────── */}
        {tagOptions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.75rem', alignItems: 'center' }}>
            {tagOptions.map((tag) => (
              <TagBadge
                key={tag}
                tag={tag}
                active={filter.tags.includes(tag)}
                onClick={() => toggleTag(tag)}
                size="sm"
              />
            ))}
            {filter.tags.length > 0 && (
              <motion.button
                whileHover={{ opacity: 1 }}
                onClick={() => setFilter((f) => ({ ...f, tags: [] }))}
                style={{
                  color: theme.textMutedHex,
                  background: 'none',
                  border: 'none',
                  fontSize: '0.73rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  opacity: 0.75,
                  fontFamily: bodyFont,
                }}
              >
                Clear filters
              </motion.button>
            )}
          </div>
        )}

        {/* ── Result count ─────────────────────────────── */}
        <p style={{
          color: theme.textMutedHex,
          fontSize: '0.75rem',
          marginBottom: '1.5rem',
          letterSpacing: '0.04em',
        }}>
          {filtered.length} {filtered.length === 1 ? 'trip' : 'trips'}
          {filter.search || filter.tags.length > 0 ? ' matching your filters' : ''}
        </p>

        {/* ── Trip grid / list ─────────────────────────── */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '5rem 1rem' }}
            >
              <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>🗺️</div>
              <p style={{
                fontFamily: displayFont,
                fontSize: '1.4rem',
                fontWeight: isErik ? 400 : 600,
                fontStyle: 'italic',
                color: theme.textHex,
                marginBottom: '0.5rem',
              }}>
                No trips found
              </p>
              <p style={{ color: theme.textMutedHex, fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Try adjusting your search or filters
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFilter(DEFAULT_FILTER)}
                style={{
                  color: theme.accentHex,
                  background: 'none',
                  border: `1px solid ${theme.accentHex}44`,
                  borderRadius: 9999,
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontFamily: bodyFont,
                }}
              >
                Clear all filters
              </motion.button>
            </motion.div>
          ) : viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TripGrid trips={filtered} />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
            >
              <AnimatePresence>
                {filtered.map((trip) => (
                  <TripListItem key={trip.id} trip={trip} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.main>
  )
}
