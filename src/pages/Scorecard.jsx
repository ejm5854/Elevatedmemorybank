import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trophy, Share2, ChevronLeft, ChevronRight, Loader, Maximize2, X } from 'lucide-react'
import { supabase } from '../supabase.js'
import { courses } from '../courses.js'

/* ─── Score helpers ─────────────────────────── */
function getScoreStyle(score, par) {
  const d = score - par
  if (d <= -2) return 'score-eagle'
  if (d === -1) return 'score-birdie'
  if (d === 0)  return 'score-par'
  if (d === 1)  return 'score-bogey'
  return 'score-double'
}
function getScoreLabel(score, par) {
  const d = score - par
  if (d <= -2) return 'Eagle'
  if (d === -1) return 'Birdie'
  if (d === 0)  return 'Par'
  if (d === 1)  return 'Bogey'
  if (d === 2)  return 'Double'
  return `+${d}`
}

/* ─── Deterministic seeded random ──────────────
   Same hole always produces the same layout.    */
function seededRand(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

/* ─── Hole Map SVG ──────────────────────────── */
/*  Renders a top-down cartoon course map.
    - Par 3: straight tight corridor, no fairway bunkers
    - Par 4: one dogleg (left or right), 1–2 bunkers
    - Par 5: gentle S-curve, wider, water optional        */
function HoleMapSVG({ holeNum, par, yards, mini = false }) {
  const W = 400, H = mini ? 400 : 560
  const rand = seededRand(holeNum * 2654435761)

  const doglegDir   = rand() > 0.5 ? 1 : -1   // 1=right, -1=left
  const doglegAmt   = par === 3 ? 0 : (par === 5 ? 30 : 50) * doglegDir * (0.5 + rand() * 0.5)
  const fwWidth     = par === 3 ? 38 : par === 5 ? 68 : 52
  const roughExtra  = 28
  const greenRx     = par === 3 ? 30 : 22
  const greenRy     = par === 3 ? 22 : 16

  // Key points (tee bottom-center, green top-center-ish)
  const teeX  = W / 2
  const teeY  = H - 44
  const greenX = W / 2 + doglegAmt
  const greenY = 52

  // Control points for cubic bezier fairway path
  const cp1x = teeX + doglegAmt * 0.15
  const cp1y = teeY - (H - 96) * 0.45
  const cp2x = greenX - doglegAmt * 0.15
  const cp2y = greenY + (H - 96) * 0.35

  // Build fairway outline as two bezier paths offset perpendicular
  function bezierPoint(t, p0, p1, p2, p3) {
    const mt = 1 - t
    return {
      x: mt*mt*mt*p0.x + 3*mt*mt*t*p1.x + 3*mt*t*t*p2.x + t*t*t*p3.x,
      y: mt*mt*mt*p0.y + 3*mt*mt*t*p1.y + 3*mt*t*t*p2.y + t*t*t*p3.y,
    }
  }
  function bezierTangent(t, p0, p1, p2, p3) {
    const mt = 1 - t
    return {
      x: 3*(mt*mt*(p1.x-p0.x) + 2*mt*t*(p2.x-p1.x) + t*t*(p3.x-p2.x)),
      y: 3*(mt*mt*(p1.y-p0.y) + 2*mt*t*(p2.y-p1.y) + t*t*(p3.y-p2.y)),
    }
  }

  const P0 = { x: teeX,  y: teeY  }
  const P1 = { x: cp1x,  y: cp1y  }
  const P2 = { x: cp2x,  y: cp2y  }
  const P3 = { x: greenX, y: greenY }

  function offsetPath(halfW) {
    const steps = 24
    const left = [], right = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const pt  = bezierPoint(t, P0, P1, P2, P3)
      const tan = bezierTangent(t, P0, P1, P2, P3)
      const len = Math.sqrt(tan.x*tan.x + tan.y*tan.y) || 1
      const nx = -tan.y / len
      const ny =  tan.x / len
      left.push( `${(pt.x + nx * halfW).toFixed(1)},${(pt.y + ny * halfW).toFixed(1)}`)
      right.push(`${(pt.x - nx * halfW).toFixed(1)},${(pt.y - ny * halfW).toFixed(1)}`)
    }
    return left.join(' ') + ' ' + right.reverse().join(' ')
  }

  const roughPts   = par === 3 ? '' : offsetPath(fwWidth / 2 + roughExtra)
  const fairwayPts = par === 3 ? '' : offsetPath(fwWidth / 2)

  // Par-3 corridor
  const p3CorridorPts = par === 3 ? offsetPath(fwWidth / 2) : ''
  const p3RoughPts    = par === 3 ? offsetPath(fwWidth / 2 + roughExtra) : ''

  // Bunkers (2–3 near green, 1 in fairway for par 4/5)
  const bunkersGreen = [
    { cx: greenX + greenRx * 0.95 + 4, cy: greenY + greenRy + 10, rx: 11 + rand()*5, ry: 7 + rand()*3 },
    { cx: greenX - greenRx * 0.90 - 3, cy: greenY + greenRy + 8,  rx:  9 + rand()*4, ry: 6 + rand()*3 },
  ]
  const fairwayBunker = {
    cx: bezierPoint(0.55, P0, P1, P2, P3).x + (fwWidth * 0.6 * (rand() > 0.5 ? 1 : -1)),
    cy: bezierPoint(0.55, P0, P1, P2, P3).y,
    rx: 10 + rand() * 5,
    ry: 6  + rand() * 3,
  }

  // Water hazard (par 5 only, or random ~25%)
  const hasWater = par === 5 || (par === 4 && rand() > 0.72)
  const waterT   = 0.40 + rand() * 0.20
  const waterPt  = bezierPoint(waterT, P0, P1, P2, P3)
  const waterW   = 28 + rand() * 22
  const waterH   = 12 + rand() * 8

  // Fairway mow stripes (decorative alternating slightly lighter strips)
  const stripeCount = 6

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ display:'block', width:'100%', height:'100%' }}>
      <defs>
        <radialGradient id={`bg${holeNum}`} cx="50%" cy="50%" r="70%">
          <stop offset="0%"   stopColor="#1a3a27" />
          <stop offset="100%" stopColor="#0a1a10" />
        </radialGradient>
        <linearGradient id={`fw${holeNum}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#276843" />
          <stop offset="100%" stopColor="#1e4d35" />
        </linearGradient>
        <linearGradient id={`rough${holeNum}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#1a3a27" />
          <stop offset="100%" stopColor="#132d1e" />
        </linearGradient>
        <filter id={`blur${holeNum}`}>
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      {/* Background */}
      <rect width={W} height={H} fill={`url(#bg${holeNum})`} />

      {/* Rough */}
      {par === 3
        ? <polygon points={p3RoughPts}   fill={`url(#rough${holeNum})`} />
        : <polygon points={roughPts}     fill={`url(#rough${holeNum})`} />
      }

      {/* Fairway */}
      {par === 3
        ? <polygon points={p3CorridorPts} fill={`url(#fw${holeNum})`} />
        : <polygon points={fairwayPts}    fill={`url(#fw${holeNum})`} />
      }

      {/* Mow stripes — subtle darker/lighter bands along fairway */}
      {Array.from({ length: stripeCount }, (_, i) => {
        const t0 = i / stripeCount
        const t1 = (i + 0.5) / stripeCount
        const a  = bezierPoint(t0, P0, P1, P2, P3)
        const b  = bezierPoint(t1, P0, P1, P2, P3)
        const hw = (par === 3 ? fwWidth : fwWidth) / 2 - 2
        return (
          <line
            key={i}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={hw * 2}
          />
        )
      })}

      {/* Water hazard */}
      {hasWater && (
        <ellipse
          cx={waterPt.x} cy={waterPt.y}
          rx={waterW} ry={waterH}
          fill="rgba(37,99,235,0.55)"
          stroke="rgba(147,197,253,0.35)"
          strokeWidth="1.5"
        />
      )}

      {/* Fairway bunker (par 4/5 only) */}
      {par !== 3 && (
        <ellipse
          cx={fairwayBunker.cx} cy={fairwayBunker.cy}
          rx={fairwayBunker.rx} ry={fairwayBunker.ry}
          fill="#d4b896" opacity="0.75"
          stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"
        />
      )}

      {/* Green bunkers */}
      {bunkersGreen.map((b, i) => (
        <ellipse key={i} cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry}
          fill="#d4b896" opacity="0.80"
          stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"
        />
      ))}

      {/* Green */}
      <ellipse cx={greenX} cy={greenY} rx={greenRx + 6} ry={greenRy + 5}
        fill="#2d7a4f" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <ellipse cx={greenX} cy={greenY} rx={greenRx} ry={greenRy}
        fill="#3da068" />
      {/* Green fringe highlight */}
      <ellipse cx={greenX - 3} cy={greenY - 3} rx={greenRx * 0.5} ry={greenRy * 0.4}
        fill="rgba(255,255,255,0.06)" />

      {/* Flagstick */}
      <line
        x1={greenX + 2} y1={greenY - greenRy - 22}
        x2={greenX + 2} y2={greenY}
        stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round"
      />
      <polygon
        points={`${greenX + 3},${greenY - greenRy - 22} ${greenX + 15},${greenY - greenRy - 15} ${greenX + 3},${greenY - greenRy - 8}`}
        fill="#ef4444"
      />
      {/* Pin shadow */}
      <ellipse cx={greenX + 4} cy={greenY + 2} rx={5} ry={2} fill="rgba(0,0,0,0.25)" />

      {/* Tee box */}
      <rect x={teeX - 14} y={teeY - 8} width={28} height={16} rx={4}
        fill="#1e4d35" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <rect x={teeX - 7} y={teeY - 4} width={14} height={8} rx={2}
        fill="#276843" />

      {/* Shot line (dashed arrow) */}
      <path
        d={`M ${teeX} ${teeY - 8} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${greenX} ${greenY + greenRy}`}
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1.5"
        strokeDasharray="6 5"
        strokeLinecap="round"
      />

      {/* Yardage label (full map only) */}
      {!mini && yards && (
        <text x={W / 2} y={H - 12} textAnchor="middle"
          fill="rgba(255,255,255,0.28)" fontSize="11"
          fontFamily="Inter,sans-serif" fontWeight="500">
          {yards} yds
        </text>
      )}

      {/* Compass rose (mini map) */}
      {mini && (
        <g transform={`translate(${W - 22}, 18)`}>
          <circle r="10" fill="rgba(0,0,0,0.4)" />
          <text textAnchor="middle" y="4" fill="white" fontSize="9" fontWeight="700">N</text>
        </g>
      )}
    </svg>
  )
}

