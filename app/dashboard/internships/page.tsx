'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '../../../utils/supabase'
import { Users, Search, FileCode, ChevronRight, Briefcase, Mail, Cpu, Award, Activity, CheckCircle, Terminal, Plus, X, Clock, Calendar, MessageSquare, Star, Trash2, Edit2, Image as ImageIcon } from 'lucide-react'

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
      <div className="h-full bg-[#050505] flex items-center justify-center font-mono text-cyan-500 text-sm animate-pulse tracking-widest uppercase">
        Authenticating Clearance Level...
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
  
  // 🚨 NEW: ADMIN MODAL STATE (Edit + Create) 🚨
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDept, setNewTaskDept] = useState('Engineering')
  const [newTaskTier, setNewTaskTier] = useState('L1 Bounty')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskDeadline, setNewTaskDeadline] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // 🚨 NEW: IMAGE UPLOAD STATE 🚨
  const [newImage, setNewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [adminTasks, setAdminTasks] = useState<any[]>([])

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [newScore, setNewScore] = useState('')
  const [newStatus, setNewStatus] = useState('')

  const [candidates, setCandidates] = useState([
    { id: 'APX-001', name: 'Sarah Jenkins', source: 'Academy Graduate', track: 'Full-Stack Next.js', score: '98%', status: 'Interviewing', skills: ['React', 'Supabase', 'TypeScript'], avatar: 'bg-indigo-900 text-indigo-400' },
    { id: 'APX-002', name: 'Rahul_Dev', source: 'Bounty Winner', track: 'Python Algorithmic Trading', score: '100%', status: 'Pending Review', skills: ['Python', 'Pandas', 'Machine Learning'], avatar: 'bg-fuchsia-900 text-fuchsia-400' },
    { id: 'APX-004', name: 'Priya_C++', source: 'Academy Graduate', track: '3D Game Engine Mechanics', score: '94%', status: 'Pending Review', skills: ['C++', 'Unreal Engine', '3D Math'], avatar: 'bg-emerald-900 text-emerald-400' }
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

  // 🚨 IMAGE UPLOAD LOGIC 🚨
  function handleImageProcess(file: File) {
    if (!file.type.startsWith('image/')) return alert('Please upload an image file.')
    const reader = new FileReader()
    reader.onload = (e) => setNewImage(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  // 🚨 ADMIN ACTION: DEPLOY OR UPDATE TASK 🚨
  async function handleSaveTask(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    if (editingTaskId) {
      // UPDATE EXISTING TASK
      const { error } = await supabase.from('corporate_tasks').update({
        title: newTaskTitle,
        department: newTaskDept,
        bounty_tier: newTaskTier,
        description: newTaskDescription,
        deadline: newTaskDeadline,
        image_url: newImage // Attach base64 image string
      }).eq('id', editingTaskId)

      if (!error) {
        alert("System Update: Task successfully updated.")
      } else {
        alert("Error updating task: " + error.message)
      }
    } else {
      // CREATE NEW TASK
      const { error } = await supabase.from('corporate_tasks').insert({
        title: newTaskTitle,
        department: newTaskDept,
        bounty_tier: newTaskTier,
        description: newTaskDescription,
        deadline: newTaskDeadline,
        status: 'OPEN',
        image_url: newImage // Attach base64 image string
      })

      if (!error) {
        alert("System Update: New internship task deployed to the ecosystem.")
      } else {
        alert("Error deploying task: " + error.message)
      }
    }

    closeModal()
    await fetchAdminTasks()
    setIsSubmitting(false)
  }

  // 🚨 ADMIN ACTION: OPEN EDIT MODAL 🚨
  function openEditModal(task: any) {
    setEditingTaskId(task.id)
    setNewTaskTitle(task.title)
    setNewTaskDept(task.department)
    setNewTaskTier(task.bounty_tier || 'L1 Bounty')
    setNewTaskDescription(task.description || '')
    setNewTaskDeadline(task.deadline || '')
    setNewImage(task.image_url || null) // Load existing image if any
    setShowCreateModal(true)
  }

  function closeModal() {
    setShowCreateModal(false)
    setEditingTaskId(null)
    setNewTaskTitle('')
    setNewTaskDescription('')
    setNewTaskDeadline('')
    setNewImage(null) // Clear image state
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm("ADMIN OVERRIDE: Are you sure you want to permanently delete this task from the ecosystem?")) return
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
    alert(`Feedback officially logged and sent to ${selectedCandidate.name}'s internal inbox.`)
  }

  return (
    <div className="h-full bg-[#050505] text-white overflow-y-auto font-sans relative">
      
      {/* CANDIDATE EVALUATION MODAL */}
      {showReviewModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#0a0a0a] border border-fuchsia-900/50 rounded-xl max-w-xl w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className={`w-10 h-10 rounded border border-gray-700 flex items-center justify-center font-bold text-lg shrink-0 ${selectedCandidate.avatar}`}>
                    {selectedCandidate.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight">{selectedCandidate.name}</h2>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedCandidate.id} • {selectedCandidate.track}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleEvaluateCandidate} className="space-y-6">
              <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Star className="w-3 h-3 text-yellow-500" /> Final Score (%)</label>
                  <input type="number" min="0" max="100" required value={newScore} onChange={e => setNewScore(e.target.value)} className="w-full bg-[#111111] text-xl font-mono font-bold text-white border border-gray-800 rounded p-3 focus:outline-none focus:border-fuchsia-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Update Status</label>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full bg-[#111111] text-sm font-bold text-gray-300 border border-gray-800 rounded p-4 focus:outline-none focus:border-fuchsia-500 uppercase tracking-wider">
                    <option value="Pending Review">Pending Review</option>
                    <option value="Interviewing">Advance to Interview</option>
                    <option value="Passed">Passed (Hire)</option>
                    <option value="Needs Revision">Needs Revision</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><MessageSquare className="w-3 h-3 text-cyan-500" /> Direct Feedback & Code Review</label>
                <textarea required value={feedbackText} onChange={e => setFeedbackText(e.target.value)} className="w-full bg-[#111111] text-sm text-gray-300 border border-gray-800 rounded p-4 focus:outline-none focus:border-fuchsia-500 h-32 resize-none leading-relaxed" placeholder="Write your feedback here... e.g., 'The backend architecture is excellent, but your database queries are unoptimized. Fix the N+1 issue in your route.ts and resubmit.'" />
              </div>

              <button type="submit" className="w-full bg-fuchsia-700 hover:bg-fuchsia-600 text-white text-xs font-bold uppercase tracking-widest py-4 rounded transition-colors shadow-lg shadow-fuchsia-900/20">
                Log Evaluation & Send Feedback
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🚨 ADMIN CREATION/EDIT MODAL 🚨 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#0a0a0a] border border-cyan-900/50 rounded-xl max-w-2xl w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  {editingTaskId ? 'Update Task Details' : 'Deploy New Task'}
                </h2>
                <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">Push assignment to Intern Board</p>
              </div>
              <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Task Title / Objective</label>
                <input type="text" required value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className="w-full bg-[#111111] text-sm text-white border border-gray-800 rounded p-3 focus:outline-none focus:border-cyan-500" placeholder="e.g. Migrate Landing Page to Next.js 14" />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Detailed Briefing & Requirements</label>
                <textarea required value={newTaskDescription} onChange={e => setNewTaskDescription(e.target.value)} className="w-full bg-[#111111] text-sm text-gray-300 border border-gray-800 rounded p-3 focus:outline-none focus:border-cyan-500 h-32 resize-none" placeholder="Provide full context, repo links, API keys needed, and exact deliverables expected from the intern..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Department</label>
                  <select value={newTaskDept} onChange={e => setNewTaskDept(e.target.value)} className="w-full bg-[#111111] text-sm text-gray-300 border border-gray-800 rounded p-3 focus:outline-none focus:border-cyan-500">
                    <option value="Engineering">Engineering</option>
                    <option value="Design (UI/UX)">Design (UI/UX)</option>
                    <option value="Data Science">Data Science</option>
                    <option value="3D Architecture">3D Architecture</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Clearance Tier</label>
                  <select value={newTaskTier} onChange={e => setNewTaskTier(e.target.value)} className="w-full bg-[#111111] text-sm text-gray-300 border border-gray-800 rounded p-3 focus:outline-none focus:border-cyan-500">
                    <option value="L1 Bounty">L1 Bounty</option>
                    <option value="L2 Bounty">L2 Bounty</option>
                    <option value="L3 Bounty">L3 Bounty</option>
                    <option value="Capstone Project">Capstone Project</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Time Limit (Deadline)</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="date" required value={newTaskDeadline} onChange={e => setNewTaskDeadline(e.target.value)} className="w-full bg-[#111111] text-sm text-gray-300 border border-gray-800 rounded py-3 pl-10 pr-3 focus:outline-none focus:border-cyan-500" />
                  </div>
                </div>
              </div>

              {/* 🚨 NEW: IMAGE UPLOAD FIELD 🚨 */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Task Blueprint / Design Mockup</label>
                <div className="flex items-center gap-4">
                  {newImage && (
                    <div className="relative w-16 h-16 rounded overflow-hidden border border-gray-700 shrink-0">
                      <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setNewImage(null)} 
                        className="absolute top-0 right-0 bg-red-600 p-1 text-white hover:bg-red-500 transition-colors"
                      >
                        <X className="w-3 h-3"/>
                      </button>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={e => e.target.files && handleImageProcess(e.target.files[0])} 
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    className="flex items-center justify-center gap-2 bg-[#111111] border border-gray-800 text-gray-400 hover:text-cyan-400 px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors w-full"
                  >
                    <ImageIcon className="w-4 h-4" /> {newImage ? 'Replace Blueprint' : 'Attach Blueprint Image'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest py-4 rounded mt-6 transition-colors shadow-lg">
                {isSubmitting ? 'Deploying to Org...' : (editingTaskId ? 'Save Changes' : 'Deploy Task to Production')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DASHBOARD HEADER */}
      <div className="border-b border-gray-800 bg-[#0a0a0a] pt-12 pb-8 px-8 md:px-12 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-cyan-500 mb-4 font-bold tracking-widest text-[10px] uppercase bg-cyan-950/30 px-3 py-1.5 rounded-sm border border-cyan-900/50">
              <ShieldCheck className="w-3 h-3" /> Admin Authorized
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Recruitment Command</h1>
            <p className="text-gray-400 text-sm font-mono tracking-wide">Evaluate, interview, and onboard top developers.</p>
          </div>
          <div className="flex gap-4 md:gap-8 bg-[#111111] border border-gray-800 p-4 rounded-lg items-center">
            <div><p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Total Pool</p><p className="text-xl font-mono text-white">1,402</p></div>
            <div className="border-l border-gray-800 pl-4 md:pl-8 mr-4"><p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Passed Exams</p><p className="text-xl font-mono text-green-400">89</p></div>
            
            <button onClick={() => setShowCreateModal(true)} className="bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-400 border border-cyan-900/50 px-4 py-2 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> Deploy Task
            </button>
          </div>
        </div>
      </div>
      
      {/* CANDIDATE LIST */}
      <div className="max-w-7xl mx-auto p-8 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-sm border ${activeTab === tab ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20' : 'border-gray-800 text-gray-500 hover:border-gray-600 bg-[#0a0a0a]'}`}>{tab}</button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search skills or names..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#0a0a0a] text-sm text-gray-200 border border-gray-800 rounded-sm pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-900/50 font-mono" />
          </div>
        </div>
        
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg overflow-hidden shadow-2xl mb-12">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-800 bg-[#111111] text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <div className="col-span-3">Candidate</div><div className="col-span-3">Origin / Track</div><div className="col-span-2">Score</div><div className="col-span-2">Tech Stack</div><div className="col-span-2 text-right">Actions</div>
          </div>
          <div className="divide-y divide-gray-800/50">
            {filteredCandidates.map(c => (
              <div key={c.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#111111] transition-colors group">
                <div className="col-span-3 flex items-center gap-3"><div className={`w-10 h-10 rounded border border-gray-700 flex items-center justify-center font-bold text-lg shrink-0 ${c.avatar}`}>{c.name.charAt(0)}</div><div><p className="text-sm font-bold text-gray-200">{c.name}</p><p className="text-[10px] text-gray-500 font-mono mt-0.5">{c.id}</p></div></div>
                <div className="col-span-3"><p className="text-xs text-gray-300 font-medium">{c.source}</p><p className="text-[10px] text-gray-500 font-mono truncate">{c.track}</p></div>
                <div className="col-span-2"><p className="text-lg font-mono text-white mb-0.5">{c.score}</p><span className={`text-[10px] font-bold uppercase ${c.status === 'Passed' ? 'text-green-500' : c.status === 'Rejected' ? 'text-red-500' : 'text-gray-500'}`}>{c.status}</span></div>
                <div className="col-span-2 flex flex-wrap gap-1.5">{c.skills.slice(0, 2).map(s => (<span key={s} className="text-[9px] font-bold text-gray-400 bg-gray-900 border border-gray-800 px-2 py-1 rounded-sm uppercase">{s}</span>))}</div>
                
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button 
                    onClick={() => openReview(c)} 
                    className="flex items-center gap-1 text-[10px] font-bold text-white bg-gray-800 hover:bg-fuchsia-900 hover:border-fuchsia-700 border border-transparent px-3 py-2 rounded-sm uppercase ml-2 transition-all shadow-lg"
                  >
                    Review <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🚨 ACTIVE PIPELINE TASKS (ADMIN MANAGEMENT GRID) 🚨 */}
        <div className="border-t border-gray-800 pt-12 pb-8">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mb-6">
            <Briefcase className="w-5 h-5 text-cyan-500" /> Active Pipeline Tasks
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminTasks.map(task => (
              <div key={task.id} className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-lg relative group hover:border-cyan-900/50 transition-all shadow-lg">
                
                {/* 🚨 ADMIN EDIT & DELETE BUTTONS 🚨 */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-20">
                  <button 
                    onClick={() => openEditModal(task)} 
                    className="text-gray-500 hover:text-blue-400 bg-black/50 hover:bg-black/80 backdrop-blur-sm p-2 rounded transition-colors border border-transparent hover:border-blue-900/50" 
                    title="Edit Task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteTask(task.id)} 
                    className="text-gray-600 hover:text-red-500 bg-black/50 hover:bg-black/80 backdrop-blur-sm p-2 rounded transition-colors border border-transparent hover:border-red-900/50" 
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 uppercase px-2 py-1 rounded inline-block mb-3">
                  {task.bounty_tier}
                </div>
                
                <h3 className="font-bold text-white mb-4 text-base leading-snug pr-16 line-clamp-2">
                  {task.title}
                </h3>
                
                {/* 🚨 RENDER BLUEPRINT THUMBNAIL IF IT EXISTS 🚨 */}
                {task.image_url && (
                  <div className="w-full h-24 mb-4 rounded overflow-hidden border border-gray-800 relative group-hover:border-cyan-900/50 transition-colors">
                    <img src={task.image_url} alt="Blueprint" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}

                <div className="flex items-center gap-3 mt-4 text-[10px] font-mono">
                  <span className={`px-2 py-1 rounded-sm uppercase tracking-widest font-bold ${
                    task.status === 'OPEN' ? 'bg-cyan-950/30 text-cyan-500 border border-cyan-900/50' : 
                    task.status === 'IN_PROGRESS' ? 'bg-yellow-950/30 text-yellow-500 border border-yellow-900/50' : 
                    'bg-green-950/30 text-green-500 border border-green-900/50'
                  }`}>
                    {task.status}
                  </span>
                  <span className="text-gray-500 uppercase tracking-widest">
                    {task.department}
                  </span>
                </div>
              </div>
            ))}
            
            {adminTasks.length === 0 && (
              <div className="col-span-full text-center py-12 border border-dashed border-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 font-mono uppercase tracking-widest">No Active Pipeline Tasks</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

// ==========================================
// 3. THE INTERN VIEW
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

  return (
    <div className="h-full overflow-y-auto bg-[#050505]">
      <div className="p-8 md:p-12 text-white font-sans max-w-7xl mx-auto animate-fade-in">
        <div className="border-b border-gray-800 pb-8 mb-8">
          <div className="flex items-center gap-3 mb-2"><Briefcase className="w-8 h-8 text-yellow-500" /><h1 className="text-4xl font-black tracking-tight">Internship Pipeline</h1></div>
          <p className="text-gray-400 text-lg">Claim real client tasks, build in our internal IDE, and push to production to earn graded certificates.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* AVAILABLE TASKS */}
          <div className="bg-[#050505] border border-gray-800 rounded-xl p-6 min-h-[50vh]">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4 border-b border-gray-800 pb-3 flex items-center gap-2"><div className="w-2 h-2 bg-gray-500 rounded-full"></div> Available Tasks</h2>
            <div className="space-y-4">
              {tasks.filter(t => t.status === 'OPEN').map(task => (
                <div key={task.id} className="bg-gray-900/50 border border-gray-800 p-5 rounded-lg hover:border-yellow-500/50 transition-all shadow-lg group">
                  
                  {/* 🚨 RENDER BLUEPRINT IF AVAILABLE 🚨 */}
                  {task.image_url && (
                    <div className="w-full h-32 mb-4 rounded overflow-hidden border border-gray-700 relative">
                      <img src={task.image_url} alt="Blueprint" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm border border-gray-600 px-2 py-1 rounded text-[9px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> Blueprint Attached
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-3">
                    <div className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 uppercase px-2 py-1 rounded">{task.bounty_tier}</div>
                  </div>
                  <h3 className="font-bold text-white mb-2 text-lg leading-snug">{task.title}</h3>
                  {task.description && <p className="text-sm text-gray-400 mb-4 line-clamp-3 leading-relaxed">{task.description}</p>}
                  
                  <div className="flex items-center justify-between mb-5 border-t border-gray-800 pt-4">
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">{task.department}</p>
                    {task.deadline && (
                      <p className="text-xs font-bold text-red-400 flex items-center gap-1.5 bg-red-950/30 px-2 py-1 rounded border border-red-900/50">
                        <Clock className="w-3 h-3" /> {task.deadline}
                      </p>
                    )}
                  </div>
                  
                  <button onClick={() => handleClaimTask(task.id)} className="w-full bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-widest py-3 rounded transition-colors group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">Claim Assignment</button>
                </div>
              ))}
              {tasks.filter(t => t.status === 'OPEN').length === 0 && (
                <div className="text-center py-12 border border-dashed border-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500 font-mono uppercase tracking-widest">No active bounties</p>
                </div>
              )}
            </div>
          </div>

          {/* ACTIVE WORK */}
          <div className="bg-[#050505] border border-yellow-900/30 rounded-xl p-6 min-h-[50vh] shadow-[0_0_20px_rgba(234,179,8,0.05)]">
            <h2 className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-4 border-b border-yellow-900/30 pb-3 flex items-center gap-2"><Activity className="w-4 h-4 animate-pulse" /> Your Active Work</h2>
            <div className="space-y-4">
              {tasks.filter(t => t.status === 'IN_PROGRESS').map(task => (
                <div key={task.id} className="bg-gradient-to-b from-yellow-950/20 to-black border border-yellow-900/50 p-5 rounded-lg relative overflow-hidden shadow-xl">
                  
                  {/* 🚨 RENDER BLUEPRINT IF AVAILABLE 🚨 */}
                  {task.image_url && (
                    <div className="w-full h-32 mb-4 rounded overflow-hidden border border-yellow-900/30 relative">
                      <img src={task.image_url} alt="Blueprint" className="w-full h-full object-cover opacity-80" />
                    </div>
                  )}

                  <div className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 uppercase px-2 py-1 rounded inline-block mb-3">{task.bounty_tier}</div>
                  <h3 className="font-bold text-white mb-2 text-lg leading-snug">{task.title}</h3>
                  {task.description && <p className="text-sm text-gray-400 mb-4 leading-relaxed">{task.description}</p>}
                  
                  <div className="flex items-center justify-between mb-6 border-t border-yellow-900/30 pt-4">
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">{task.department}</p>
                    {task.deadline && (
                      <p className="text-xs font-bold text-red-400 flex items-center gap-1.5 bg-red-950/30 px-2 py-1 rounded border border-red-900/50">
                        <Clock className="w-3 h-3 animate-pulse" /> Due: {task.deadline}
                      </p>
                    )}
                  </div>

                  <div className="mb-6 bg-[#0a0a0a] border border-gray-800 p-4 rounded text-xs text-gray-300 flex items-start gap-3">
                    <Terminal className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">All development must be completed in the <Link href="/dashboard/workspace" className="font-bold text-white underline hover:text-cyan-400 transition-colors">Apex Internal IDE</Link> before pushing to production.</p>
                  </div>
                  <button onClick={() => handleCompleteTask(task.id)} disabled={task.assigned_to !== currentUserId} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black text-xs font-bold uppercase tracking-widest py-3.5 rounded transition-colors shadow-lg disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-500">
                    {task.assigned_to === currentUserId ? 'Deploy to Production' : 'Assigned to Another'}
                  </button>
                </div>
              ))}
              {tasks.filter(t => t.status === 'IN_PROGRESS').length === 0 && (
                <div className="text-center py-12 border border-dashed border-yellow-900/30 rounded-lg">
                  <p className="text-sm text-yellow-900 font-mono uppercase tracking-widest">No active deployments</p>
                </div>
              )}
            </div>
          </div>

          {/* DEPLOYED */}
          <div className="bg-[#050505] border border-green-900/30 rounded-xl p-6 min-h-[50vh]">
            <h2 className="text-sm font-bold text-green-500 uppercase tracking-widest mb-4 border-b border-green-900/30 pb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Deployed</h2>
            <div className="space-y-4">
              {tasks.filter(t => t.status === 'COMPLETED').map(task => (
                <div key={task.id} className="bg-green-950/10 border border-green-900/30 p-5 rounded-lg opacity-75 hover:opacity-100 transition-opacity">
                  <h3 className="font-bold text-gray-300 mb-2 text-base leading-snug line-through decoration-green-900/50">{task.title}</h3>
                  <div className="text-[10px] font-bold text-green-500 mt-3 flex items-center justify-between border-t border-green-900/30 pt-3">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Verified by QA</span>
                    <span className="font-mono text-gray-600">{task.department}</span>
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