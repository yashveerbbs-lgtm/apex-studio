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
    return <div className="h-full flex items-center justify-center text-indigo-500 font-bold animate-pulse">Loading Workspace...</div>
  }

  return (
    <div className="h-full bg-slate-50 text-slate-800 p-8 md:p-12 overflow-y-auto font-sans transition-colors duration-500">
      
      {/* WELCOME BANNER */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 mb-2 flex items-center gap-3">
          Welcome back, {currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || 'Developer'} <Sparkles className="w-8 h-8 text-yellow-400 fill-yellow-400" />
        </h1>
        <p className="text-slate-500 text-lg font-medium">
          Your Apex Studio ecosystem is ready. Let's build something great today!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ACTIVE WORKSPACES */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl flex flex-col shadow-sm hover:-translate-y-1 transition-transform">
              <Activity className="w-8 h-8 text-emerald-500 mb-4 bg-emerald-50 p-1.5 rounded-xl" />
              <span className="text-3xl font-black text-slate-800 mb-1">100%</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Engine Status</span>
            </div>
            <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl flex flex-col shadow-sm hover:-translate-y-1 transition-transform">
              <BookOpen className="w-8 h-8 text-indigo-500 mb-4 bg-indigo-50 p-1.5 rounded-xl" />
              <span className="text-3xl font-black text-slate-800 mb-1">{recentSquads.filter(s => s.name.startsWith('Academy:')).length}</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Courses</span>
            </div>
            <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl flex flex-col shadow-sm hover:-translate-y-1 transition-transform">
              <Terminal className="w-8 h-8 text-sky-500 mb-4 bg-sky-50 p-1.5 rounded-xl" />
              <span className="text-3xl font-black text-slate-800 mb-1">{recentSquads.length}</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Squads</span>
            </div>
          </div>

          {/* Recent Squads List */}
          <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-extrabold flex items-center gap-2 text-slate-700">
                <FolderKanban className="w-5 h-5 text-indigo-400" /> Recent Workspaces
              </h2>
              <Link href="/dashboard/workspace" className="text-xs text-indigo-600 hover:text-indigo-500 font-bold uppercase tracking-wider flex items-center bg-indigo-50 py-1.5 px-3 rounded-lg transition-colors">
                Open IDE <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentSquads.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-medium">
                  No active workspaces found. Head to the Academy to start a course!
                </div>
              ) : (
                recentSquads.map((squad, idx) => (
                  <Link 
                    href="/dashboard/workspace" 
                    key={idx}
                    className="flex items-center justify-between p-4 bg-slate-50 hover:bg-white border-2 border-slate-100 hover:border-indigo-300 rounded-xl transition-all group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${squad.name.startsWith('Academy:') ? 'bg-indigo-100 text-indigo-600' : 'bg-sky-100 text-sky-600'}`}>
                        {squad.name.startsWith('Academy:') ? <GraduationCap className="w-5 h-5" /> : <Terminal className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{squad.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" /> Last accessed recently
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border-2 border-slate-100 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-colors">
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
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
          <div className="bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 p-4 opacity-50 group-hover:scale-110 transition-transform duration-500">
              <BookOpen className="w-32 h-32 text-indigo-200" />
            </div>
            <h3 className="text-xl font-extrabold text-indigo-900 mb-2 relative z-10">Master New Skills</h3>
            <p className="text-sm text-indigo-700/80 mb-6 relative z-10 font-medium pr-8">
              Upgrade your engineering capabilities with interactive cloud courses.
            </p>
            <Link 
              href="/dashboard/courses" 
              className="btn-indigo inline-flex items-center gap-2 py-3 px-5 relative z-10"
            >
              Browse Academy <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Agency Promo */}
          <div className="bg-sky-50 border-2 border-sky-100 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 p-4 opacity-50 group-hover:scale-110 transition-transform duration-500">
              <Cpu className="w-32 h-32 text-sky-200" />
            </div>
            <h3 className="text-xl font-extrabold text-sky-900 mb-2 relative z-10">Need a Custom Build?</h3>
            <p className="text-sm text-sky-700/80 mb-6 relative z-10 font-medium pr-8">
              Deploy our specialized engineering teams to build your next major project.
            </p>
            <Link 
              href="/dashboard/services" 
              className="inline-flex items-center gap-2 bg-white hover:bg-sky-50 text-sky-600 border-2 border-sky-200 text-sm font-bold py-3 px-5 rounded-xl transition-all shadow-sm hover:shadow active:translate-y-[2px] relative z-10"
            >
              Request Services <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}