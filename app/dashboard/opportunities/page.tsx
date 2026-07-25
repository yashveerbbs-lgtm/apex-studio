'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../utils/supabase'

interface CorporateTask {
  id: string
  title: string
  department: string
  bounty_tier: string
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
  assigned_to: string | null
}

export default function OpportunitiesBoard() {
  const [tasks, setTasks] = useState<CorporateTask[]>([])
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
    fetchTasks()
  }, [])

  async function fetchTasks() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUserId(user.id)

    const { data, error } = await supabase
      .from('corporate_tasks')
      .select('*')
      .order('status', { ascending: false }) 

    if (data && !error) {
      setTasks(data as CorporateTask[])
    }
    setLoading(false)
  }

  async function handleClaimTask(taskId: string) {
    if (!currentUserId) return
    await supabase
      .from('corporate_tasks')
      .update({ status: 'IN_PROGRESS', assigned_to: currentUserId })
      .eq('id', taskId)
    
    await fetchTasks()
  }

  async function handleCompleteTask(taskId: string) {
    if (!currentUserId) return
    
    await supabase
      .from('corporate_tasks')
      .update({ status: 'COMPLETED' })
      .eq('id', taskId)

    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: existing } = await supabase
        .from('event_completions')
        .select('*')
        .eq('user_id', currentUserId)
        .eq('event_type', 'CORP')
        .maybeSingle()
        
      if (!existing) {
        await supabase.from('event_completions').insert([
          { user_id: currentUserId, event_type: 'CORP' }
        ])
        
        const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', currentUserId).single()
        const operativeName = user.user_metadata?.full_name || profile?.display_name || 'Operative'

        // 🔥 Dynamic Corporate Tier Email Trigger
        await fetch('/api/send-completion-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, name: operativeName, tier: 'CORP' })
        })
      }
    }

    await fetchTasks()
  }

  if (!isMounted) return null

  return (
    <div className="p-8 md:p-12 text-white font-sans max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <Link href="/portal" className="text-gray-500 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors">
          ← Back to Central Hub
        </Link>
      </div>

      <div className="border-b border-blue-900/50 pb-6 mb-8">
        <h1 className="text-4xl font-black uppercase tracking-widest mb-2 text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]">
          Nexus Dynamics
        </h1>
        <p className="text-blue-400/70 font-mono text-sm uppercase tracking-widest">
          Corporate Deployments // Internship Task Board
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-blue-500 font-mono animate-pulse uppercase tracking-widest">
          Syncing Corporate Databanks...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-[#050505] border border-blue-900/30 rounded-xl p-6 min-h-[50vh]">
            <h2 className="text-sm font-mono text-blue-500 uppercase tracking-widest mb-4 border-b border-blue-900/30 pb-2">
              Available Bounties
            </h2>
            <div className="space-y-4">
              {tasks.filter(t => t.status === 'OPEN').map(task => (
                <div key={task.id} className="bg-slate-900/40 border border-slate-800 p-4 rounded-lg hover:border-blue-500/50 transition-all">
                  <div className="text-[10px] text-blue-400 font-mono uppercase mb-2 bg-blue-900/20 inline-block px-2 py-1 rounded">{task.bounty_tier}</div>
                  <h3 className="font-bold text-white mb-1 text-sm">{task.title}</h3>
                  <p className="text-xs text-gray-500 font-mono mb-4">{task.department}</p>
                  <button 
                    onClick={() => handleClaimTask(task.id)}
                    className="w-full bg-blue-900/30 hover:bg-blue-600 text-blue-400 hover:text-white text-xs font-bold uppercase py-2 rounded transition-colors border border-blue-900/50"
                  >
                    Accept Directive
                  </button>
                </div>
              ))}
              {tasks.filter(t => t.status === 'OPEN').length === 0 && (
                <p className="text-xs font-mono text-gray-600 text-center py-8">No open tasks available.</p>
              )}
            </div>
          </div>

          <div className="bg-[#050505] border border-orange-900/30 rounded-xl p-6 min-h-[50vh] shadow-[0_0_20px_rgba(234,88,12,0.05)]">
            <h2 className="text-sm font-mono text-orange-500 uppercase tracking-widest mb-4 border-b border-orange-900/30 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              Active Deployments
            </h2>
            <div className="space-y-4">
              {tasks.filter(t => t.status === 'IN_PROGRESS').map(task => (
                <div key={task.id} className="bg-orange-950/20 border border-orange-900/50 p-4 rounded-lg">
                  <div className="text-[10px] text-orange-400 font-mono uppercase mb-2">Assigned to You</div>
                  <h3 className="font-bold text-white mb-1 text-sm">{task.title}</h3>
                  <p className="text-xs text-gray-500 font-mono mb-4">{task.department}</p>
                  <button 
                    onClick={() => handleCompleteTask(task.id)}
                    disabled={task.assigned_to !== currentUserId}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase py-2 rounded transition-colors shadow-lg disabled:opacity-50"
                  >
                    {task.assigned_to === currentUserId ? 'Push to Production' : 'Unauthorized Access'}
                  </button>
                </div>
              ))}
              {tasks.filter(t => t.status === 'IN_PROGRESS').length === 0 && (
                <p className="text-xs font-mono text-gray-600 text-center py-8">No active deployments.</p>
              )}
            </div>
          </div>

          <div className="bg-[#050505] border border-green-900/30 rounded-xl p-6 min-h-[50vh]">
            <h2 className="text-sm font-mono text-green-500 uppercase tracking-widest mb-4 border-b border-green-900/30 pb-2">
              Verified & Deployed
            </h2>
            <div className="space-y-4">
              {tasks.filter(t => t.status === 'COMPLETED').map(task => (
                <div key={task.id} className="bg-green-950/10 border border-green-900/30 p-4 rounded-lg opacity-70">
                  <h3 className="font-bold text-gray-300 mb-1 text-sm line-through decoration-green-900/50">{task.title}</h3>
                  <div className="text-xs text-green-500 font-mono mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    System Online
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}