'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Banknote, Code2, ChevronLeft, ChevronRight, Flame, Plus, X, Trash2, Edit2, Image as ImageIcon, Gem, Sparkles } from 'lucide-react'
import { supabase } from '../../../utils/supabase'

export default function HackathonArena() {
  const router = useRouter() 
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<'ADMIN' | 'INTERN'>('INTERN')
  const [view, setView] = useState<'select' | 'community' | 'bounty'>('select')

  const [showModal, setShowModal] = useState(false)
  const [editingArenaId, setEditingArenaId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<'community' | 'bounty'>('community')
  const [newDesc, setNewDesc] = useState('')
  const [newPrize, setNewPrize] = useState('$500 Creator Grant')
  const [newDeadline, setNewDeadline] = useState('Ends in 48 hrs')
  
  const [newImage, setNewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [arenas, setArenas] = useState<any[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setCurrentUser(user)
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile) setUserRole(profile.role)
      }
    })
    fetchArenas()
  }, [])

  async function fetchArenas() {
    const { data, error } = await supabase
      .from('hackathon_arenas')
      .select('*')
      .order('created_at', { ascending: false })
    
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
      const { data, error } = await supabase
        .from('hackathon_arenas')
        .update({
          title: newTitle, type: newType, desc: newDesc, deadline: newDeadline, prize: newPrize, image: newImage
        })
        .eq('id', editingArenaId)
        .select()
        .single()
      if (data) setArenas(arenas.map(a => a.id === editingArenaId ? data : a))
    } else {
      const { data, error } = await supabase
        .from('hackathon_arenas')
        .insert([{
          title: newTitle, type: newType, desc: newDesc, deadline: newDeadline, prize: newPrize, image: newImage
        }])
        .select()
        .single()
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
    <div className="h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 relative font-sans flex flex-col overflow-hidden transition-colors duration-500">
      
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 transition-colors">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] max-w-lg w-full p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] animate-in zoom-in-95 duration-200 relative overflow-hidden transition-colors">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-400 to-indigo-500 dark:from-sky-600 dark:to-indigo-700"></div>

            <div className="flex justify-between items-center mb-6 mt-2 border-b-2 border-slate-100 dark:border-slate-800 pb-4 transition-colors">
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors">
                  {editingArenaId ? 'Update Arena' : 'Deploy New Arena'}
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-wider transition-colors">Publish to Hackathon Arena</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 transition-all hover:-translate-y-0.5"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveArena} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">Arena Title</label>
                <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500" placeholder="e.g. Next.js Hackathon" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">Track Type</label>
                <select value={newType} onChange={e => setNewType(e.target.value as any)} className="w-full bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 transition-all">
                  <option value="community">Community Track</option>
                  <option value="bounty">Bounty Track (High Stakes)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">Prize / Grant</label>
                  <input type="text" required value={newPrize} onChange={e => setNewPrize(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500" placeholder="e.g. $500 Grant" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">Timeline</label>
                  <input type="text" required value={newDeadline} onChange={e => setNewDeadline(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500" placeholder="e.g. Ends in 48 hrs" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">Description & Rules</label>
                <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all h-24 resize-none placeholder:text-slate-300 dark:placeholder:text-slate-500" placeholder="Provide full context and objectives..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">Banner Image</label>
                <div className="flex items-center gap-4">
                  {newImage && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 relative shrink-0 shadow-sm transition-colors">
                      <img src={newImage} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setNewImage(null)} className="absolute top-1 right-1 bg-white dark:bg-slate-800 p-1 text-red-500 rounded-md shadow-sm hover:scale-105 transition-transform"><X className="w-3 h-3"/></button>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={e => e.target.files && handleImageProcess(e.target.files[0])} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-700 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider w-full transition-all shadow-sm hover:shadow">
                    <ImageIcon className="w-4 h-4" /> {newImage ? 'Replace Image' : 'Attach Banner Image'}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold py-4 rounded-xl mt-6 transition-all shadow-[0_4px_0_rgb(67,56,202)] hover:shadow-[0_2px_0_rgb(67,56,202)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none">
                {editingArenaId ? 'Save Changes' : 'Publish Arena'}
              </button>
            </form>
          </div>
        </div>
      )}

      {userRole === 'ADMIN' && view === 'select' && (
        <div className="absolute top-8 right-8 z-10">
          <button 
            onClick={() => setShowModal(true)}
            className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4 bg-indigo-50 dark:bg-indigo-900/50 p-0.5 rounded" /> Deploy Arena
          </button>
        </div>
      )}

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
                  {userRole === 'ADMIN' && (
                    <div className="absolute top-6 right-6 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); openEditModal(arena); }} className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-100 dark:border-slate-700 p-2.5 rounded-xl shadow-sm hover:scale-105 transition-all"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteArena(arena.id); }} className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-100 dark:border-slate-700 p-2.5 rounded-xl shadow-sm hover:scale-105 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
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
                  {userRole === 'ADMIN' && (
                    <div className="absolute top-6 right-6 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); openEditModal(arena); }} className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-100 dark:border-slate-700 p-2.5 rounded-xl shadow-sm hover:scale-105 transition-all"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteArena(arena.id); }} className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-100 dark:border-slate-700 p-2.5 rounded-xl shadow-sm hover:scale-105 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
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