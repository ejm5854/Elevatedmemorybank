import { useNavigate } from 'react-router-dom'
import { Flag, Trophy, Users, ChevronRight, Star } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-green-900 flex flex-col">
      <div className="relative overflow-hidden">
        <div className="relative px-6 pt-16 pb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
              <Flag className="w-5 h-5 text-green-950" />
            </div>
            <span className="text-xl font-bold tracking-wide text-white">Elevated Golfing</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-3">
            Score Together,<br />
            <span className="text-yellow-400">Win Together.</span>
          </h1>
          <p className="text-green-300 text-base leading-relaxed max-w-xs mx-auto">
            Real-time scorecards and live leaderboards for your crew. No downloads, just share a link.
          </p>
          <div className="mt-8 flex flex-col gap-3 max-w-xs mx-auto">
            <button onClick={() => navigate('/new-round')} className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2">
              <Flag className="w-5 h-5" /> Start New Round
            </button>
          </div>
        </div>
      </div>
      <div className="mx-4 card flex justify-around py-4 mb-4">
        {[{value:'18',label:'Holes'},{value:'4+',label:'Players'},{value:'Live',label:'Updates'}].map(s => (
          <div key={s.label} className="text-center">
            <div className="text-2xl font-extrabold text-yellow-400">{s.value}</div>
            <div className="text-xs text-green-400 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="px-4 flex flex-col gap-3 mb-6">
        {[
          {icon:<Users className="w-5 h-5 text-yellow-400" />,title:'Invite Your Crew',desc:'Share a link. No account needed for guests to view the live leaderboard.'},
          {icon:<Trophy className="w-5 h-5 text-yellow-400" />,title:'Live Leaderboard',desc:'Scores update instantly after every hole. Everyone sees standings in real time.'},
          {icon:<Star className="w-5 h-5 text-yellow-400" />,title:'Side Games Built In',desc:'Auto-calculate Skins, Nassau, and Match Play. No spreadsheet required.'},
        ].map(f => (
          <div key={f.title} className="card flex items-start gap-4">
            <div className="w-10 h-10 bg-green-700/60 rounded-xl flex items-center justify-center shrink-0">{f.icon}</div>
            <div>
              <div className="font-semibold text-white text-sm">{f.title}</div>
              <div className="text-green-300 text-xs mt-1 leading-relaxed">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-base">Recent Rounds</h2>
          <button className="text-green-400 text-xs font-medium flex items-center gap-1">See All <ChevronRight className="w-3 h-3" /></button>
        </div>
        <div className="card text-center py-8">
          <Flag className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-green-400 text-sm">No rounds yet.</p>
          <p className="text-green-600 text-xs mt-1">Start your first round above!</p>
        </div>
      </div>
      <div className="mt-auto px-4 pb-8 text-center">
        <p className="text-green-700 text-xs">Elevated Golfing 2025</p>
      </div>
    </div>
  )
}
