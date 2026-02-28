import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, useInView, animate } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { useRecentTrips, useAllTrips } from '@/hooks/useTrips'
import { computeStats } from '@/utils/stats'
import TripCard from '@/components/TripCard'

// ─── Animation Variants ──────────────────────────────────────────────────────

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.3 } },
}

const heroContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.3 },
  },
}

const heroChild = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 28 },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

const cardStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardChild = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

// ─── Count-Up Hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, inView: boolean, duration = 1.4) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    const controls = animate(0, target, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setVal(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, target, duration])
  return val
}

// ─── Stat Counter Pill ───────────────────────────────────────────────────────

function StatPill({
  value, label, accent, muted, surface, border, delay,
}: {
  value: number; label: string; accent: string; muted: string
  surface: string; border: string; delay: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const count = useCountUp(value, inView)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      style={{
        backgroundColor: surface,
        border: `1px solid ${border}`,
        borderRadius: 16,
        padding: '1.5rem 1.25rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Accent glow */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 60, height: 2, backgroundColor: accent, borderRadius: '0 0 4px 4px',
      }} />
      <div style={{
        fontSize: 'clamp(2rem, 4vw, 2.75rem)',
        fontWeight: 700,
        color: accent,
        lineHeight: 1,
        fontFamily: 'Cormorant Garamond, Playfair Display, serif',
        letterSpacing: '-0.02em',
      }}>
        {count}
      </div>
      <div style={{
        color: muted,
        fontSize: '0.65rem',
        marginTop: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        fontWeight: 500,
      }}>
        {label}
      </div>
    </motion.div>
  )
}

// ─── Feature Card ─────────────────────────────────────────────────────────────

