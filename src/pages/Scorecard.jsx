import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trophy, Share2, ChevronLeft, ChevronRight, Loader } from 'lucide-react'
import { supabase } from '../supabase.js'

function getScoreStyle(score, par) {
  const diff = score - par
  if (diff <= -2) return 'score-eagle'
  if (diff === -1) return 'score-birdie'
  if (diff === 0) return 'score-par'
  if (diff === 1) return 'score-bogey'
  return 'score-double'
}

function getScoreLabel(score, par) {
  const diff = score - par
  if (diff <= -2) return 'Eagle'
  if (diff === -1) return 'Birdie'
  if (diff === 0) return 'Par'
  if (diff === 1) return 'Bogey'
  if (diff === 2) return 'Double'
  return '+' + diff
}

export default function Scorecard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [round, setRound] = useState(null)
  const [players, setPlayers] = useState([])
  const [pars, setPars] = useState([])
  const [scores, setScores] = useState({})
  const [hole, setHole] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
        const scoreMap = {}
        for (const s of (scoresData || [])) scoreMap[s.player_id + '_' + s.hole] = s.strokes
        setScores(scoreMap)
      } catch (e) {
        setError('Could not load round.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    const channel = supabase.channel('scores:' + id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scores', filter: 'round_id=eq.' + id }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const s = payload.new
          setScores(prev => ({ ...prev, [s.player_id + '_' + s.hole]: s.strokes }))
        }
      }).subscribe()
    return () => supabase.removeChannel(channel)
  }, [id])

  const par = pars[hole - 1]?.par || 4
  const holeCount = round?.hole_count || 18
  const getScore = (playerId, h) => scores[playerId + '_' + h] || null

  const getTotalStrokes = (playerId) => {
    let total = 0
    for (let h = 1; h <= holeCount; h++) { const s = getScore(playerId, h); if (s) total += s }
    return total
  }

  const getVsPar = (playerId) => {
    let vp = 0
    for (let h = 1; h <= holeCount; h++) { const s = getScore(playerId, h); const p = pars[h-1]?.par || 4; if (s) vp += s - p }
    return vp
  }

  const saveScore = useCallback(async (playerId, strokes) => {
    setSaving(true)
    try {
      await supabase.from('scores').upsert({ round_id: id, player_id: playerId, hole, strokes, par, updated_at: new Date().toISOString() }, { onConflict: 'player_id,hole' })
      setScores(prev => ({ ...prev, [playerId + '_' + hole]: strokes }))
    } catch (e) { console.error('Score save error', e) }
    finally { setSaving(false) }
  }, [id, hole, par])

  const shareRound = () => {
    const url = window.location.origin + '/leaderboard/' + id
    if (navigator.share) navigator.share({ title: 'Golf Round - ' + round?.course_name, url })
    else navigator.clipboard.writeText(url)
  }

  if (loading) return <div className="min-h-screen bg-green-900 flex items-center justify-center"><Loader size={32} className="animate-spin text-green-400" /></div>
  if (error || !round) return <div className="min-h-screen bg-green-900 flex flex-col items-center justify-center gap-4 px-6"><p className="text-red-400 text-center">{error || 'Round not found.'}</p><button onClick={() => navigate('/')} className="btn-primary">Go Home</button></div>

  const holesPlayed = players.length > 0 ? Math.max(...players.map(p => { let count = 0; for (let h = 1; h <= holeCount; h++) if (getScore(p.id, h)) count++; return count })) : 0

  return (
    <div className="min-h-screen bg-green-900 flex flex-col max-w-lg mx-auto">
      <div className="flex items-center justify-between px-4 pt-10 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-green-800/60 text-green-300"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-lg font-bold text-white">{round.course_name}</h1>
            <p className="text-xs text-green-400">Code: <span className="font-mono font-bold text-green-300">{round.join_code}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saving && <Loader size={16} className="animate-spin text-green-400" />}
          <button onClick={shareRound} className="p-2 rounded-xl bg-green-800/60 text-green-300"><Share2 size={18} /></button>
          <button onClick={() => navigate('/leaderboard/' + id)} className="p-2 rounded-xl bg-green-800/60 text-green-300"><Trophy size={18} /></button>
        </div>
      </div>
      <div className="px-4 mb-3">
        <div className="flex justify-between text-xs text-green-500 mb-1"><span>Progress</span><span>{holesPlayed}/{holeCount} holes</span></div>
        <div className="h-1.5 bg-green-800 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: (holesPlayed / holeCount * 100) + '%' }} />
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 bg-green-800/40 mx-4 rounded-2xl mb-4">
        <button onClick={() => setHole(h => Math.max(1, h-1))} disabled={hole===1} className="p-2 rounded-xl bg-green-700/60 text-green-300 disabled:opacity-30"><ChevronLeft size={20} /></button>
        <div className="text-center">
          <p className="text-2xl font-black text-white">Hole {hole}</p>
          <p className="text-sm text-green-400">Par {par}</p>
        </div>
        <button onClick={() => setHole(h => Math.min(holeCount, h+1))} disabled={hole===holeCount} className="p-2 rounded-xl bg-green-700/60 text-green-300 disabled:opacity-30"><ChevronRight size={20} /></button>
      </div>
      <div className="flex gap-1.5 px-4 mb-5 flex-wrap">
        {Array.from({ length: holeCount }, (_, i) => i+1).map(h => {
          const anyScore = players.some(p => getScore(p.id, h))
          return (
            <button key={h} onClick={() => setHole(h)} className={"w-7 h-7 rounded-lg text-xs font-bold transition-all " + (h === hole ? 'bg-green-500 text-white' : anyScore ? 'bg-green-700 text-green-300' : 'bg-green-800/60 text-green-600')}>
              {h}
            </button>
          )
        })}
      </div>
      <div className="px-4 space-y-3 pb-8">
        {players.map(player => {
          const score = getScore(player.id, hole)
          const vp = getVsPar(player.id)
          const total = getTotalStrokes(player.id)
          return (
            <div key={player.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-white">{player.name}</p>
                  <p className="text-xs text-green-500">{total > 0 ? total + ' strokes' : 'No scores yet'} &middot; {vp === 0 ? 'E' : vp > 0 ? '+' + vp : vp}</p>
                </div>
                {score && (
                  <div className={"score-badge " + getScoreStyle(score, par)}>
                    <span className="text-xl font-black">{score}</span>
                    <span className="text-xs font-semibold">{getScoreLabel(score, par)}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {Array.from({ length: 12 }, (_, i) => i+1).map(n => (
                  <button key={n} onClick={() => saveScore(player.id, n)} className={"aspect-square rounded-lg text-sm font-bold transition-all " + (score === n ? 'bg-green-500 text-white shadow-lg' : 'bg-green-800/60 text-green-300 hover:bg-green-700')}>
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
