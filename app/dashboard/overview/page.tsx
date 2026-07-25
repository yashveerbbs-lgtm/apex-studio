'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../../utils/supabase'
import { Activity, BookOpen, Terminal, ChevronRight, Cpu, Sparkles, FolderKanban, Clock, GraduationCap } from 'lucide-react'

export default function DashboardOverview() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [recentSquads, setRecentSquads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUser(user)
      
      // Fetch the user's recent squads/teams
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('teams(id, name, created_at)')
        .eq('user_id', user.id)
        .limit(4)
      
      if (teamMembers) {
        // @ts-ignore
        const formattedTeams = teamMembers.map(tm => tm.teams).filter(Boolean)
        setRecentSquads(formattedTeams)
      }
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-cyan-500 animate-pulse">Loading Ecosystem...</div>
  }

  return (
    <div className="h-full bg-[#050505] text-white p-8 md:p-12 overflow-y-auto font-sans">
      
      {/* WELCOME BANNER */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-3">
Welcome back, {currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || 'Developer'} <Sparkles className="w-6 h-6 text-cyan-400" />        </h1>
        <p className="text-gray-400 text-lg">
          Your Apex Studio ecosystem is running and ready.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ACTIVE WORKSPACES */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-xl flex flex-col">
              <Activity className="w-5 h-5 text-green-500 mb-4" />
              <span className="text-2xl font-bold text-white mb-1">Operational</span>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Engine Status</span>
            </div>
            <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-xl flex flex-col">
              <BookOpen className="w-5 h-5 text-indigo-500 mb-4" />
              <span className="text-2xl font-bold text-white mb-1">{recentSquads.filter(s => s.name.startsWith('Academy:')).length}</span>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Active Courses</span>
            </div>
            <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-xl flex flex-col">
              <Terminal className="w-5 h-5 text-cyan-500 mb-4" />
              <span className="text-2xl font-bold text-white mb-1">{recentSquads.length}</span>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Total Squads</span>
            </div>
          </div>

          {/* Recent Squads List */}
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-gray-400" /> Recent Workspaces
              </h2>
              <Link href="/dashboard/workspace" className="text-xs text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-widest flex items-center">
                Open IDE <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentSquads.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-800 rounded-lg">
                  No active workspaces found. Head to the Academy or create a new squad!
                </div>
              ) : (
                recentSquads.map((squad, idx) => (
                  <Link 
                    href="/dashboard/workspace" 
                    key={idx}
                    className="flex items-center justify-between p-4 bg-[#111111] hover:bg-[#151515] border border-gray-800 hover:border-cyan-900/50 rounded-lg transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-md ${squad.name.startsWith('Academy:') ? 'bg-indigo-900/20 text-indigo-400' : 'bg-cyan-900/20 text-cyan-400'}`}>
                        {squad.name.startsWith('Academy:') ? <GraduationCap className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-200 group-hover:text-white transition-colors">{squad.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Last accessed recently
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION CENTER */}
        <div className="space-y-6">
          
          {/* Academy Promo */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-[#0a0a0a] border border-indigo-900/50 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <BookOpen className="w-24 h-24 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 relative z-10">Master New Skills</h3>
            <p className="text-sm text-gray-400 mb-6 relative z-10">
              Upgrade your engineering capabilities with interactive cloud courses.
            </p>
            <Link 
              href="/dashboard/courses" 
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-2.5 px-4 rounded-lg transition-colors relative z-10"
            >
              Browse Academy <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Agency Promo */}
          <div className="bg-gradient-to-br from-cyan-900/20 to-[#0a0a0a] border border-cyan-900/30 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Cpu className="w-24 h-24 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 relative z-10">Need a Custom Build?</h3>
            <p className="text-sm text-gray-400 mb-6 relative z-10">
              Deploy our specialized engineering teams to build your next major project.
            </p>
            <Link 
              href="/dashboard/services" 
              className="inline-flex items-center gap-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 text-sm font-bold py-2.5 px-4 rounded-lg transition-colors relative z-10"
            >
              Request Services <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}