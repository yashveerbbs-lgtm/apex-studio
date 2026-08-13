'use client'
import { useState } from 'react'
import { Search, Briefcase, Trophy, Award, ShieldCheck, ChevronRight, Star, ExternalLink, Mail, Code2 } from 'lucide-react'

export default function EmployerDashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRank, setSelectedRank] = useState('All Ranks')

  const candidates = [
    { id: 'APX-801', name: 'Yashveer Saini', rank: 'Apex', xp: 1250, track: 'Full-Stack Next.js', score: '99%', completedBounties: 8, skills: ['Next.js', 'TypeScript', 'Supabase', 'Python'], status: 'Available' },
    { id: 'APX-802', name: 'Sarah Jenkins', rank: 'Elite', xp: 850, track: 'Full-Stack Engineering', score: '98%', completedBounties: 5, skills: ['React', 'Node.js', 'PostgreSQL'], status: 'Interviewing' },
    { id: 'APX-803', name: 'Rahul_Dev', rank: 'Pro', xp: 450, track: 'Python Algorithmic Trading', score: '100%', completedBounties: 3, skills: ['Python', 'Pandas', 'TensorFlow'], status: 'Available' },
    { id: 'APX-804', name: 'Priya_C++', rank: 'Pro', xp: 410, track: '3D Game Engine Mechanics', score: '94%', completedBounties: 2, skills: ['C++', 'Unreal Engine 5', 'DirectX'], status: 'Available' },
  ]

  const filteredCandidates = candidates.filter(c => {
    const matchesRank = selectedRank === 'All Ranks' ? true : c.rank === selectedRank
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.skills.join(' ').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRank && matchesSearch
  })

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-8 md:p-12 overflow-y-auto font-sans transition-colors">
      
      {/* HEADER */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-lg border-2 border-amber-200 dark:border-amber-700/50 font-black text-xs uppercase tracking-widest mb-3 shadow-sm">
            <Briefcase className="w-4 h-4" /> Recruiter Clearance Granted
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">
            Verified Talent Pipeline
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Discover top-tier engineers based on real code performance, completed bounties, and verified rank scores.
          </p>
        </div>

        <div className="flex gap-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Available Candidates</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{candidates.length}</p>
          </div>
          <div className="border-l-2 border-slate-100 dark:border-slate-800 pl-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Avg Exam Score</p>
            <p className="text-2xl font-black text-emerald-500">97.7%</p>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border-2 border-slate-200 dark:border-slate-800">
          {['All Ranks', 'Apex', 'Elite', 'Pro'].map(rank => (
            <button
              key={rank}
              onClick={() => setSelectedRank(rank)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                selectedRank === rank 
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border-2 border-slate-200 dark:border-slate-700' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {rank}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidates or skills..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 text-sm font-bold text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
          />
        </div>
      </div>

      {/* CANDIDATES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCandidates.map(c => (
          <div key={c.id} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
                      {c.name} <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{c.id} • {c.track}</p>
                  </div>
                </div>

                <span className={`text-xs font-black uppercase px-3 py-1 rounded-lg border-2 ${
                  c.rank === 'Apex' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700/50' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700/50'
                }`}>
                  {c.rank} ({c.xp} XP)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Exam Accuracy</p>
                  <p className="text-lg font-black text-slate-800 dark:text-slate-100">{c.score}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bounties Deployed</p>
                  <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{c.completedBounties} Bounties</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {c.skills.map(s => (
                  <span key={s} className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <button 
              onClick={() => alert(`Interview request initiated for ${c.name}!`)}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_4px_0_rgb(67,56,202)] hover:shadow-[0_2px_0_rgb(67,56,202)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none"
            >
              Request Candidate Interview <Mail className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}