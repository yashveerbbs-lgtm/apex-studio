'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Banknote, Code2, ChevronLeft, ChevronRight, Flame, Plus, X, Trash2, Edit2, Image as ImageIcon, Gem, Sparkles, Trophy, Building, ShieldCheck, Activity, Target } from 'lucide-react'
import { supabase } from '../../../utils/supabase'

// ==========================================
// 1. MAIN ROUTER COMPONENT
// ==========================================
export default function HackathonsRouter() {
  const [role, setRole] = useState<'ADMIN' | 'INTERN' | 'EMPLOYER' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUserPower()

    // 🚨 LISTEN FOR SIDEBAR ROLE SWITCHES INSTANTLY
    const handleRoleChange = () => {
      const localRole = localStorage.getItem('apex_role')
      if (localRole) setRole(localRole as any)
    }
    
    window.addEventListener('roleChanged', handleRoleChange)
    return () => window.removeEventListener('roleChanged', handleRoleChange)
  }, [])

  async function checkUserPower() {
    const localRole = localStorage.getItem('apex_role')
    if (localRole) {
      setRole(localRole as any)
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user && !localRole) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      setRole(profile?.role || 'INTERN')
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="h-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-sans text-indigo-500 font-bold animate-pulse tracking-wider">
        Loading Arenas...
      </div>
    )
  }

  // 🚨 DUAL UI ROUTING 🚨
  if (role === 'ADMIN' || role === 'EMPLOYER') return <EmployerArenaDashboard />
  return <StudentArenaBoard />
}


