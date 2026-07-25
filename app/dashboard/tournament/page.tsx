'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../utils/supabase'

interface LeaderboardEntry {
  id: string
  user_id: string
  score: number
  execution_time_ms: number
  operative_name?: string
}

export default function TournamentArena() {
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

          const ghostNames = ['GHOST_PROTOCOL', 'VIPER_ACTUAL', 'PHANTOM_NINE']
          const name = profile?.display_name 
            ? profile.display_name.split('@')[0].toUpperCase() 
            : ghostNames[index] || 'UNKNOWN_OPERATIVE'

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

        await supabase
          .from('tournament_leaderboard')
          .delete()
          .eq('user_id', user.id)
          .neq('id', bestRun.id)

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
        const operativeName = user.user_metadata?.full_name || profile?.display_name || 'Operative'
        
        // 🔥 Dynamic Pro Tier Email Trigger
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
      <div className="mb-8">
        <Link href="/portal" className="text-gray-500 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors">
          ← Back to Central Hub
        </Link>
      </div>

      <div className="border-b border-orange-900/50 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-widest mb-2 text-orange-500 drop-shadow-[0_0_15px_rgba(234,88,12,0.4)]">
            Tournament Arena
          </h1>
          <p className="text-orange-400/70 font-mono text-sm uppercase tracking-widest">
            Pro Circuit // Live Global Rankings
          </p>
        </div>
        <div className="hidden md:block text-right">
          <div className="text-xs font-mono text-gray-500 mb-1">Prize Pool Status</div>
          <div className="text-xl font-bold text-green-400">ACTIVE</div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-orange-900/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(234,88,12,0.05)] relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 to-red-600"></div>
        
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-12 gap-4 text-xs font-mono text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-4 mb-4">
            <div className="col-span-2">Rank</div>
            <div className="col-span-6">Operative ID</div>
            <div className="col-span-2 text-right">Score</div>
            <div className="col-span-2 text-right">Time (ms)</div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-orange-500 font-mono animate-pulse">Syncing Live Data...</div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div 
                  key={entry.id} 
                  className={`grid grid-cols-12 gap-4 p-4 rounded text-sm font-mono items-center transition-all ${
                    index === 0 ? 'bg-orange-950/40 border border-orange-900/50 text-orange-400 scale-[1.01] shadow-lg' : 
                    index === 1 ? 'bg-slate-900/40 border border-slate-800 text-slate-300' :
                    index === 2 ? 'bg-amber-950/20 border border-amber-900/30 text-amber-600/80' :
                    'bg-transparent border border-transparent text-gray-500'
                  }`}
                >
                  <div className="col-span-2 font-bold flex items-center gap-2">
                    {index === 0 && <span className="text-orange-500">🏆</span>}
                    #{index + 1}
                  </div>
                  <div className="col-span-6 font-bold tracking-wider">{entry.operative_name}</div>
                  <div className="col-span-2 text-right text-white">{entry.score.toLocaleString()}</div>
                  <div className="col-span-2 text-right opacity-70">{entry.execution_time_ms}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-black border border-gray-800 p-8 rounded-xl text-center">
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Enter the Gauntlet</h2>
        <p className="text-gray-500 font-mono text-sm mb-6 max-w-lg mx-auto">
          Executing the Pro Circuit algorithm will initiate a timed 48-hour competitive reasoning window. The system tracks your absolute personal best.
        </p>
        <button 
          onClick={handleProRun}
          disabled={submitting}
          className="bg-orange-600 hover:bg-orange-500 text-white font-bold uppercase tracking-widest text-sm py-4 px-12 rounded transition-all shadow-[0_0_20px_rgba(234,88,12,0.2)] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {submitting ? 'Calculating Work-Rate Logic...' : 'Initialize Pro Run'}
        </button>
      </div>
    </div>
  )
}