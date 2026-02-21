import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Share2, Trophy, Loader } from 'lucide-react'
import { supabase } from '../supabase.js'

function vsParLabel(vp) {
  if (vp === null || vp === undefined) return '-'
  if (vp === 0) return 'E'
  return vp > 0 ? '+' + vp : '' + vp
}

function scoreCell(strokes, par) {
  if (!strokes) return { label: '-', cls: 'text-green-600' }
  const d = strokes - par
  if (d <= -2) return { label: strokes, cls: 'score-eagle' }
  if (d === -1) return { label: strokes, cls: 'score-birdie' }
  if (d === 0) return { label: strokes, cls: 'score-par' }
  if (d === 1) return { label: strokes, cls: 'score-bogey' }
  return { label: strokes, cls: 'score-double' }
}

export default function Leaderboard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [round, setRound] = useState(null)
  const [players, setPlayers] = useState([])
  const [pars, setPars] = useState([])
  const [scores, setScores] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [{ data: roundData }, { data: playersData }, { data: parsData }, { data: scoresData }] = await Promise.all([
          supabase.from('rounds').select('*').eq('id', id).single(),
          supabase.from('players').select('*').eq('round_id', id).order('display_order'),
          supabase.from('pars').select('*').eq('round_id', id).order('hole'),
          supabase.from('scores').select('*').eq('round_id', id),
        ])
        setRound(roundData)
        setPlayers(playersData || [])
        setPars(parsData || [])
        const map = {}
        for (const s of (scoresData || [])) map[s.player_id + '_' + s.hole] = s.strokes
        setScores(map)
      } catch (e) {
        setError('Could not load leaderboard.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    const channel = supabase.channel('lb:' + id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scores', filter: 'round_id=eq.' + id }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const s = payload.new
          setScores(prev => ({ ...prev, [s.player_id + '_' + s.hole]: s.strokes }))
        }
      }).subscribe()
    return () => supabase.removeChannel(channel)
  }, [id])

  const getScore = (playerId, h) => scores[playerId + '_' + h] || null
  const holeCount = round?.hole_count || 18

  const ranked = [...players].map(p => {
    let total = 0, vp = 0, played = 0
    for (let h = 1; h <= holeCount; h++) {
      const s = getScore(p.id, h); const par = pars[h-1]?.par || 4
      if (s) { total += s; vp += s - par; played++ }
    }
    return { ...p, total, vp, played, net: total - p.handicap }
  }).sort((a, b) => {
    if (a.played === 0 && b.played === 0) return 0
    if (a.played === 0) return 1
    if (b.played === 0) return -1
    return a.vp - b.vp
  })

  const shareRound = () => {
    const url = window.location.href
    if (navigator.share) navigator.share({ title: 'Leaderboard - ' + round?.course_name, url })
    else navigator.clipboard.writeText(url)
  }

  if (loading) return <div className="min-h-screen bg-green-900 flex items-center justify-center"><Loader size={32} className="animate-spin text-green-400" /></div>
  if (error || !round) return <div className="min-h-screen bg-green-900 flex flex-col items-center justify-center gap-4 px-6"><p className="text-red-400 text-center">{error || 'Round not found.'}</p><button onClick={() => navigate('/')} className="btn-primary">Go Home</button></div>

  const leader = ranked[0]

  return (
    <div className="min-h-screen bg-green-900 flex flex-col max-w-lg mx-auto">
      <div className="flex items-center justify-between px-4 pt-10 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/round/' + id)} className="p-2 rounded-xl bg-green-800/60 text-green-300"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-xl font-bold text-white">Leaderboard</h1>
            <p className="text-sm text-green-400">{round.course_name}</p>
          </div>
        </div>
        <button onClick={shareRound} className="p-2 rounded-xl bg-green-800/60 text-green-300"><Share2 size={18} /></button>
      </div>
      {leader && leader.played > 0 && (
        <div className="mx-4 mb-5 p-5 rounded-2xl bg-green-800/60 border border-yellow-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center"><Trophy size={20} className="text-green-950" /></div>
            <div>
              <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">Leading</p>
              <p className="text-xl font-black text-white">{leader.name}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-3xl font-black text-yellow-400">{vsParLabel(leader.vp)}</p>
              <p className="text-xs text-green-400">{leader.total} strokes</p>
            </div>
          </div>
          <div className="grid grid-cols-9 gap-1">
            {Array.from({ length: Math.min(9, holeCount) }, (_, i) => i+1).map(h => {
              const s = getScore(leader.id, h); const par = pars[h-1]?.par || 4
              const { label, cls } = scoreCell(s, par)
              return (
                <div key={h} className={"aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-bold bg-green-800/60 " + cls}>
                  <span className="text-green-600 text-[9px]">{h}</span>
                  <span>{label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
      <div className="px-4 space-y-3 mb-6">
        {ranked.map((p, idx) => (
          <div key={p.id} className="card flex items-center gap-3">
            <div className={"w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 " + (idx===0?'bg-yellow-500 text-green-950':idx===1?'bg-slate-400 text-slate-900':idx===2?'bg-amber-700 text-amber-100':'bg-green-800 text-green-400')}>
              {idx === 0 ? <Trophy size={14} /> : idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white truncate">{p.name}</p>
              <p className="text-xs text-green-500">{p.played} holes &middot; HCP {p.handicap} &middot; Net {p.played > 0 ? p.net : '-'}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={"text-xl font-black " + (p.vp < 0 ? 'text-red-400' : p.vp === 0 ? 'text-green-400' : 'text-white')}>{p.played > 0 ? vsParLabel(p.vp) : '-'}</p>
              <p className="text-xs text-green-500">{p.played > 0 ? p.total + ' strokes' : 'No scores'}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 pb-8">
        <h2 className="text-sm font-semibold text-green-400 mb-3">Full Scorecard</h2>
        <div className="overflow-x-auto rounded-2xl bg-green-800/40">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-green-700/50">
                <th className="text-left px-3 py-2 text-green-400 font-semibold sticky left-0 bg-green-800/80">Player</th>
                {Array.from({ length: holeCount }, (_, i) => i+1).map(h => (
                  <th key={h} className="px-1.5 py-2 text-green-500 font-semibold text-center min-w-[28px]">{h}</th>
                ))}
                <th className="px-2 py-2 text-green-400 font-semibold text-center">Tot</th>
                <th className="px-2 py-2 text-green-400 font-semibold text-center">+/-</th>
              </tr>
              <tr className="border-b border-green-700/30">
                <td className="px-3 py-1 text-green-600 sticky left-0 bg-green-800/80">Par</td>
                {pars.map((p, i) => <td key={i} className="px-1.5 py-1 text-center text-green-600">{p.par}</td>)}
                <td className="px-2 py-1 text-center text-green-600">{pars.reduce((s, p) => s + p.par, 0)}</td>
                <td />
              </tr>
            </thead>
            <tbody>
              {ranked.map(p => {
                let rowTotal = 0, rowVp = 0
                return (
                  <tr key={p.id} className="border-b border-green-700/20 last:border-0">
                    <td className="px-3 py-2 font-semibold text-white sticky left-0 bg-green-900/90 truncate max-w-[80px]">{p.name}</td>
                    {Array.from({ length: holeCount }, (_, i) => i+1).map(h => {
                      const s = getScore(p.id, h); const par = pars[h-1]?.par || 4
                      if (s) { rowTotal += s; rowVp += s - par }
                      const { label, cls } = scoreCell(s, par)
                      return <td key={h} className={"px-1.5 py-2 text-center font-bold " + cls}>{label}</td>
                    })}
                    <td className="px-2 py-2 text-center font-bold text-white">{p.played > 0 ? rowTotal : '-'}</td>
                    <td className={"px-2 py-2 text-center font-bold " + (rowVp < 0 ? 'text-red-400' : rowVp === 0 ? 'text-green-400' : 'text-white')}>{p.played > 0 ? vsParLabel(rowVp) : '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