function FeatureCard({
  icon, title, description, accent, surface, border, text, muted, href, delay,
}: {
  icon: string; title: string; description: string
  accent: string; surface: string; border: string
  text: string; muted: string; href: string; delay: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const navigate = useNavigate()

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -6, transition: { duration: 0.22 } }}
      onClick={() => navigate(href)}
      style={{
        backgroundColor: surface,
        border: `1px solid ${border}22`,
        borderRadius: 20,
        padding: '2rem',
        cursor: 'pointer',
        transition: 'border-color 0.25s, box-shadow 0.25s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = `${accent}66`
        el.style.boxShadow = `0 12px 40px ${accent}18`
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = `${border}22`
        el.style.boxShadow = 'none'
      }}
    >
      {/* Corner accent */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 60, height: 60,
        background: `radial-gradient(circle at top right, ${accent}18, transparent 70%)`,
      }} />

      <div style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{
        fontFamily: 'Cormorant Garamond, Playfair Display, serif',
        fontSize: '1.25rem',
        fontWeight: 700,
        color: text,
        marginBottom: '0.5rem',
        letterSpacing: '0.01em',
      }}>
        {title}
      </h3>
      <p style={{
        color: muted,
        fontSize: '0.875rem',
        lineHeight: 1.6,
        marginBottom: '1.25rem',
      }}>
        {description}
      </p>
      <span style={{
        fontSize: '0.75rem',
        fontWeight: 600,
        color: accent,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        Explore →
      </span>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const { theme, themeName } = useTheme()
  const navigate = useNavigate()
  const recent   = useRecentTrips(4)
  const allTrips = useAllTrips()
  const stats    = computeStats(allTrips)

  const isErik = themeName === 'erik'
  const displayFont = isErik
    ? "'Cormorant Garamond', Georgia, serif"
    : "'Playfair Display', Georgia, serif"
  const bodyFont = isErik
    ? "'DM Sans', system-ui, sans-serif"
    : "'Nunito', system-ui, sans-serif"

  const statsRef   = useRef<HTMLElement>(null)
  const recentRef  = useRef<HTMLElement>(null)
  const featureRef = useRef<HTMLElement>(null)
  const statsInView   = useInView(statsRef,   { once: true, margin: '-80px' })
  const recentInView  = useInView(recentRef,  { once: true, margin: '-80px' })
  const featureInView = useInView(featureRef, { once: true, margin: '-80px' })

  const statItems = [
    { value: stats.totalTrips,      label: 'Adventures'  },
    { value: stats.totalCountries,  label: 'Countries'   },
    { value: stats.totalDays,       label: 'Days Abroad' },
    { value: stats.totalContinents, label: 'Continents'  },
  ]

  const features = [
    {
      icon: '📸',
      title: 'Memory Bank',
      description: 'Every photo, every story. Beautifully organized by trip.',
      href: '/memories',
    },
    {
      icon: '🗺️',
      title: 'World Map',
      description: 'See your journey painted across the globe in living colour.',
      href: '/map',
    },
    {
      icon: '✨',
      title: 'Two Themes',
      description: "Your app, your aesthetic. Erik's navy gold or Marisa's blush rose.",
      href: '/',
    },
  ]

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ backgroundColor: theme.bgHex, fontFamily: bodyFont }}
    >

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: '100dvh', minHeight: 600, overflow: 'hidden' }}>

        {/* Background photo */}
        <motion.div
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80"
            alt="Couple on a mountain road"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </motion.div>

        {/* Gradient overlays */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.15) 100%)',
        }} />
        {/* Theme colour bleed at bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
          background: `linear-gradient(to top, ${theme.bgHex}, transparent)`,
        }} />

        {/* Hero content — centered */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 1.5rem',
          textAlign: 'center',
        }}>
          <motion.div
            variants={heroContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Eyebrow */}
            <motion.p
              variants={heroChild}
              style={{
                color: theme.accentHex,
                fontSize: '0.7rem',
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                marginBottom: '1.25rem',
                fontWeight: 600,
              }}
            >
              Erik &amp; Marisa
            </motion.p>

            {/* Wordmark */}
            <motion.h1
              variants={heroChild}
              style={{
                fontFamily: displayFont,
                fontSize: 'clamp(4rem, 14vw, 9rem)',
                fontWeight: isErik ? 400 : 700,
                fontStyle: isErik ? 'italic' : 'normal',
                color: '#ffffff',
                lineHeight: 0.9,
                letterSpacing: isErik ? '0.04em' : '-0.01em',
                marginBottom: '1.5rem',
                textShadow: '0 4px 40px rgba(0,0,0,0.4)',
              }}
            >
              Elevated
            </motion.h1>

            {/* Tagline */}
            <motion.p
              variants={heroChild}
              style={{
                color: 'rgba(255,255,255,0.82)',
                fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)',
                letterSpacing: '0.06em',
                marginBottom: '2.5rem',
                fontStyle: 'italic',
                maxWidth: 480,
                lineHeight: 1.5,
              }}
            >
              Every trip. Every memory. Together.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={heroChild}
              style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/memories')}
                style={{
                  backgroundColor: theme.accentHex,
                  color: theme.bgHex,
                  border: 'none',
                  borderRadius: 9999,
                  padding: '0.85rem 2rem',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  fontFamily: bodyFont,
                  boxShadow: `0 8px 32px ${theme.accentHex}55`,
                }}
              >
                View Memories
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/map')}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: 9999,
                  padding: '0.85rem 2rem',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  fontFamily: bodyFont,
                  backdropFilter: 'blur(8px)',
                }}
              >
                World Map
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          style={{
            position: 'absolute', bottom: '2rem', left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 9l5 5 5-5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <motion.section
        ref={statsRef}
        variants={sectionVariants}
        initial="hidden"
        animate={statsInView ? 'visible' : 'hidden'}
        style={{
          backgroundColor: theme.surfaceHex,
          borderTop: `1px solid ${theme.accentHex}18`,
          borderBottom: `1px solid ${theme.accentHex}18`,
          padding: '3rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          {/* Section eyebrow */}
          <p style={{
            color: theme.accentHex, fontSize: '0.65rem', letterSpacing: '0.28em',
            textTransform: 'uppercase', textAlign: 'center', marginBottom: '2rem',
            fontWeight: 600,
          }}>
            Our Journey in Numbers
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
          }}>
            {statItems.map((item, i) => (
              <StatPill
                key={item.label}
                value={item.value}
                label={item.label}
                accent={theme.accentHex}
                muted={theme.textMutedHex}
                surface={theme.cardBgHex}
                border={theme.accentHex}
                delay={i * 0.1}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── RECENT TRIPS ─────────────────────────────────────────────────── */}
      {recent.length > 0 && (
        <motion.section
          ref={recentRef}
          variants={sectionVariants}
          initial="hidden"
          animate={recentInView ? 'visible' : 'hidden'}
          style={{ padding: '5rem 1.5rem' }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>

            {/* Section header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{
                color: theme.accentHex, fontSize: '0.65rem', letterSpacing: '0.28em',
                textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 600,
              }}>
                Latest Adventures
              </p>
              <h2 style={{
                fontFamily: displayFont,
                fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                fontWeight: isErik ? 400 : 700,
                fontStyle: isErik ? 'italic' : 'normal',
                color: theme.textHex,
                lineHeight: 1.1,
                marginBottom: '0.75rem',
              }}>
                Our Journey
              </h2>
              <p style={{ color: theme.textMutedHex, fontSize: '0.95rem', fontStyle: 'italic' }}>
                The places that made us
              </p>
            </div>

            {/* Horizontal scroll row */}
            <motion.div
              variants={cardStagger}
              initial="hidden"
              animate={recentInView ? 'visible' : 'hidden'}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {recent.map((trip) => (
                <motion.div key={trip.id} variants={cardChild}>
                  <TripCard trip={trip} />
                </motion.div>
              ))}
            </motion.div>

            {/* View all link */}
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }} style={{ display: 'inline-block' }}>
                <Link
                  to="/memories"
                  style={{
                    color: theme.accentHex,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    borderBottom: `1px solid ${theme.accentHex}44`,
                    paddingBottom: '0.125rem',
                  }}
                >
                  View All Memories
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.section>
      )}

      {/* ── FEATURE HIGHLIGHTS ───────────────────────────────────────────── */}
      <motion.section
        ref={featureRef}
        variants={sectionVariants}
        initial="hidden"
        animate={featureInView ? 'visible' : 'hidden'}
        style={{
          backgroundColor: theme.surfaceHex,
          borderTop: `1px solid ${theme.accentHex}18`,
          padding: '5rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{
              color: theme.accentHex, fontSize: '0.65rem', letterSpacing: '0.28em',
              textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 600,
            }}>
              Everything you need
            </p>
            <h2 style={{
              fontFamily: displayFont,
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: isErik ? 400 : 700,
              fontStyle: isErik ? 'italic' : 'normal',
              color: theme.textHex,
              lineHeight: 1.15,
            }}>
              Built for the two of you
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}>
            {features.map((f, i) => (
              <FeatureCard
                key={f.title}
                icon={f.icon}
                title={f.title}
                description={f.description}
                href={f.href}
                accent={theme.accentHex}
                surface={theme.cardBgHex}
                border={theme.accentHex}
                text={theme.textHex}
                muted={theme.textMutedHex}
                delay={i * 0.12}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{
        padding: '3rem 1.5rem',
        textAlign: 'center',
        borderTop: `1px solid ${theme.accentHex}18`,
      }}>
        {/* Decorative line */}
        <div style={{
          width: 48, height: 1, backgroundColor: theme.accentHex,
          margin: '0 auto 1.5rem', opacity: 0.6,
        }} />
        <p style={{
          fontFamily: displayFont,
          fontSize: '1.05rem',
          fontStyle: 'italic',
          color: theme.accentHex,
          marginBottom: '0.5rem',
          letterSpacing: '0.02em',
        }}>
          Made with love, for Erik &amp; Marisa
        </p>
        <p style={{ color: theme.textMutedHex, fontSize: '0.72rem', letterSpacing: '0.12em' }}>
          © {new Date().getFullYear()} Elevated · Every trip. Every memory. Together.
        </p>
      </footer>

    </motion.main>
  )
}