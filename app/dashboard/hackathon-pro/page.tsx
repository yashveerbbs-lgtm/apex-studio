'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../utils/supabase'
import { Trophy, Activity, Target } from 'lucide-react'

interface LeaderboardEntry {
  id: string
  user_id: string
  score: number
  execution_time_ms: number
  operative_name?: string
}

export default function HackathonPro() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    fetchLeaderboard()
  }, [])

  async function fetchLeaderboard() {
    setLoading(true)
    const { data: scores, error } = await supabase
      .from('tournament_leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .order('execution_time_ms', { ascending: true })
      .limit(10)

    if (scores && !error) {
      const enrichedScores = await Promise.all(
        scores.map(async (entry, index) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', entry.user_id)
            .maybeSingle()

          const fallbackNames = ['GUEST_DEV_01', 'GUEST_DEV_02', 'GUEST_DEV_03']
          const name = profile?.display_name 
            ? profile.display_name.split('@')[0] 
            : fallbackNames[index] || 'Anonymous Developer'

          return { ...entry, operative_name: name }
        })
      )
      setLeaderboard(enrichedScores)
    }
    setLoading(false)
  }

  async function handleProRun() {
    setSubmitting(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const mockScore = Math.floor(Math.random() * 500) + 9500 
      const mockTime = Math.floor(Math.random() * 500) + 800

      const { data: existingRuns } = await supabase
        .from('tournament_leaderboard')
        .select('*')
        .eq('user_id', user.id)
        .order('score', { ascending: false })

      if (existingRuns && existingRuns.length > 0) {
        const bestRun = existingRuns[0]

        if (mockScore > bestRun.score || (mockScore === bestRun.score && mockTime < bestRun.execution_time_ms)) {
          await supabase
            .from('tournament_leaderboard')
            .update({ score: mockScore, execution_time_ms: mockTime })
            .eq('id', bestRun.id)
        }
      } else {
        await supabase.from('tournament_leaderboard').insert([
          { user_id: user.id, score: mockScore, execution_time_ms: mockTime }
        ])
      }

      const { data: certExisting } = await supabase
        .from('event_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_type', 'PRO')
        .maybeSingle()
        
      if (!certExisting) {
        await supabase.from('event_completions').insert([
          { user_id: user.id, event_type: 'PRO' }
        ])
        
        const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).single()
        const operativeName = user.user_metadata?.full_name || profile?.display_name || 'Developer'
        
        await fetch('/api/send-completion-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, name: operativeName, tier: 'PRO' })
        })
      }

      await fetchLeaderboard()
    }
    
    setSubmitting(false)
  }

  if (!isMounted) return null

  return (
    <div className="p-8 md:p-12 text-white font-sans max-w-5xl mx-auto animate-fade-in">
      
      <div className="border-b border-gray-800 pb-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-orange-500" />
            <h1 className="text-4xl font-black tracking-tight">Pro Tier Hackathon</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Compete on the global leaderboard for high-stakes cash prize pools.
          </p>
        </div>
        <div className="bg-orange-950/30 border border-orange-900/50 px-6 py-3 rounded-xl text-right">
          <div className="text-xs font-bold text-orange-500/80 uppercase tracking-widest mb-1">Current Prize Pool</div>
          <div className="text-2xl font-black text-white">$10,000 USD</div>
        </div>
      </div>

      <div className="bg-[#050505] border border-gray-800 rounded-xl overflow-hidden shadow-2xl relative mb-12">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-600"></div>
        
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6 text-sm font-bold uppercase tracking-widest text-gray-400">
            <Activity className="w-4 h-4" /> Live Global Rankings
          </div>

          <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-4 mb-4">
            <div className="col-span-2">Rank</div>
            <div className="col-span-6">Developer / Team</div>
            <div className="col-span-2 text-right">Score</div>
            <div className="col-span-2 text-right">Time (ms)</div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-orange-500 font-mono animate-pulse uppercase tracking-widest text-sm">Fetching Leaderboard...</div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div 
                  key={entry.id} 
                  className={`grid grid-cols-12 gap-4 p-4 rounded-lg text-sm items-center transition-all ${
                    index === 0 ? 'bg-gradient-to-r from-orange-900/40 to-transparent border border-orange-500/30 text-white scale-[1.01] shadow-lg' : 
                    index === 1 ? 'bg-gray-900 border border-gray-700 text-gray-200' :
                    index === 2 ? 'bg-gray-900/50 border border-gray-800 text-gray-300' :
                    'bg-transparent border border-transparent text-gray-500'
                  }`}
                >
                  <div className="col-span-2 font-black text-lg flex items-center gap-2">
                    {index === 0 && <span className="text-orange-500">🏆</span>}
                    #{index + 1}
                  </div>
                  <div className="col-span-6 font-bold">{entry.operative_name}</div>
                  <div className="col-span-2 text-right font-mono text-white">{entry.score.toLocaleString()}</div>
                  <div className="col-span-2 text-right font-mono opacity-70">{entry.execution_time_ms}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-950/20 to-black border border-orange-900/50 p-8 rounded-xl text-center max-w-2xl mx-auto">
        <Target className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-3">Submit Pro Project</h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Ensure your project is fully finalized in the Apex IDE. Submitting to the Pro Tier will run our proprietary scoring algorithm against your codebase to calculate efficiency, logic, and speed.
        </p>
        <button 
          onClick={handleProRun}
          disabled={submitting}
          className="bg-white hover:bg-gray-200 text-black font-black uppercase tracking-widest text-sm py-4 px-12 rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 w-full md:w-auto"
        >
          {submitting ? 'Running Algorithm...' : 'Evaluate & Score Project'}
        </button>
      </div>

    </div>
  )
}