/* ─── Main Scorecard component ──────────────── */
export default function Scorecard() {
  const { id }    = useParams()
  const navigate  = useNavigate()

  const [round,   setRound]   = useState(null)
  const [players, setPlayers] = useState([])
  const [pars,    setPars]    = useState([])
  const [scores,  setScores]  = useState({})
  const [hole,    setHole]    = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [fullMap, setFullMap] = useState(false)   // CoD full-map overlay

  const stripRef = useRef(null)

  /* Load round data */
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [{ data: roundData }, { data: playersData }, { data: parsData }, { data: scoresData }] =
          await Promise.all([
            supabase.from('rounds').select('*').eq('id', id).single(),
            supabase.from('players').select('*').eq('round_id', id).order('display_order'),
            supabase.from('pars').select('*').eq('round_id', id).order('hole'),
            supabase.from('scores').select('*').eq('round_id', id),
          ])
        setRound(roundData)
        setPlayers(playersData || [])
        setPars(parsData || [])
        const map = {}
        for (const s of (scoresData || [])) map[`${s.player_id}_${s.hole}`] = s.strokes
        setScores(map)
      } catch {
        setError('Could not load round.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  /* Realtime score updates */
  useEffect(() => {
    const ch = supabase
      .channel(`scores:${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scores', filter: `round_id=eq.${id}` }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const s = payload.new
          setScores(prev => ({ ...prev, [`${s.player_id}_${s.hole}`]: s.strokes }))
        }
      })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [id])

  /* Scroll mini-map strip to active thumb */
  useEffect(() => {
    if (!stripRef.current) return
    const active = stripRef.current.querySelector('.hole-mini-thumb.active')
    if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [hole])

  const holeCount = round?.hole_count || 18
  const dbPar     = pars[hole - 1]?.par || 4

  // Try to pull real hole data from courses.js
  const courseData = courses.find(c =>
    c.name.toLowerCase() === round?.course_name?.toLowerCase()
  )
  const holeData = courseData?.holes_data?.[hole - 1]
  const activePar   = holeData?.par   || dbPar
  const activeYards = holeData?.blue  || holeData?.white || holeData?.black || null
  const activeHdcp  = holeData?.hdcp  || null

  const getScore       = (pid, h) => scores[`${pid}_${h}`] || null
  const getTotalStrokes = pid => {
    let t = 0
    for (let h = 1; h <= holeCount; h++) { const s = getScore(pid, h); if (s) t += s }
    return t
  }
  const getVsPar = pid => {
    let vp = 0
    for (let h = 1; h <= holeCount; h++) {
      const s = getScore(pid, h)
      const p = pars[h - 1]?.par || 4
      if (s) vp += s - p
    }
    return vp
  }

  const saveScore = useCallback(async (playerId, strokes) => {
    setSaving(true)
    try {
      await supabase.from('scores').upsert({
        round_id: id, player_id: playerId, hole, strokes, par: activePar,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'player_id,hole' })
      setScores(prev => ({ ...prev, [`${playerId}_${hole}`]: strokes }))
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }, [id, hole, activePar])

  const shareRound = () => {
    const url = `${window.location.origin}/leaderboard/${id}`
    if (navigator.share) navigator.share({ title: `Golf Round — ${round?.course_name}`, url })
    else navigator.clipboard.writeText(url)
  }

  const holesPlayed = players.length > 0
    ? Math.max(...players.map(p => {
        let c = 0
        for (let h = 1; h <= holeCount; h++) if (getScore(p.id, h)) c++
        return c
      }))
    : 0

  const goHole = (h) => {
    setHole(Math.max(1, Math.min(holeCount, h)))
    setFullMap(false)
  }

  /* ── Loading / Error states ── */
  if (loading) return (
    <div className="round-page" style={{ alignItems:'center', justifyContent:'center', display:'flex' }}>
      <Loader size={28} style={{ color:'var(--green-300)', animation:'spin 1s linear infinite' }} />
    </div>
  )
  if (error || !round) return (
    <div className="round-page" style={{ alignItems:'center', justifyContent:'center', display:'flex', flexDirection:'column', gap:16, padding:24 }}>
      <p style={{ color:'#f87171', textAlign:'center' }}>{error || 'Round not found.'}</p>
      <button className="nr-start-btn" style={{ maxWidth:200 }} onClick={() => navigate('/')}>Go Home</button>
    </div>
  )

  /* ── Full-map CoD overlay ── */
  const FullMapOverlay = () => (
    <div style={{
      position:'fixed', inset:0, zIndex:999,
      background:'rgba(6,15,10,0.97)',
      backdropFilter:'blur(8px)',
      display:'flex', flexDirection:'column',
      animation:'fadeUp 0.2s ease',
    }}>
      {/* Header */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'14px 18px',
        borderBottom:'1px solid rgba(201,168,76,0.15)',
      }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.2rem', fontWeight:700, color:'var(--cream)' }}>
          {round.course_name}
          <span style={{ marginLeft:12, fontSize:'0.75rem', fontWeight:500, color:'var(--gold)', letterSpacing:'0.08em', textTransform:'uppercase' }}>
            Full Course Map
          </span>
        </div>
        <button onClick={() => setFullMap(false)} style={{
          width:38, height:38, borderRadius:'50%',
          background:'rgba(255,255,255,0.08)',
          border:'1px solid rgba(255,255,255,0.15)',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'rgba(255,255,255,0.8)', cursor:'pointer',
        }}><X size={18} /></button>
      </div>

      {/* 3x6 or 2x9 grid of all holes */}
      <div style={{
        flex:1, overflow:'auto',
        display:'grid',
        gridTemplateColumns: holeCount === 9 ? 'repeat(3,1fr)' : 'repeat(6,1fr)',
        gap:3,
        padding:3,
      }}>
        {Array.from({ length: holeCount }, (_, i) => i + 1).map(h => {
          const hd    = courseData?.holes_data?.[h - 1]
          const hPar  = hd?.par || (pars[h - 1]?.par || 4)
          const hYds  = hd?.blue || hd?.white || null
          const anyScore = players.some(p => getScore(p.id, h))
          return (
            <div key={h}
              onClick={() => goHole(h)}
              style={{
                position:'relative', cursor:'pointer',
                border: h === hole
                  ? '2px solid var(--gold)'
                  : anyScore
                  ? '2px solid rgba(52,211,153,0.45)'
                  : '2px solid transparent',
                borderRadius:8,
                overflow:'hidden',
                aspectRatio:'3/4',
                background:'var(--green-800)',
                transition:'border-color 0.15s',
              }}
            >
              <HoleMapSVG holeNum={h} par={hPar} yards={hYds} mini={true} />
              {/* Hole label */}
              <div style={{
                position:'absolute', bottom:0, left:0, right:0,
                background:'linear-gradient(0deg,rgba(6,15,10,0.90) 0%,transparent 100%)',
                padding:'10px 6px 5px',
                display:'flex', justifyContent:'space-between', alignItems:'flex-end',
              }}>
                <span style={{ fontSize:'0.62rem', fontWeight:800, color: h === hole ? 'var(--gold)' : 'white' }}>
                  {h}
                </span>
                <span style={{ fontSize:'0.58rem', color:'rgba(255,255,255,0.45)', fontWeight:600 }}>
                  P{hPar}
                </span>
              </div>
              {anyScore && (
                <div style={{
                  position:'absolute', top:4, right:4,
                  width:8, height:8, borderRadius:'50%',
                  background:'var(--par)',
                  boxShadow:'0 0 6px rgba(52,211,153,0.6)',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding:'12px 18px',
        borderTop:'1px solid rgba(255,255,255,0.06)',
        textAlign:'center',
        fontSize:'0.72rem', color:'rgba(255,255,255,0.30)',
        letterSpacing:'0.04em',
      }}>
        TAP ANY HOLE TO NAVIGATE
      </div>
    </div>
  )

  /* ── Main render ── */
  return (
    <div className="round-page">
      {fullMap && <FullMapOverlay />}

      {/* Header */}
      <div className="round-header">
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button className="round-back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={17} />
          </button>
          <div>
            <div className="round-header-title">{round.course_name}</div>
            {round.join_code && (
              <div className="round-header-sub">
                Code: <span style={{ fontFamily:'monospace', color:'rgba(255,255,255,0.45)' }}>{round.join_code}</span>
              </div>
            )}
          </div>
        </div>
        <div className="round-header-actions">
          {saving && <Loader size={15} style={{ color:'var(--green-300)', animation:'spin 1s linear infinite' }} />}
          <button className="round-icon-btn" title="Full course map" onClick={() => setFullMap(true)}>
            <Maximize2 size={16} />
          </button>
          <button className="round-icon-btn" onClick={shareRound}><Share2 size={16} /></button>
          <button className="round-icon-btn" onClick={() => navigate(`/leaderboard/${id}`)}><Trophy size={16} /></button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="round-progress">
        <div className="round-progress-labels">
          <span>Round Progress</span>
          <span>{holesPlayed} / {holeCount} holes</span>
        </div>
        <div className="round-progress-track">
          <div className="round-progress-fill" style={{ width:`${(holesPlayed / holeCount) * 100}%` }} />
        </div>
      </div>

      {/* ── CoD Hole Map ── */}
      <div className="hole-map-section">
        <div className="hole-map-full">
          <div className="hole-map-svg-wrap">
            <HoleMapSVG holeNum={hole} par={activePar} yards={activeYards} mini={false} />
          </div>

          {/* Top overlay: hole # + par badge */}
          <div className="hole-map-overlay-top">
            <span className="hole-map-hole-badge">Hole {hole}</span>
            <span className="hole-map-par-badge">Par {activePar}</span>
          </div>

          {/* Bottom overlay: yardage + hdcp */}
          <div className="hole-map-overlay-bottom">
            <div>
              {activeYards
                ? <>
                    <div className="hole-map-yardage">{activeYards}</div>
                    <div className="hole-map-yardage-label">Yards</div>
                  </>
                : <div className="hole-map-yardage-label" style={{ color:'rgba(255,255,255,0.30)' }}>No yardage data</div>
              }
            </div>
            {activeHdcp && (
              <div className="hole-map-hdcp">
                Handicap
                <strong>{activeHdcp}</strong>
              </div>
            )}
          </div>

          {/* Nav arrows overlaid on map */}
          <button className="hole-map-nav-left"
            disabled={hole === 1}
            onClick={() => goHole(hole - 1)}>
            <ChevronLeft size={20} />
          </button>
          <button className="hole-map-nav-right"
            disabled={hole === holeCount}
            onClick={() => goHole(hole + 1)}>
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Mini-map strip (CoD-style thumbnail row) */}
        <div className="hole-minimap-strip" ref={stripRef}>
          {Array.from({ length: holeCount }, (_, i) => i + 1).map(h => {
            const hd   = courseData?.holes_data?.[h - 1]
            const hPar = hd?.par || (pars[h - 1]?.par || 4)
            return (
              <div
                key={h}
                className={`hole-mini-thumb ${h === hole ? 'active' : ''}`}
                onClick={() => goHole(h)}
              >
                <HoleMapSVG holeNum={h} par={hPar} yards={null} mini={true} />
                <span className="hole-mini-num">{h}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Player score cards */}
      <div className="round-cards">
        {players.map(player => {
          const score  = getScore(player.id, hole)
          const vp     = getVsPar(player.id)
          const total  = getTotalStrokes(player.id)
          const initials = player.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

          return (
            <div key={player.id} className="round-player-card">
              <div className="round-player-top">
                <div style={{ display:'flex', alignItems:'center', flex:1 }}>
                  <div className="round-player-avatar">{initials}</div>
                  <div className="round-player-info">
                    <div className="round-player-name">{player.name}</div>
                    <div className="round-player-total">
                      {total > 0 ? `${total} strokes` : 'No scores yet'}
                      {' · '}
                      <span style={{ color: vp < 0 ? 'var(--birdie)' : vp === 0 ? 'var(--par)' : 'var(--bogey)' }}>
                        {vp === 0 ? 'E' : vp > 0 ? `+${vp}` : vp}
                      </span>
                    </div>
                  </div>
                </div>
                {score && (
                  <div className={`score-badge ${getScoreStyle(score, activePar)}`}>
                    <span className="score-badge-num">{score}</span>
                    <span className="score-badge-label">{getScoreLabel(score, activePar)}</span>
                  </div>
                )}
              </div>

              {/* Score picker */}
              <div className="score-picker">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    className={`score-pick-btn ${score === n ? 'selected' : ''}`}
                    onClick={() => saveScore(player.id, n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}