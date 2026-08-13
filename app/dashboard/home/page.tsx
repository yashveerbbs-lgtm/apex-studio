'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../../utils/supabase'
import { Activity, BookOpen, Terminal, ChevronRight, Cpu, Sparkles, FolderKanban, Clock, GraduationCap, Trophy } from 'lucide-react'

export default function DashboardOverview() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [recentSquads, setRecentSquads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // --- GAMIFICATION STATE ---
  const [xp, setXp] = useState(0)
  
  const getRank = (currentXp: number) => {
    if (currentXp < 100) return 'Rookie'
    if (currentXp < 500) return 'Pro'
    if (currentXp < 1000) return 'Elite'
    return 'Apex'
  }

  useEffect(() => {
    fetchDashboardData()
    // Load XP from localStorage
    const savedXp = parseInt(localStorage.getItem('spark_xp') || '0')
    setXp(savedXp)
  }, [])

  async function fetchDashboardData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUser(user)
      
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
    return <div className="h-full flex items-center justify-center text-indigo-500 font-bold animate-pulse dark:bg-slate-950">Loading Workspace...</div>
  }

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-8 md:p-12 overflow-y-auto font-sans transition-colors duration-500">
      
      {/* WELCOME BANNER & GAMIFICATION STATUS */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white mb-2 flex items-center gap-3">
            Welcome back, {currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || 'Developer'} <Sparkles className="w-8 h-8 text-yellow-400 fill-yellow-400" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
            Your Apex Studio ecosystem is ready. Let's build something great today!
          </p>
        </div>
        
        {/* NEW RANK BADGE */}
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-xl border-2 border-amber-200 dark:border-amber-700/50">
            <Trophy className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Rank</p>
            <p className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
              {getRank(xp)} <span className="text-sm text-indigo-500 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">{xp} XP</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ACTIVE WORKSPACES */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-6 rounded-2xl flex flex-col shadow-sm hover:-translate-y-1 transition-transform">
              <Activity className="w-8 h-8 text-emerald-500 mb-4 bg-emerald-50 dark:bg-emerald-900/30 p-1.5 rounded-xl" />
              <span className="text-3xl font-black text-slate-800 dark:text-white mb-1">100%</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Engine Status</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-6 rounded-2xl flex flex-col shadow-sm hover:-translate-y-1 transition-transform">
              <BookOpen className="w-8 h-8 text-indigo-500 mb-4 bg-indigo-50 dark:bg-indigo-900/30 p-1.5 rounded-xl" />
              <span className="text-3xl font-black text-slate-800 dark:text-white mb-1">{recentSquads.filter(s => s.name.startsWith('Academy:')).length}</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Courses</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-6 rounded-2xl flex flex-col shadow-sm hover:-translate-y-1 transition-transform">
              <Terminal className="w-8 h-8 text-sky-500 mb-4 bg-sky-50 dark:bg-sky-900/30 p-1.5 rounded-xl" />
              <span className="text-3xl font-black text-slate-800 dark:text-white mb-1">{recentSquads.length}</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Squads</span>
            </div>
          </div>

          {/* Recent Squads List */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-extrabold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <FolderKanban className="w-5 h-5 text-indigo-400" /> Recent Workspaces
              </h2>
              <Link href="/dashboard/workspace" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold uppercase tracking-wider flex items-center bg-indigo-50 dark:bg-indigo-900/30 py-1.5 px-3 rounded-lg transition-colors">
                Open IDE <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentSquads.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 font-medium">
                  No active workspaces found. Head to the Academy to start a course!
                </div>
              ) : (
                recentSquads.map((squad, idx) => (
                  <Link 
                    href="/dashboard/workspace" 
                    key={idx}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 rounded-xl transition-all group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${squad.name.startsWith('Academy:') ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400'}`}>
                        {squad.name.startsWith('Academy:') ? <GraduationCap className="w-5 h-5" /> : <Terminal className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{squad.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" /> Last accessed recently
                        </p>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-700 p-2 rounded-lg border-2 border-slate-100 dark:border-slate-600 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/50 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/50 transition-colors">
                      <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION CENTER */}
        <div className="space-y-6">
          
          {/* Academy Promo */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 p-4 opacity-50 group-hover:scale-110 transition-transform duration-500">
              <BookOpen className="w-32 h-32 text-indigo-200 dark:text-indigo-800" />
            </div>
            <h3 className="text-xl font-extrabold text-indigo-900 dark:text-indigo-100 mb-2 relative z-10">Master New Skills</h3>
            <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 mb-6 relative z-10 font-medium pr-8">
              Upgrade your engineering capabilities with interactive cloud courses.
            </p>
            <Link 
              href="/dashboard/courses" 
              className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl inline-flex items-center gap-2 py-3 px-5 relative z-10 font-bold transition-all shadow-[0_4px_0_rgb(67,56,202)] hover:shadow-[0_2px_0_rgb(67,56,202)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none"
            >
              Browse Academy <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Agency Promo */}
          <div className="bg-sky-50 dark:bg-sky-900/20 border-2 border-sky-100 dark:border-sky-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 p-4 opacity-50 group-hover:scale-110 transition-transform duration-500">
              <Cpu className="w-32 h-32 text-sky-200 dark:text-sky-800" />
            </div>
            <h3 className="text-xl font-extrabold text-sky-900 dark:text-sky-100 mb-2 relative z-10">Need a Custom Build?</h3>
            <p className="text-sm text-sky-700/80 dark:text-sky-300/80 mb-6 relative z-10 font-medium pr-8">
              Deploy our specialized engineering teams to build your next major project.
            </p>
            <Link 
              href="/dashboard/services" 
              className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/30 text-sky-600 dark:text-sky-400 border-2 border-sky-200 dark:border-sky-700/50 text-sm font-bold py-3 px-5 rounded-xl transition-all shadow-sm hover:shadow active:translate-y-[2px] relative z-10"
            >
              Request Services <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}