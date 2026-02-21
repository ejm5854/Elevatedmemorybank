import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Phone, Globe, Flag, ChevronRight } from 'lucide-react'
import { courses } from '../courses.js'

const TEE_COLORS = {
  black:  { bg: '#111827', label: 'Black' },
  blue:   { bg: '#1d4ed8', label: 'Blue' },
  white:  { bg: '#e5e7eb', label: 'White', textDark: true },
  gold:   { bg: '#c9a84c', label: 'Gold', textDark: true },
  red:    { bg: '#dc2626', label: 'Red' },
  silver: { bg: '#94a3b8', label: 'Silver' },
  green:  { bg: '#16a34a', label: 'Green' },
  sand:   { bg: '#d4b896', label: 'Sand', textDark: true },
}
function getTeeColor(name) {
  return TEE_COLORS[name?.toLowerCase()] || { bg: '#6b7280', label: name }
}

export default function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const course = courses.find(c => c.id === id)
  const [selectedTee, setSelectedTee] = useState(0)

  if (!course) {
    return (
      <div className="page">
        <div className="empty-state" style={{ paddingTop: 120 }}>
          <div className="empty-icon">⛳</div>
          <div className="empty-title">Course not found</div>
          <div className="empty-sub">This course doesn't exist in our database.</div>
          <button className="btn-primary" style={{ marginTop: 24 }} onClick={() => navigate('/courses')}>
            Browse Courses
          </button>
        </div>
      </div>
    )
  }

  const tees      = course.tees || []
  const activeTee = tees[selectedTee]
  const teeKey    = activeTee?.name?.toLowerCase()
  const holesData = course.holes_data || []
  const front9    = holesData.slice(0, 9)
  const back9     = holesData.slice(9, 18)
  const frontPar   = front9.reduce((s, h) => s + (h.par || 0), 0)
  const backPar    = back9.reduce((s, h)  => s + (h.par || 0), 0)
  const frontYards = front9.reduce((s, h) => s + (h[teeKey] || 0), 0)
  const backYards  = back9.reduce((s, h)  => s + (h[teeKey] || 0), 0)

  const mapsQuery = encodeURIComponent(course.address || `${course.name}, ${course.city}, CA`)
  const mapsEmbed = `https://maps.google.com/maps?q=${mapsQuery}&output=embed&z=15`
  const mapsLink  = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`

  return (
    <div className="detail-page">

      {/* ── Hero ── */}
      <div className="detail-hero">
        <div className="detail-hero-inner">
          <button className="back-btn" onClick={() => navigate('/courses')}>
            <ArrowLeft size={15} /> All Courses
          </button>
          <div className="detail-hero-layout">
            <div>
              <div className="detail-hero-tag">⛳ {course.type || 'Public'} · {course.region || course.city}</div>
              <h1 className="detail-title">{course.name}</h1>
              <div className="detail-location">
                <MapPin size={14} style={{ flexShrink: 0 }} />
                {course.address || `${course.city}, CA`}
              </div>
            </div>
            <div className="detail-hero-actions">
              <button
                className="detail-play-btn"
                onClick={() => navigate('/new-round', { state: { courseId: course.id } })}
              >
                <Flag size={16} /> Play This Course
              </button>
              {course.website && (
                <a href={`https://${course.website}`} target="_blank" rel="noreferrer" className="detail-outline-btn">
                  <Globe size={15} /> Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick stats ── */}
      <div className="detail-overview">
        <div className="detail-stat">
          <div className="detail-stat-val">{course.par}</div>
          <div className="detail-stat-key">Par</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-val">{course.holes}</div>
          <div className="detail-stat-key">Holes</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-val">{(tees[0]?.yards || activeTee?.yards || 0).toLocaleString() || '—'}</div>
          <div className="detail-stat-key">Max Yards</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-val">{course.established || '—'}</div>
          <div className="detail-stat-key">Est.</div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="detail-body">
        <div className="detail-grid">

          {/* ── Main column ── */}
          <div className="detail-main">

            {course.description && (
              <div className="detail-section">
                <div className="detail-section-title">About</div>
                <p style={{ fontSize: '0.92rem', color: 'var(--gray-600)', lineHeight: 1.85 }}>
                  {course.description}
                </p>
              </div>
            )}

            {/* Scorecard */}
            {holesData.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-title">Scorecard</div>

                {tees.length > 0 && (
                  <div className="tee-selector">
                    {tees.map((t, i) => {
                      const tc = getTeeColor(t.name)
                      const isActive = i === selectedTee
                      return (
                        <button
                          key={t.name}
                          className={`tee-btn ${isActive ? 'active' : ''}`}
                          style={{
                            color: isActive ? (tc.textDark ? '#1a3a27' : 'white') : tc.bg,
                            borderColor: tc.bg,
                            background: isActive ? tc.bg : 'white',
                          }}
                          onClick={() => setSelectedTee(i)}
                        >
                          {t.name}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Front 9 */}
                <div style={{ overflowX: 'auto', marginBottom: 10, borderRadius: 'var(--r)', overflow: 'hidden' }}>
                  <table className="scorecard-table">
                    <thead>
                      <tr>
                        <th>Hole</th>
                        {front9.map((_, i) => <th key={i}>{i + 1}</th>)}
                        <th>Out</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeTee && (
                        <tr>
                          <td style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 500 }}>Yds</td>
                          {front9.map((h, i) => <td key={i}>{h[teeKey] || '—'}</td>)}
                          <td>{frontYards || '—'}</td>
                        </tr>
                      )}
                      <tr>
                        <td style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 500 }}>Par</td>
                        {front9.map((h, i) => <td key={i}>{h.par}</td>)}
                        <td>{frontPar}</td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 500 }}>Hdcp</td>
                        {front9.map((h, i) => <td key={i}>{h.hdcp || '—'}</td>)}
                        <td>—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Back 9 */}
                {back9.length > 0 && (
                  <div style={{ overflowX: 'auto', borderRadius: 'var(--r)', overflow: 'hidden' }}>
                    <table className="scorecard-table">
                      <thead>
                        <tr>
                          <th>Hole</th>
                          {back9.map((_, i) => <th key={i}>{i + 10}</th>)}
                          <th>In</th>
                          <th>Tot</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeTee && (
                          <tr>
                            <td style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 500 }}>Yds</td>
                            {back9.map((h, i) => <td key={i}>{h[teeKey] || '—'}</td>)}
                            <td>{backYards || '—'}</td>
                            <td>{frontYards && backYards ? frontYards + backYards : '—'}</td>
                          </tr>
                        )}
                        <tr>
                          <td style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 500 }}>Par</td>
                          {back9.map((h, i) => <td key={i}>{h.par}</td>)}
                          <td>{backPar}</td>
                          <td>{frontPar + backPar}</td>
                        </tr>
                        <tr>
                          <td style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 500 }}>Hdcp</td>
                          {back9.map((h, i) => <td key={i}>{h.hdcp || '—'}</td>)}
                          <td>—</td>
                          <td>—</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Map */}
            <div className="detail-section">
              <div className="detail-section-title">Location</div>
              <div className="map-embed-wrap" style={{ marginBottom: 12 }}>
                <iframe
                  title={`${course.name} map`}
                  src={mapsEmbed}
                  height="300"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a href={mapsLink} target="_blank" rel="noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: '0.82rem', fontWeight: 600, color: 'var(--green-500)',
              }}>
                <MapPin size={14} /> Open in Google Maps <ChevronRight size={14} />
              </a>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="detail-sidebar">

            {tees.length > 0 && (
              <div className="detail-card">
                <div className="detail-card-header">Tee Boxes</div>
                <div className="detail-card-body">
                  <div className="detail-info-list">
                    {tees.map(t => {
                      const tc = getTeeColor(t.name)
                      return (
                        <div key={t.name} className="detail-info-row">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 12, height: 12, borderRadius: '50%',
                              background: tc.bg,
                              border: t.name?.toLowerCase() === 'white' ? '1px solid #ccc' : 'none',
                              flexShrink: 0,
                            }} />
                            <span className="detail-info-key">{t.name}</span>
                          </div>
                          <div className="detail-info-val">
                            {t.yards?.toLocaleString() || '—'} yds
                            {t.rating && (
                              <span style={{ fontWeight: 400, color: 'var(--gray-400)', marginLeft: 6, fontSize: '0.78rem' }}>
                                {t.rating}/{t.slope}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="detail-card">
              <div className="detail-card-header">Course Info</div>
              <div className="detail-card-body">
                <div className="detail-info-list">
                  {[
                    ['Access',      course.type],
                    ['Established', course.established],
                    ['Designer',    course.designer],
                    ['Par',         course.par],
                    ['Holes',       course.holes],
                    ['Region',      course.region],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="detail-info-row">
                      <span className="detail-info-key">{k}</span>
                      <span className="detail-info-val">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {(course.phone || course.website) && (
              <div className="detail-card">
                <div className="detail-card-header">Contact</div>
                <div className="detail-card-body">
                  <div className="detail-info-list">
                    {course.phone && (
                      <div className="detail-info-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Phone size={13} style={{ color: 'var(--gray-400)' }} />
                          <span className="detail-info-key">Phone</span>
                        </div>
                        <a href={`tel:${course.phone}`} className="detail-info-val" style={{ color: 'var(--green-500)' }}>
                          {course.phone}
                        </a>
                      </div>
                    )}
                    {course.website && (
                      <div className="detail-info-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Globe size={13} style={{ color: 'var(--gray-400)' }} />
                          <span className="detail-info-key">Web</span>
                        </div>
                        <a href={`https://${course.website}`} target="_blank" rel="noreferrer"
                          className="detail-info-val" style={{ color: 'var(--green-500)' }}>
                          Visit site
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              className="detail-play-btn"
              style={{ width: '100%', justifyContent: 'center', padding: 15 }}
              onClick={() => navigate('/new-round', { state: { courseId: course.id } })}
            >
              <Flag size={17} /> Start a Round Here
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}