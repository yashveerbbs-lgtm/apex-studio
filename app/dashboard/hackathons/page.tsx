'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Banknote, Code2, ChevronLeft, ChevronRight, Flame, Plus, X, Trash2, Edit2, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../../../utils/supabase'

export default function HackathonArena() {
  const router = useRouter() 
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<'ADMIN' | 'INTERN'>('INTERN')
  const [view, setView] = useState<'select' | 'community' | 'bounty'>('select')

  // ADMIN CREATION & EDIT STATE
  const [showModal, setShowModal] = useState(false)
  const [editingArenaId, setEditingArenaId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<'community' | 'bounty'>('community')
  const [newDesc, setNewDesc] = useState('')
  const [newPrize, setNewPrize] = useState('$500 Creator Grant')
  const [newDeadline, setNewDeadline] = useState('Ends in 48 hrs')
  
  // IMAGE UPLOAD STATE
  const [newImage, setNewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 🚨 LIVE DATABASE STATE 🚨
  const [arenas, setArenas] = useState<any[]>([])

  useEffect(() => {
    // 1. Fetch User Profile
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setCurrentUser(user)
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile) setUserRole(profile.role)
      }
    })
    
    // 2. Fetch Live Arenas
    fetchArenas()
  }, [])

  // 🚨 SUPABASE FETCH API 🚨
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

  // 🚨 SUPABASE INSERT & UPDATE API 🚨
  async function handleSaveArena(e: React.FormEvent) {
    e.preventDefault()

    if (editingArenaId) {
      // UPDATE EXISTING ARENA
      const { data, error } = await supabase
        .from('hackathon_arenas')
        .update({
          title: newTitle, type: newType, desc: newDesc, deadline: newDeadline, prize: newPrize, image: newImage
        })
        .eq('id', editingArenaId)
        .select()
        .single()

      if (data) {
        setArenas(arenas.map(a => a.id === editingArenaId ? data : a))
      }
    } else {
      // INSERT NEW ARENA
      const { data, error } = await supabase
        .from('hackathon_arenas')
        .insert([{
          title: newTitle, type: newType, desc: newDesc, deadline: newDeadline, prize: newPrize, image: newImage
        }])
        .select()
        .single()

      if (data) {
        setArenas([data, ...arenas])
      }
    }
    closeModal()
  }

  // 🚨 SUPABASE DELETE API 🚨
  async function handleDeleteArena(arenaId: string) {
    if (confirm("ADMIN OVERRIDE: Permanently delete this arena from the database?")) {
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
    <div className="h-full bg-[#050505] text-white relative font-sans flex flex-col overflow-hidden">
      
      {/* UNIVERSAL MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#0a0a0a] border border-cyan-900/50 rounded-xl max-w-lg w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  {editingArenaId ? 'Update Arena' : 'Deploy New Arena'}
                </h2>
                <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">Publish to Hackathon Arena</p>
              </div>
              <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveArena} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Arena Title</label>
                <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-[#111111] text-sm text-white border border-gray-800 rounded p-3 focus:outline-none focus:border-cyan-500" placeholder="e.g. Next.js Hackathon" />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Track Type</label>
                <select value={newType} onChange={e => setNewType(e.target.value as any)} className="w-full bg-[#111111] text-sm text-gray-300 border border-gray-800 rounded p-3 focus:outline-none focus:border-cyan-500 uppercase tracking-wider font-bold">
                  <option value="community">Community Track</option>
                  <option value="bounty">Bounty Track (High Stakes)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Prize / Grant</label>
                  <input type="text" required value={newPrize} onChange={e => setNewPrize(e.target.value)} className="w-full bg-[#111111] text-sm text-white border border-gray-800 rounded p-3 focus:outline-none focus:border-cyan-500" placeholder="e.g. $500 Grant" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Timeline / Label</label>
                  <input type="text" required value={newDeadline} onChange={e => setNewDeadline(e.target.value)} className="w-full bg-[#111111] text-sm text-white border border-gray-800 rounded p-3 focus:outline-none focus:border-cyan-500" placeholder="e.g. Ends in 48 hrs" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Description & Rules</label>
                <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-[#111111] text-sm text-gray-300 border border-gray-800 rounded p-3 focus:outline-none focus:border-cyan-500 h-24 resize-none" placeholder="Provide full context and objectives..." />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Banner Image</label>
                <div className="flex items-center gap-4">
                  {newImage && (
                    <div className="w-16 h-16 rounded overflow-hidden border border-gray-700 relative shrink-0">
                      <img src={newImage} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setNewImage(null)} className="absolute top-0 right-0 bg-red-600 p-1 text-white"><X className="w-3 h-3"/></button>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={e => e.target.files && handleImageProcess(e.target.files[0])} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 bg-[#111111] border border-gray-800 text-gray-400 hover:text-cyan-400 px-4 py-3 rounded text-xs font-bold uppercase w-full">
                    <ImageIcon className="w-4 h-4" /> {newImage ? 'Replace Image' : 'Attach Banner Image'}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold uppercase tracking-widest py-4 rounded mt-4 transition-colors">
                {editingArenaId ? 'Save Changes' : 'Publish Arena'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN DEPLOY BUTTON (ONLY SHOWS ON SELECT VIEW) */}
      {userRole === 'ADMIN' && view === 'select' && (
        <div className="absolute top-8 right-8 z-10">
          <button 
            onClick={() => setShowModal(true)}
            className="bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-400 border border-cyan-900/50 px-4 py-2.5 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" /> Deploy Arena
          </button>
        </div>
      )}

      {/* VIEW 1: ARENA SELECT */}
      {view === 'select' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-16">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
              Select Your Arena
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Choose your path. Build for fun and portfolio growth in the Community track, or test your absolute limits for real contractor bounties.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
            <button 
              onClick={() => setView('community')}
              className="text-left bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-900/10 transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-[#111111] group-hover:bg-cyan-950/50 border border-gray-800 group-hover:border-cyan-900/50 rounded-xl flex items-center justify-center mb-8 transition-colors">
                <Users className="w-8 h-8 text-gray-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Community Builds</h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                Standard hackathons focused on learning, collaboration, and building impressive UI/UX or full-stack projects for your resume.
              </p>
              <div className="text-xs font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                Enter Community Track <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button 
              onClick={() => setView('bounty')}
              className="text-left bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8 hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-[#111111] group-hover:bg-red-950/50 border border-gray-800 group-hover:border-red-900/50 rounded-xl flex items-center justify-center mb-8 transition-colors">
                <Banknote className="w-8 h-8 text-gray-500 group-hover:text-red-400 transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                The Bounty Arena <span className="text-yellow-500">🏆</span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                Strict, automated logic tests and complex architecture challenges. Prove you are the top 1% to earn creator grants and agency contracts.
              </p>
              <div className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                Enter Bounty Track <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: COMMUNITY TRACK */}
      {view === 'community' && (
        <div className="flex-1 p-8 md:p-12 overflow-y-auto animate-in fade-in duration-300">
          <button onClick={() => setView('select')} className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors mb-8 text-sm font-bold tracking-widest uppercase">
            <ChevronLeft className="w-4 h-4" /> Back to Arena Select
          </button>
          <div className="max-w-4xl space-y-8">
            <div>
              <h1 className="text-4xl font-black text-white flex items-center gap-4 mb-4"><Users className="w-10 h-10 text-cyan-500" /> Community Builds</h1>
              <p className="text-gray-400 text-lg leading-relaxed">Collaborative hackathons designed to help you learn, build your portfolio, and network with other engineers.</p>
            </div>
            <div className="space-y-6">
              {arenas.filter(a => a.type === 'community').length === 0 && (
                 <div className="text-gray-500 border border-gray-800 border-dashed rounded-xl p-12 text-center text-sm uppercase tracking-widest font-bold">
                   No active community arenas. Use Admin Deploy to create one.
                 </div>
              )}
              {arenas.filter(a => a.type === 'community').map(arena => (
                <div key={arena.id} className="bg-[#0a0a0a] border border-cyan-900/30 rounded-xl p-8 hover:border-cyan-900/60 transition-colors shadow-lg relative group">
                  {userRole === 'ADMIN' && (
                    <div className="absolute top-6 right-6 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); openEditModal(arena); }} className="text-gray-400 hover:text-blue-400 bg-black/80 border border-gray-700 p-2 rounded"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteArena(arena.id); }} className="text-gray-400 hover:text-red-500 bg-black/80 border border-gray-700 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                  {arena.image && (
                    <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-800 mb-6"><img src={arena.image} alt="" className="w-full h-full object-cover" /></div>
                  )}
                  <div className="flex justify-between items-start mb-6">
                    <span className="bg-cyan-950/40 text-cyan-400 border border-cyan-900/50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">{arena.prize}</span>
                    <span className="text-gray-500 text-xs font-mono pr-20 group-hover:pr-24 transition-all">{arena.deadline}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">{arena.title}</h2>
                  <p className="text-gray-400 leading-relaxed mb-8">{arena.desc}</p>
                  <button onClick={() => router.push('/dashboard/workspace')} className="bg-[#111111] hover:bg-cyan-950/30 border border-gray-800 hover:border-cyan-900/50 text-cyan-400 font-bold py-3 px-6 rounded transition-all flex items-center gap-2 text-sm tracking-widest">
                    &gt;_ Enter Workspace
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: BOUNTY TRACK */}
      {view === 'bounty' && (
        <div className="flex-1 p-8 md:p-12 overflow-y-auto animate-in fade-in duration-300">
          <button onClick={() => setView('select')} className="flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors mb-8 text-sm font-bold tracking-widest uppercase">
            <ChevronLeft className="w-4 h-4" /> Back to Arena Select
          </button>
          <div className="max-w-4xl space-y-8">
            <div>
              <h1 className="text-4xl font-black text-white flex items-center gap-4 mb-4"><Code2 className="w-10 h-10 text-red-500" /> The Bounty Arena</h1>
              <p className="text-gray-400 text-lg leading-relaxed">High-stakes algorithmic challenges and complex system builds. Prove your skills against the best.</p>
            </div>
            <div className="space-y-6">
              {arenas.filter(a => a.type === 'bounty').length === 0 && (
                 <div className="text-gray-500 border border-gray-800 border-dashed rounded-xl p-12 text-center text-sm uppercase tracking-widest font-bold">
                   No active bounty arenas. Use Admin Deploy to create one.
                 </div>
              )}
              {arenas.filter(a => a.type === 'bounty').map(arena => (
                <div key={arena.id} className="bg-[#0a0a0a] border border-red-900/30 rounded-xl p-8 hover:border-red-900/60 transition-colors shadow-lg relative overflow-hidden group">
                  {userRole === 'ADMIN' && (
                    <div className="absolute top-6 right-6 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); openEditModal(arena); }} className="text-gray-400 hover:text-blue-400 bg-black/80 border border-gray-700 p-2 rounded"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteArena(arena.id); }} className="text-gray-400 hover:text-red-500 bg-black/80 border border-gray-700 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                  {arena.image && (
                    <div className="w-full h-48 rounded-lg overflow-hidden border border-red-900/30 mb-6"><img src={arena.image} alt="" className="w-full h-full object-cover" /></div>
                  )}
                  <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-5 pointer-events-none"><Banknote className="w-64 h-64 text-red-500" /></div>
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <span className="flex items-center gap-1.5 bg-red-950/40 text-red-400 border border-red-900/50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      <Flame className="w-3 h-3" /> {arena.deadline}
                    </span>
                    <span className="text-green-400 font-mono font-bold text-lg pr-20 group-hover:pr-24 transition-all">{arena.prize}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4 relative z-10">{arena.title}</h2>
                  <p className="text-gray-400 leading-relaxed mb-8 max-w-2xl relative z-10">{arena.desc}</p>
                  <button onClick={() => router.push('/dashboard/workspace')} className="bg-red-950 hover:bg-red-900 border border-red-900/50 text-red-400 font-bold py-3 px-6 rounded transition-all flex items-center gap-2 text-sm tracking-widest relative z-10">
                    &lt;/&gt; Accept Bounty & Start
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}