// ==========================================
// 2. EMPLOYER / RECRUITER VIEW
// ==========================================
function EmployerArenaDashboard() {
  const [activeTab, setActiveTab] = useState<'manage' | 'leaderboard'>('manage')
  const [showModal, setShowModal] = useState(false)
  const [editingArenaId, setEditingArenaId] = useState<string | null>(null)
  
  // Form State
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<'community' | 'bounty'>('community')
  const [newDesc, setNewDesc] = useState('')
  const [newPrize, setNewPrize] = useState('$500 Creator Grant')
  const [newDeadline, setNewDeadline] = useState('Ends in 48 hrs')
  const [newImage, setNewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [arenas, setArenas] = useState<any[]>([])

  // Dummy Leaderboard Data
  const leaderboard = [
    { rank: 1, name: 'Yashveer Saini', track: 'Next.js Core Architecture', score: 1250, status: 'Leading', avatar: 'bg-amber-100 text-amber-600' },
    { rank: 2, name: 'Sarah Jenkins', track: 'Next.js Core Architecture', score: 1100, status: 'Competing', avatar: 'bg-indigo-100 text-indigo-600' },
    { rank: 3, name: 'Rahul_Dev', track: 'Python Algorithmic Trading', score: 980, status: 'Leading', avatar: 'bg-emerald-100 text-emerald-600' },
    { rank: 4, name: 'Priya_C++', track: 'Python Algorithmic Trading', score: 850, status: 'Competing', avatar: 'bg-sky-100 text-sky-600' },
  ]

  useEffect(() => {
    fetchArenas()
  }, [])

  async function fetchArenas() {
    const { data } = await supabase.from('hackathon_arenas').select('*').order('created_at', { ascending: false })
    if (data) setArenas(data)
  }

  function handleImageProcess(file: File) {
    if (!file.type.startsWith('image/')) return alert('Please upload an image file.')
    const reader = new FileReader()
    reader.onload = (e) => setNewImage(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSaveArena(e: React.FormEvent) {
    e.preventDefault()
    if (editingArenaId) {
      const { data } = await supabase.from('hackathon_arenas').update({
        title: newTitle, type: newType, desc: newDesc, deadline: newDeadline, prize: newPrize, image: newImage
      }).eq('id', editingArenaId).select().single()
      if (data) setArenas(arenas.map(a => a.id === editingArenaId ? data : a))
    } else {
      const { data } = await supabase.from('hackathon_arenas').insert([{
        title: newTitle, type: newType, desc: newDesc, deadline: newDeadline, prize: newPrize, image: newImage
      }]).select().single()
      if (data) setArenas([data, ...arenas])
    }
    closeModal()
  }

  async function handleDeleteArena(arenaId: string) {
    if (confirm("Are you sure you want to permanently delete this arena?")) {
      await supabase.from('hackathon_arenas').delete().eq('id', arenaId)
      setArenas(arenas.filter(a => a.id !== arenaId))
    }
  }

  function openEditModal(arena: any) {
    setEditingArenaId(arena.id)
    setNewTitle(arena.title)
    setNewType(arena.type)
    setNewDesc(arena.desc)
    setNewDeadline(arena.deadline)
    setNewPrize(arena.prize)
    setNewImage(arena.image || null)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingArenaId(null)
    setNewTitle('')
    setNewDesc('')
    setNewImage(null)
  }

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-8 md:p-12 overflow-y-auto font-sans relative transition-colors duration-500">
      
      {/* 🚨 CREATE / EDIT ARENA MODAL 🚨 */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] max-w-2xl w-full p-8 shadow-[0_20px_50px_rgb(0,0,0,0.15)] animate-in zoom-in-95 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>

            <div className="flex justify-between items-center mb-6 mt-2 border-b-2 border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                  {editingArenaId ? 'Update Sponsored Arena' : 'Sponsor New Arena'}
                </h2>
                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">Publish to the Talent Pool</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 transition-all"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveArena} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Arena Title</label>
                <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 focus:outline-none focus:border-indigo-500 transition-all" placeholder="e.g. Apex FinTech Hackathon" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Track Type</label>
                  <select value={newType} onChange={e => setNewType(e.target.value as any)} className="w-full bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 focus:outline-none focus:border-indigo-500 transition-all">
                    <option value="community">Community Track (Learning)</option>
                    <option value="bounty">Bounty Track (High Stakes)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prize Pool / Grant</label>
                  <input type="text" required value={newPrize} onChange={e => setNewPrize(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 focus:outline-none focus:border-indigo-500 transition-all" placeholder="e.g. $5,000 Grand Prize" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Timeline</label>
                <input type="text" required value={newDeadline} onChange={e => setNewDeadline(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 focus:outline-none focus:border-indigo-500 transition-all" placeholder="e.g. Ends October 31st" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Briefing & Rules</label>
                <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 focus:outline-none focus:border-indigo-500 transition-all h-24 resize-none" placeholder="Provide full context, technical constraints, and judging criteria..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sponsor Banner Image</label>
                <div className="flex items-center gap-4">
                  {newImage && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 relative shrink-0">
                      <img src={newImage} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setNewImage(null)} className="absolute top-1 right-1 bg-white p-1 text-red-500 rounded-md shadow-sm"><X className="w-3 h-3"/></button>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={e => e.target.files && handleImageProcess(e.target.files[0])} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-500 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider w-full transition-all">
                    <ImageIcon className="w-4 h-4" /> {newImage ? 'Replace Banner' : 'Upload Sponsored Banner'}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold py-4 rounded-xl mt-6 transition-all shadow-[0_4px_0_rgb(67,56,202)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none">
                {editingArenaId ? 'Save Configuration' : 'Launch Sponsored Arena'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-lg border-2 border-purple-200 dark:border-purple-700/50 font-black text-xs uppercase tracking-widest mb-3 shadow-sm">
            <Building className="w-4 h-4" /> Partner Organization
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">
            Sponsored Arenas
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Host custom hackathons, distribute grants, and identify elite talent in real-time.
          </p>
        </div>

        <div className="flex gap-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Arenas</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{arenas.length}</p>
          </div>
          <div className="border-l-2 border-slate-100 dark:border-slate-800 pl-4 pr-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Participants</p>
            <p className="text-2xl font-black text-indigo-500">342</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_4px_0_rgb(168,85,247)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none shrink-0 ml-2"
          >
            <Plus className="w-4 h-4" /> Sponsor Arena
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('manage')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border-2 ${activeTab === 'manage' ? 'bg-white dark:bg-slate-900 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Manage Arenas
        </button>
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border-2 ${activeTab === 'leaderboard' ? 'bg-white dark:bg-slate-900 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Live Leaderboard
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'manage' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {arenas.map(arena => (
            <div key={arena.id} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:border-purple-200 dark:hover:border-purple-700 transition-colors group relative">
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(arena)} className="text-slate-400 hover:text-indigo-600 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-2 rounded-lg shadow-sm"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDeleteArena(arena.id)} className="text-slate-400 hover:text-red-500 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-2 rounded-lg shadow-sm"><Trash2 className="w-4 h-4" /></button>
              </div>
              
              {arena.image ? (
                <div className="w-full h-32 relative">
                  <img src={arena.image} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                </div>
              ) : (
                <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Target className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${arena.type === 'bounty' ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800' : 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-900/30 dark:border-sky-800'}`}>
                    {arena.type} Track
                  </span>
                  <span className="text-emerald-500 font-black text-sm">{arena.prize}</span>
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2 truncate">{arena.title}</h3>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mt-4 border-t-2 border-slate-100 dark:border-slate-800 pt-4">
                  <Activity className="w-3.5 h-3.5" /> {arena.deadline}
                </div>
              </div>
            </div>
          ))}
          {arenas.length === 0 && (
             <div className="col-span-full text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 font-bold uppercase tracking-widest text-sm">
               No Sponsored Arenas Active
             </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b-2 border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="p-4 pl-6">Rank</th>
                <th className="p-4">Candidate</th>
                <th className="p-4">Arena Track</th>
                <th className="p-4">Live Score</th>
                <th className="p-4 pr-6">Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
              {leaderboard.map((user, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 pl-6">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-amber-100 text-amber-600 border-2 border-amber-200' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                      {user.rank}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${user.avatar}`}>{user.name.charAt(0)}</div>
                    {user.name}
                  </td>
                  <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400">{user.track}</td>
                  <td className="p-4 font-black text-indigo-500">{user.score} XP</td>
                  <td className="p-4 pr-6">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${user.status === 'Leading' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800'}`}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ==========================================
// 3. STUDENT / INTERN VIEW
// ==========================================
function StudentArenaBoard() {
  const router = useRouter() 
  const [view, setView] = useState<'select' | 'community' | 'bounty'>('select')
  const [arenas, setArenas] = useState<any[]>([])

  useEffect(() => {
    fetchArenas()
  }, [])

  async function fetchArenas() {
    const { data } = await supabase.from('hackathon_arenas').select('*').order('created_at', { ascending: false })
    if (data) setArenas(data)
  }

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 relative font-sans flex flex-col overflow-hidden transition-colors duration-500">
      
      {/* VIEW 1: ARENA SELECT */}
      {view === 'select' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-16">
            <div className="flex justify-center mb-4">
              <Sparkles className="w-12 h-12 text-indigo-400 dark:text-indigo-500 fill-indigo-200 dark:fill-indigo-900/50" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-800 dark:text-slate-100 mb-4 transition-colors">
              Select Your Arena
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium transition-colors">
              Choose your path. Build for fun and portfolio growth in the Community track, or test your absolute limits for real contractor bounties.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
            <button 
              onClick={() => setView('community')}
              className="text-left bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-500 border-2 border-slate-100 dark:border-slate-700 group-hover:border-indigo-600 rounded-2xl flex items-center justify-center mb-8 transition-colors shadow-sm">
                <Users className="w-8 h-8 text-slate-400 dark:text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-4 transition-colors">Community Builds</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8 transition-colors">
                Standard hackathons focused on learning, collaboration, and building impressive UI/UX or full-stack projects for your resume.
              </p>
              <div className="text-sm font-bold text-indigo-500 dark:text-indigo-400 flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 w-max px-4 py-2 rounded-xl border-2 border-indigo-100 dark:border-indigo-800/50 transition-colors">
                Enter Community Track <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button 
              onClick={() => setView('bounty')}
              className="text-left bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 group-hover:bg-rose-500 border-2 border-slate-100 dark:border-slate-700 group-hover:border-rose-600 rounded-2xl flex items-center justify-center mb-8 transition-colors shadow-sm">
                <Banknote className="w-8 h-8 text-slate-400 dark:text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-3 transition-colors">
                The Bounty Arena <span className="text-2xl drop-shadow-sm">🏆</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8 transition-colors">
                Strict, automated logic tests and complex architecture challenges. Prove you are the top 1% to earn creator grants and agency contracts.
              </p>
              <div className="text-sm font-bold text-rose-500 dark:text-rose-400 flex items-center gap-2 bg-rose-50 dark:bg-rose-900/30 w-max px-4 py-2 rounded-xl border-2 border-rose-100 dark:border-rose-800/50 transition-colors">
                Enter Bounty Track <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: COMMUNITY TRACK */}
      {view === 'community' && (
        <div className="flex-1 p-8 md:p-12 overflow-y-auto animate-in fade-in duration-300 max-w-7xl mx-auto w-full">
          <button 
            onClick={() => setView('select')} 
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8 text-sm font-bold tracking-wider uppercase bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border-2 border-slate-100 dark:border-slate-800 w-fit hover:-translate-y-0.5 active:translate-y-0"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Arenas
          </button>
          <div className="max-w-4xl space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-4 mb-4 transition-colors">
                <div className="bg-indigo-50 dark:bg-indigo-900/50 border-2 border-indigo-100 dark:border-indigo-800/50 p-2.5 rounded-2xl shadow-sm transition-colors"><Users className="w-8 h-8 md:w-10 md:h-10 text-indigo-500 dark:text-indigo-400" /></div> Community Builds
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed transition-colors">Collaborative hackathons designed to help you learn, build your portfolio, and network with other engineers.</p>
            </div>
            <div className="space-y-6">
              {arenas.filter(a => a.type === 'community').length === 0 && (
                 <div className="text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-800 border-dashed rounded-[2rem] p-16 text-center text-sm uppercase tracking-widest font-bold transition-colors">
                   No active community arenas.
                 </div>
              )}
              {arenas.filter(a => a.type === 'community').map(arena => (
                <div key={arena.id} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 md:p-8 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors shadow-sm hover:shadow-md relative group">
                  {arena.image && (
                    <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 mb-6 group-hover:border-indigo-200 dark:group-hover:border-indigo-700 transition-colors">
                      <img src={arena.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-100 dark:border-indigo-800/50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm transition-colors">{arena.prize}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider transition-colors">{arena.deadline}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-3 transition-colors">{arena.title}</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6 transition-colors">{arena.desc}</p>
                  
                  <div className="flex items-center justify-between border-t-2 border-slate-100 dark:border-slate-800 pt-6 transition-colors">
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-lg border-2 border-amber-100 dark:border-amber-800/50 shadow-sm uppercase tracking-wider transition-colors">
                      Participation Reward: +50 <Gem className="w-3.5 h-3.5 fill-amber-200 dark:fill-amber-900" />
                    </div>

                    <button onClick={() => router.push('/dashboard/workspace')} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 text-indigo-600 dark:text-indigo-400 font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 text-sm shadow-sm hover:shadow active:-translate-y-0.5 active:shadow-none">
                      Enter Workspace <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: BOUNTY TRACK */}
      {view === 'bounty' && (
        <div className="flex-1 p-8 md:p-12 overflow-y-auto animate-in fade-in duration-300 max-w-7xl mx-auto w-full">
          <button 
            onClick={() => setView('select')} 
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors mb-8 text-sm font-bold tracking-wider uppercase bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border-2 border-slate-100 dark:border-slate-800 w-fit hover:-translate-y-0.5 active:translate-y-0"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Arenas
          </button>
          <div className="max-w-4xl space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-4 mb-4 transition-colors">
                <div className="bg-rose-50 dark:bg-rose-900/50 border-2 border-rose-100 dark:border-rose-800/50 p-2.5 rounded-2xl shadow-sm transition-colors"><Code2 className="w-8 h-8 md:w-10 md:h-10 text-rose-500 dark:text-rose-400" /></div> The Bounty Arena
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed transition-colors">High-stakes algorithmic challenges and complex system builds. Prove your skills against the best.</p>
            </div>
            <div className="space-y-6">
              {arenas.filter(a => a.type === 'bounty').length === 0 && (
                 <div className="text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-800 border-dashed rounded-[2rem] p-16 text-center text-sm uppercase tracking-widest font-bold transition-colors">
                   No active bounty arenas.
                 </div>
              )}
              {arenas.filter(a => a.type === 'bounty').map(arena => (
                <div key={arena.id} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 md:p-8 hover:border-rose-300 dark:hover:border-rose-700 transition-colors shadow-sm hover:shadow-md relative overflow-hidden group">
                  {arena.image && (
                    <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 mb-6 group-hover:border-rose-200 dark:group-hover:border-rose-700 transition-colors">
                      <img src={arena.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  )}
                  
                  <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-[0.03] dark:opacity-[0.05] pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                    <Banknote className="w-64 h-64 text-slate-900 dark:text-slate-100" />
                  </div>
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <span className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 border-2 border-rose-100 dark:border-rose-800/50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm transition-colors">
                      <Flame className="w-3.5 h-3.5" /> {arena.deadline}
                    </span>
                    <span className="text-emerald-500 dark:text-emerald-400 font-black text-lg bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-100 dark:border-emerald-800/50 px-3 py-1 rounded-lg shadow-sm transition-colors">{arena.prize}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-3 relative z-10 transition-colors">{arena.title}</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8 max-w-2xl relative z-10 transition-colors">{arena.desc}</p>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t-2 border-slate-100 dark:border-slate-800 pt-6 gap-4 sm:gap-0 relative z-10 transition-colors">
                    
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-lg border-2 border-amber-100 dark:border-amber-800/50 shadow-sm uppercase tracking-wider transition-colors">
                      Winner Takes All: +500 <Gem className="w-3.5 h-3.5 fill-amber-200 dark:fill-amber-900" />
                    </div>

                    <button onClick={() => router.push('/dashboard/workspace')} className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-[0_4px_0_rgb(225,29,72)] hover:shadow-[0_2px_0_rgb(225,29,72)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none flex items-center justify-center gap-2 text-sm tracking-wider uppercase">
                      Accept Bounty & Start
                    </button>
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