'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '../../../utils/supabase'
import { Users, Search, FileCode, ChevronRight, Briefcase, Mail, Cpu, Award, Activity, CheckCircle, Terminal, Plus, X, Clock, Calendar, MessageSquare, Star, Trash2, Edit2, Image as ImageIcon, Gem, Sparkles } from 'lucide-react'

// ==========================================
// 1. SMART ROUTER
// ==========================================
export default function InternshipsRouter() {
  const [role, setRole] = useState<'ADMIN' | 'INTERN' | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    checkUserPower()
  }, [])

  async function checkUserPower() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      setRole(profile?.role || 'INTERN')
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="h-full bg-slate-50 flex items-center justify-center font-sans text-indigo-500 font-bold animate-pulse tracking-wider">
        Loading Pipeline...
      </div>
    )
  }

  if (role === 'ADMIN') return <AdminRecruiterDashboard />
  return <InternTaskBoard currentUserId={currentUserId} />
}

// ==========================================
// 2. THE ADMIN VIEW (God Mode Creation & Review)
// ==========================================
function AdminRecruiterDashboard() {
  const [activeTab, setActiveTab] = useState('All Candidates')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDept, setNewTaskDept] = useState('Engineering')
  const [newTaskTier, setNewTaskTier] = useState('L1 Bounty')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskDeadline, setNewTaskDeadline] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [newImage, setNewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [adminTasks, setAdminTasks] = useState<any[]>([])

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [newScore, setNewScore] = useState('')
  const [newStatus, setNewStatus] = useState('')

  const [candidates, setCandidates] = useState([
    { id: 'APX-001', name: 'Sarah Jenkins', source: 'Academy Graduate', track: 'Full-Stack Next.js', score: '98%', status: 'Interviewing', skills: ['React', 'Supabase', 'TypeScript'], avatar: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
    { id: 'APX-002', name: 'Rahul_Dev', source: 'Bounty Winner', track: 'Python Algorithmic Trading', score: '100%', status: 'Pending Review', skills: ['Python', 'Pandas', 'Machine Learning'], avatar: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
    { id: 'APX-004', name: 'Priya_C++', source: 'Academy Graduate', track: '3D Game Engine Mechanics', score: '94%', status: 'Pending Review', skills: ['C++', 'Unreal Engine', '3D Math'], avatar: 'bg-sky-100 text-sky-600 border-sky-200' }
  ])

  const tabs = ['All Candidates', 'Academy Graduates', 'Bounty Winners', 'Interviewing']

  const filteredCandidates = candidates.filter(c => {
    const matchesTab = activeTab === 'All Candidates' ? true : activeTab === 'Academy Graduates' ? c.source.includes('Academy') : activeTab === 'Bounty Winners' ? c.source.includes('Bounty') : c.status === 'Interviewing';
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.skills.join(' ').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  useEffect(() => {
    fetchAdminTasks()
  }, [])

  async function fetchAdminTasks() {
    const { data } = await supabase.from('corporate_tasks').select('*').order('created_at', { ascending: false })
    if (data) setAdminTasks(data)
  }

  function handleImageProcess(file: File) {
    if (!file.type.startsWith('image/')) return alert('Please upload an image file.')
    const reader = new FileReader()
    reader.onload = (e) => setNewImage(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSaveTask(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    if (editingTaskId) {
      const { error } = await supabase.from('corporate_tasks').update({
        title: newTaskTitle,
        department: newTaskDept,
        bounty_tier: newTaskTier,
        description: newTaskDescription,
        deadline: newTaskDeadline,
        image_url: newImage 
      }).eq('id', editingTaskId)

      if (!error) alert("Task successfully updated!")
    } else {
      const { error } = await supabase.from('corporate_tasks').insert({
        title: newTaskTitle,
        department: newTaskDept,
        bounty_tier: newTaskTier,
        description: newTaskDescription,
        deadline: newTaskDeadline,
        status: 'OPEN',
        image_url: newImage 
      })

      if (!error) alert("New internship task deployed to the ecosystem!")
    }

    closeModal()
    await fetchAdminTasks()
    setIsSubmitting(false)
  }

  function openEditModal(task: any) {
    setEditingTaskId(task.id)
    setNewTaskTitle(task.title)
    setNewTaskDept(task.department)
    setNewTaskTier(task.bounty_tier || 'L1 Bounty')
    setNewTaskDescription(task.description || '')
    setNewTaskDeadline(task.deadline || '')
    setNewImage(task.image_url || null) 
    setShowCreateModal(true)
  }

  function closeModal() {
    setShowCreateModal(false)
    setEditingTaskId(null)
    setNewTaskTitle('')
    setNewTaskDescription('')
    setNewTaskDeadline('')
    setNewImage(null) 
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm("Are you sure you want to permanently delete this task from the ecosystem?")) return
    await supabase.from('corporate_tasks').delete().eq('id', taskId)
    await fetchAdminTasks()
  }

  function openReview(candidate: any) {
    setSelectedCandidate(candidate)
    setNewScore(candidate.score.replace('%', ''))
    setNewStatus(candidate.status)
    setFeedbackText('')
    setShowReviewModal(true)
  }

  function handleEvaluateCandidate(e: React.FormEvent) {
    e.preventDefault()
    setCandidates(candidates.map(c => {
      if (c.id === selectedCandidate.id) {
        return { ...c, score: `${newScore}%`, status: newStatus }
      }
      return c
    }))
    setShowReviewModal(false)
    alert(`Feedback officially logged and sent to ${selectedCandidate.name}!`)
  }

  return (
    <div className="h-full bg-slate-50 text-slate-800 overflow-y-auto font-sans relative transition-colors duration-500">
      
      {/* CANDIDATE EVALUATION MODAL */}
      {showReviewModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white border-2 border-slate-100 rounded-[2rem] max-w-xl w-full p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-y-auto max-h-[90vh] animate-in zoom-in-95 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 to-pink-400"></div>
            
            <div className="flex justify-between items-start mb-6 mt-2">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-black text-xl shrink-0 ${selectedCandidate.avatar}`}>
                    {selectedCandidate.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedCandidate.name}</h2>
                    <p className="text-xs text-slate-500 font-bold mt-0.5 uppercase tracking-wider">{selectedCandidate.id} • {selectedCandidate.track}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl transition-all border-2 border-slate-200"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleEvaluateCandidate} className="space-y-6">
              <div className="grid grid-cols-2 gap-4 border-t-2 border-slate-100 pt-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Final Score (%)</label>
                  <input type="number" min="0" max="100" required value={newScore} onChange={e => setNewScore(e.target.value)} className="w-full bg-slate-50 text-xl font-black text-slate-800 border-2 border-slate-200 rounded-xl p-3 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Update Status</label>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full bg-slate-50 text-sm font-bold text-slate-700 border-2 border-slate-200 rounded-xl p-3.5 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all">
                    <option value="Pending Review">Pending Review</option>
                    <option value="Interviewing">Advance to Interview</option>
                    <option value="Passed">Passed (Hire)</option>
                    <option value="Needs Revision">Needs Revision</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-indigo-500" /> Direct Feedback & Code Review</label>
                <textarea required value={feedbackText} onChange={e => setFeedbackText(e.target.value)} className="w-full bg-slate-50 text-sm font-medium text-slate-800 border-2 border-slate-200 rounded-xl p-4 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all h-32 resize-none leading-relaxed placeholder:text-slate-300" placeholder="Write your feedback here... e.g., 'The backend architecture is excellent, but your database queries are unoptimized. Fix the N+1 issue in your route.ts and resubmit.'" />
              </div>

              <button type="submit" className="w-full bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold py-4 rounded-xl transition-all shadow-[0_4px_0_rgb(147,51,234)] hover:shadow-[0_2px_0_rgb(147,51,234)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none">
                Log Evaluation & Send Feedback
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🚨 ADMIN CREATION/EDIT MODAL 🚨 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white border-2 border-slate-100 rounded-[2rem] max-w-2xl w-full p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-y-auto max-h-[90vh] animate-in zoom-in-95 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-400 to-indigo-400"></div>

            <div className="flex justify-between items-center mb-6 mt-2 border-b-2 border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {editingTaskId ? 'Update Task Details' : 'Deploy New Task'}
                </h2>
                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">Push assignment to Intern Board</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl transition-all border-2 border-slate-200"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Task Title / Objective</label>
                <input type="text" required value={newTaskTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-slate-50 text-sm font-bold text-slate-800 border-2 border-slate-200 rounded-xl p-3.5 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all placeholder:text-slate-300" placeholder="e.g. Migrate Landing Page to Next.js 14" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detailed Briefing & Requirements</label>
                <textarea required value={newTaskDescription} onChange={e => setNewTaskDescription(e.target.value)} className="w-full bg-slate-50 text-sm font-medium text-slate-800 border-2 border-slate-200 rounded-xl p-3.5 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all h-32 resize-none placeholder:text-slate-300" placeholder="Provide full context, repo links, API keys needed, and exact deliverables expected from the intern..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                  <select value={newTaskDept} onChange={e => setNewTaskDept(e.target.value)} className="w-full bg-slate-50 text-sm font-bold text-slate-700 border-2 border-slate-200 rounded-xl p-3.5 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all">
                    <option value="Engineering">Engineering</option>
                    <option value="Design (UI/UX)">Design (UI/UX)</option>
                    <option value="Data Science">Data Science</option>
                    <option value="3D Architecture">3D Architecture</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bounty Tier</label>
                  <select value={newTaskTier} onChange={e => setNewTaskTier(e.target.value)} className="w-full bg-slate-50 text-sm font-bold text-slate-700 border-2 border-slate-200 rounded-xl p-3.5 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all">
                    <option value="L1 Bounty">L1 Bounty (50 Gems)</option>
                    <option value="L2 Bounty">L2 Bounty (100 Gems)</option>
                    <option value="L3 Bounty">L3 Bounty (250 Gems)</option>
                    <option value="Capstone Project">Capstone (500 Gems)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deadline</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="date" required value={newTaskDeadline} onChange={e => setNewTaskDeadline(e.target.value)} className="w-full bg-slate-50 text-sm font-bold text-slate-700 border-2 border-slate-200 rounded-xl py-3.5 pl-10 pr-3 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Task Blueprint / Design Mockup</label>
                <div className="flex items-center gap-4">
                  {newImage && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-200 shrink-0 shadow-sm">
                      <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setNewImage(null)} className="absolute top-1 right-1 bg-white p-1 rounded-md text-red-500 shadow-sm hover:scale-105 transition-transform"><X className="w-3 h-3"/></button>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={e => e.target.files && handleImageProcess(e.target.files[0])} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors w-full shadow-sm hover:shadow">
                    <ImageIcon className="w-5 h-5" /> {newImage ? 'Replace Blueprint' : 'Attach Blueprint Image'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-indigo w-full py-4 text-sm mt-6">
                {isSubmitting ? 'Deploying...' : (editingTaskId ? 'Save Changes' : 'Publish Task')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DASHBOARD HEADER */}
      <div className="border-b-2 border-slate-100 bg-white pt-10 pb-8 px-8 md:px-12 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-600 mb-4 font-black tracking-widest text-[10px] uppercase bg-indigo-50 px-3 py-1.5 rounded-lg border-2 border-indigo-100 shadow-sm">
              <ShieldCheck className="w-3 h-3" /> Admin Authorized
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-800 mb-2">Recruitment Command</h1>
            <p className="text-slate-500 text-sm font-bold tracking-wide">Evaluate, interview, and onboard top developers.</p>
          </div>
          <div className="flex gap-4 md:gap-8 bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl items-center shadow-inner">
            <div><p className="text-[10px] text-slate-400 uppercase font-black mb-1">Total Pool</p><p className="text-2xl font-black text-slate-700">1,402</p></div>
            <div className="border-l-2 border-slate-200 pl-4 md:pl-8 mr-2"><p className="text-[10px] text-slate-400 uppercase font-black mb-1">Passed Exams</p><p className="text-2xl font-black text-emerald-500">89</p></div>
            
            <button onClick={() => setShowCreateModal(true)} className="bg-white hover:bg-slate-50 text-indigo-600 border-2 border-slate-200 hover:border-indigo-200 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0">
              <Plus className="w-4 h-4 bg-indigo-50 p-0.5 rounded" /> Deploy Task
            </button>
          </div>
        </div>
      </div>
      
      {/* CANDIDATE LIST */}
      <div className="max-w-7xl mx-auto p-8 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-2xl">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-xl ${activeTab === tab ? 'text-indigo-600 bg-white shadow-sm border-2 border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border-2 border-transparent'}`}>{tab}</button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search skills or names..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white text-sm font-bold text-slate-700 border-2 border-slate-200 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-indigo-400 transition-colors shadow-sm placeholder:text-slate-300" />
          </div>
        </div>
        
        <div className="bg-white border-2 border-slate-100 rounded-[2rem] overflow-hidden shadow-sm mb-12">
          <div className="grid grid-cols-12 gap-4 p-5 border-b-2 border-slate-100 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div className="col-span-3">Candidate</div><div className="col-span-3">Origin / Track</div><div className="col-span-2">Score</div><div className="col-span-2">Tech Stack</div><div className="col-span-2 text-right">Actions</div>
          </div>
          <div className="divide-y-2 divide-slate-50">
            {filteredCandidates.map(c => (
              <div key={c.id} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-slate-50/50 transition-colors group">
                <div className="col-span-3 flex items-center gap-4"><div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-black text-xl shrink-0 shadow-sm ${c.avatar}`}>{c.name.charAt(0)}</div><div><p className="text-sm font-extrabold text-slate-800">{c.name}</p><p className="text-[10px] text-slate-400 font-bold mt-0.5 tracking-wider">{c.id}</p></div></div>
                <div className="col-span-3"><p className="text-xs text-slate-600 font-bold">{c.source}</p><p className="text-[10px] text-slate-400 font-bold mt-1 truncate tracking-wider">{c.track}</p></div>
                <div className="col-span-2"><p className="text-lg font-black text-slate-700 mb-0.5">{c.score}</p><span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border-2 ${c.status === 'Passed' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : c.status === 'Rejected' ? 'text-rose-600 bg-rose-50 border-rose-100' : 'text-slate-500 bg-slate-100 border-slate-200'}`}>{c.status}</span></div>
                <div className="col-span-2 flex flex-wrap gap-2">{c.skills.slice(0, 2).map(s => (<span key={s} className="text-[9px] font-bold text-slate-500 bg-white border-2 border-slate-200 px-2.5 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">{s}</span>))}</div>
                
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button 
                    onClick={() => openReview(c)} 
                    className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-100 hover:border-indigo-200 px-4 py-2.5 rounded-xl uppercase ml-2 transition-all shadow-sm"
                  >
                    Review <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🚨 ACTIVE PIPELINE TASKS (ADMIN MANAGEMENT GRID) 🚨 */}
        <div className="border-t-2 border-slate-100 pt-12 pb-8">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 mb-6">
            <Briefcase className="w-6 h-6 text-sky-500 bg-sky-50 p-1 rounded-lg" /> Active Pipeline Tasks
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminTasks.map(task => (
              <div key={task.id} className="bg-white border-2 border-slate-100 p-6 rounded-[2rem] relative group hover:border-indigo-200 transition-all shadow-sm hover:shadow-md">
                
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-20">
                  <button onClick={() => openEditModal(task)} className="text-slate-400 hover:text-indigo-600 bg-white/90 backdrop-blur-sm p-2.5 rounded-xl transition-colors border-2 border-slate-100 shadow-sm hover:scale-105" title="Edit Task"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteTask(task.id)} className="text-slate-400 hover:text-red-500 bg-white/90 backdrop-blur-sm p-2.5 rounded-xl transition-colors border-2 border-slate-100 shadow-sm hover:scale-105" title="Delete Task"><Trash2 className="w-4 h-4" /></button>
                </div>

                <div className="flex justify-between items-start mb-4">
                  <div className="text-[10px] font-black text-amber-600 bg-amber-50 border-2 border-amber-100 uppercase px-3 py-1.5 rounded-lg inline-flex items-center gap-1 shadow-sm">
                    {task.bounty_tier} <Gem className="w-3 h-3 fill-amber-200" />
                  </div>
                </div>
                
                <h3 className="font-extrabold text-slate-800 mb-4 text-lg leading-snug pr-16 line-clamp-2">
                  {task.title}
                </h3>
                
                {task.image_url && (
                  <div className="w-full h-24 mb-4 rounded-xl overflow-hidden border-2 border-slate-100 relative group-hover:border-indigo-200 transition-colors">
                    <img src={task.image_url} alt="Blueprint" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}

                <div className="flex items-center gap-3 mt-4 text-[10px] font-bold tracking-wider">
                  <span className={`px-2.5 py-1.5 rounded-lg uppercase ${
                    task.status === 'OPEN' ? 'bg-sky-50 text-sky-600 border-2 border-sky-100' : 
                    task.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600 border-2 border-amber-100' : 
                    'bg-emerald-50 text-emerald-600 border-2 border-emerald-100'
                  }`}>
                    {task.status}
                  </span>
                  <span className="text-slate-400 uppercase">
                    {task.department}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

// ==========================================
// 3. THE INTERN VIEW (Gamified)
// ==========================================
function InternTaskBoard({ currentUserId }: { currentUserId: string | null }) {
  const [tasks, setTasks] = useState<any[]>([])
  
  useEffect(() => { fetchTasks() }, [])

  async function fetchTasks() {
    const { data } = await supabase.from('corporate_tasks').select('*').order('status', { ascending: false }) 
    if (data) setTasks(data)
  }

  async function handleClaimTask(taskId: string) {
    if (!currentUserId) return
    await supabase.from('corporate_tasks').update({ status: 'IN_PROGRESS', assigned_to: currentUserId }).eq('id', taskId)
    await fetchTasks()
  }

  async function handleCompleteTask(taskId: string) {
    if (!currentUserId) return
    await supabase.from('corporate_tasks').update({ status: 'COMPLETED' }).eq('id', taskId)
    await fetchTasks()
  }

  // Helper to visually assign Gem Rewards based on tier
  const getGemReward = (tier: string) => {
    if (tier.includes('L2')) return 100;
    if (tier.includes('L3')) return 250;
    if (tier.includes('Capstone')) return 500;
    return 50; // L1 default
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50 transition-colors duration-500">
      <div className="p-8 md:p-12 text-slate-800 font-sans max-w-[1400px] mx-auto animate-fade-in">
        <div className="border-b-2 border-slate-200 pb-8 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Briefcase className="w-10 h-10 text-indigo-500 bg-indigo-50 p-2 rounded-2xl shadow-sm border-2 border-indigo-100" />
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-800">Internship Pipeline</h1>
          </div>
          <p className="text-slate-500 text-lg font-medium">Claim real client tasks, build in our internal IDE, and earn <span className="text-amber-500 font-bold">Gems 💎</span> by pushing to production.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* AVAILABLE TASKS COLUMN */}
          <div className="bg-slate-100 border-2 border-slate-200 rounded-[2rem] p-6 min-h-[60vh] flex flex-col shadow-inner">
            <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 border-b-2 border-slate-200 pb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-300 rounded-full"></div> Available Tasks
            </h2>
            <div className="space-y-5 flex-1">
              {tasks.filter(t => t.status === 'OPEN').map(task => (
                <div key={task.id} className="bg-white border-2 border-slate-200 p-6 rounded-3xl hover:border-indigo-300 transition-all shadow-sm hover:shadow group relative overflow-hidden">
                  
                  {task.image_url && (
                    <div className="w-full h-32 mb-5 rounded-2xl overflow-hidden border-2 border-slate-100 relative group-hover:border-indigo-200 transition-colors">
                      <img src={task.image_url} alt="Blueprint" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm border-2 border-slate-100 px-2.5 py-1.5 rounded-lg text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                        <ImageIcon className="w-3 h-3" /> Blueprint
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div className="text-[10px] font-black text-slate-500 bg-slate-50 border-2 border-slate-100 uppercase px-3 py-1.5 rounded-lg">{task.bounty_tier}</div>
                    
                    {/* GAMIFIED REWARD HINT */}
                    <div className="text-[11px] font-black text-amber-600 bg-amber-50 border-2 border-amber-100 px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
                      +{getGemReward(task.bounty_tier || '')} <Gem className="w-3.5 h-3.5 fill-amber-200" />
                    </div>
                  </div>
                  
                  <h3 className="font-black text-slate-800 mb-3 text-lg leading-snug">{task.title}</h3>
                  {task.description && <p className="text-sm text-slate-500 font-medium mb-5 line-clamp-3 leading-relaxed">{task.description}</p>}
                  
                  <div className="flex items-center justify-between mb-6 border-t-2 border-slate-100 pt-5">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{task.department}</p>
                    {task.deadline && (
                      <p className="text-xs font-black text-rose-500 flex items-center gap-1.5 bg-rose-50 px-2.5 py-1.5 rounded-lg border-2 border-rose-100 shadow-sm">
                        <Clock className="w-3.5 h-3.5" /> {task.deadline}
                      </p>
                    )}
                  </div>
                  
                  <button onClick={() => handleClaimTask(task.id)} className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold uppercase tracking-wider py-4 rounded-xl transition-all shadow-[0_4px_0_rgb(30,41,59)] hover:shadow-[0_2px_0_rgb(30,41,59)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none">Claim Assignment</button>
                </div>
              ))}
              {tasks.filter(t => t.status === 'OPEN').length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 bg-white/50 rounded-3xl">
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No active bounties</p>
                </div>
              )}
            </div>
          </div>

          {/* ACTIVE WORK COLUMN */}
          <div className="bg-indigo-50/50 border-2 border-indigo-100 rounded-[2rem] p-6 min-h-[60vh] flex flex-col shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Activity className="w-48 h-48 text-indigo-900" />
            </div>
            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-6 border-b-2 border-indigo-100 pb-4 flex items-center gap-2 relative z-10">
              <Activity className="w-4 h-4 animate-pulse" /> Your Active Work
            </h2>
            <div className="space-y-5 flex-1 relative z-10">
              {tasks.filter(t => t.status === 'IN_PROGRESS').map(task => (
                <div key={task.id} className="bg-white border-2 border-indigo-200 p-6 rounded-3xl relative overflow-hidden shadow-md">
                  
                  {task.image_url && (
                    <div className="w-full h-32 mb-5 rounded-2xl overflow-hidden border-2 border-slate-100 relative">
                      <img src={task.image_url} alt="Blueprint" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div className="text-[10px] font-black text-indigo-600 bg-indigo-50 border-2 border-indigo-100 uppercase px-3 py-1.5 rounded-lg inline-block shadow-sm">In Progress</div>
                    
                    <div className="text-[11px] font-black text-amber-600 bg-amber-50 border-2 border-amber-100 px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
                      +{getGemReward(task.bounty_tier || '')} <Gem className="w-3.5 h-3.5 fill-amber-200" />
                    </div>
                  </div>
                  
                  <h3 className="font-black text-slate-800 mb-3 text-lg leading-snug">{task.title}</h3>
                  {task.description && <p className="text-sm text-slate-500 font-medium mb-5 leading-relaxed">{task.description}</p>}
                  
                  <div className="flex items-center justify-between mb-6 border-t-2 border-slate-100 pt-5">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{task.department}</p>
                    {task.deadline && (
                      <p className="text-xs font-black text-rose-500 flex items-center gap-1.5 bg-rose-50 px-2.5 py-1.5 rounded-lg border-2 border-rose-100 shadow-sm">
                        <Clock className="w-3.5 h-3.5 animate-pulse" /> Due: {task.deadline}
                      </p>
                    )}
                  </div>

                  <div className="mb-6 bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl text-xs text-slate-600 font-bold flex items-start gap-3">
                    <Terminal className="w-5 h-5 text-indigo-500 shrink-0 bg-white p-1 rounded-md shadow-sm border border-slate-200" />
                    <p className="leading-relaxed">All development must be completed in the <Link href="/dashboard/workspace" className="text-indigo-600 underline underline-offset-2 hover:text-indigo-700 transition-colors">Apex Internal IDE</Link> before pushing to production.</p>
                  </div>
                  <button 
                    onClick={() => handleCompleteTask(task.id)} 
                    disabled={task.assigned_to !== currentUserId} 
                    className="btn-indigo w-full py-4 text-sm font-bold uppercase tracking-wider disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                  >
                    {task.assigned_to === currentUserId ? 'Deploy & Claim Reward' : 'Assigned to Another'}
                  </button>
                </div>
              ))}
              {tasks.filter(t => t.status === 'IN_PROGRESS').length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-indigo-200 bg-white/50 rounded-3xl">
                  <p className="text-sm text-indigo-400 font-bold uppercase tracking-widest">No active deployments</p>
                </div>
              )}
            </div>
          </div>

          {/* DEPLOYED COLUMN */}
          <div className="bg-emerald-50/30 border-2 border-emerald-100 rounded-[2rem] p-6 min-h-[60vh] flex flex-col shadow-inner">
            <h2 className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-6 border-b-2 border-emerald-100 pb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Deployed
            </h2>
            <div className="space-y-4 flex-1">
              {tasks.filter(t => t.status === 'COMPLETED').map(task => (
                <div key={task.id} className="bg-white border-2 border-emerald-100 p-5 rounded-3xl opacity-75 hover:opacity-100 transition-opacity shadow-sm">
                  <h3 className="font-extrabold text-slate-400 mb-3 text-base leading-snug line-through decoration-emerald-200 decoration-2">{task.title}</h3>
                  <div className="text-[10px] font-black text-emerald-500 mt-4 flex items-center justify-between border-t-2 border-slate-100 pt-4">
                    <span className="flex items-center gap-2 bg-emerald-50 px-2.5 py-1.5 rounded-lg border-2 border-emerald-100 shadow-sm"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Verified by QA</span>
                    
                    {/* GAMIFIED REWARD RECEIVED */}
                    <span className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2.5 py-1.5 rounded-lg border-2 border-amber-100 shadow-sm">
                      +{getGemReward(task.bounty_tier || '')} <Gem className="w-3 h-3 fill-amber-200" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function ShieldCheck(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
}