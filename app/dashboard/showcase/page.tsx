'use client'
import { useState, useEffect, useRef } from 'react'
import { Server, MonitorPlay, Code2, Gamepad2, Box, ExternalLink, Activity, Globe, Cpu, GitBranch, ShieldCheck, Users, Plus, X, Trash2, Edit2, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../../../utils/supabase'

export default function EnterpriseShowcase() {
  // ROLE & AUTH STATE
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<'ADMIN' | 'INTERN'>('INTERN')

  // UI STATE
  const [activeTab, setActiveTab] = useState('All Systems')
  const categories = ['All Systems', 'Interactive (Games)', 'Infrastructure (Web Apps)', 'Data & AI (Software)', 'Asset Architecture (3D)']

  // SUBMISSION & EDIT MODAL STATE
  const [showModal, setShowModal] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Infrastructure (Web Apps)')
  const [newDesc, setNewDesc] = useState('')
  const [newTags, setNewTags] = useState('')
  
  // 🚨 NEW: IMAGE UPLOAD STATE 🚨
  const [newImage, setNewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // DYNAMIC PORTFOLIO STATE
  const [projects, setProjects] = useState([
    {
      id: 'proj-1',
      title: 'Neon Drift: Underworld',
      category: 'Interactive (Games)',
      image: 'bg-gradient-to-br from-fuchsia-400 to-purple-500', 
      version: 'v2.4.1-stable',
      status: 'Live Deployment',
      isOfficial: true, 
      authorId: 'system',
      desc: 'A high-speed cyberpunk racing game built in Unreal Engine 5. Features custom physics, Nanite virtualized geometry, and global multiplayer matchmaking deployed on AWS GameLift.',
      tags: ['C++', 'Unreal Engine 5', 'AWS', 'Multiplayer'],
      icon: Gamepad2
    },
    {
      id: 'proj-2',
      title: 'Predictr AI Engine',
      category: 'Data & AI (Software)',
      image: 'bg-gradient-to-br from-sky-400 to-indigo-500',
      version: 'v1.0.8-beta',
      status: 'Enterprise Beta',
      isOfficial: true,
      authorId: 'system',
      desc: 'A proprietary sports analytics dashboard used by professional coaching staff to predict match outcomes based on historical data. Processes 5M+ data points per minute.',
      tags: ['Python', 'TensorFlow', 'Pandas', 'PostgreSQL'],
      icon: Cpu
    }
  ])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setCurrentUser(user)
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile) setUserRole(profile.role)
      }
    })
  }, [])

  const filteredProjects = activeTab === 'All Systems' 
    ? projects 
    : projects.filter(p => p.category === activeTab)

  // 🚨 IMAGE UPLOAD LOGIC 🚨
  function handleImageProcess(file: File) {
    if (!file.type.startsWith('image/')) return alert('Please upload an image file.')
    const reader = new FileReader()
    reader.onload = (e) => setNewImage(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  // 🚨 PROJECT SUBMISSION & EDITING 🚨
  function handleSaveProject(e: React.FormEvent) {
    e.preventDefault()
    const tagsArray = newTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    
    let icon = Code2
    if (newCategory === 'Interactive (Games)') icon = Gamepad2
    if (newCategory === 'Data & AI (Software)') icon = Cpu
    if (newCategory === 'Asset Architecture (3D)') icon = Box

    // If Editing...
    if (editingProjectId) {
      setProjects(projects.map(p => {
        if (p.id === editingProjectId) {
          return { 
            ...p, 
            title: newTitle, 
            category: newCategory, 
            desc: newDesc, 
            tags: tagsArray.length > 0 ? tagsArray : ['Development'], 
            icon: icon,
            image: newImage || p.image // Keep old image if a new one wasn't uploaded
          }
        }
        return p
      }))
    } 
    // If Creating...
    else {
      const gradients = ['from-fuchsia-400 to-purple-500', 'from-sky-400 to-indigo-500', 'from-emerald-400 to-teal-500', 'from-amber-400 to-orange-500', 'from-slate-400 to-slate-600']
      const randomGradient = `bg-gradient-to-br ${gradients[Math.floor(Math.random() * gradients.length)]}`

      const newProject = {
        id: `proj-${Date.now()}`,
        title: newTitle,
        category: newCategory,
        image: newImage || randomGradient, // Use uploaded image, or fallback to random color
        version: userRole === 'ADMIN' ? 'v1.0.0-official' : 'v0.1.0-community',
        status: userRole === 'ADMIN' ? 'Live Deployment' : 'Community Beta',
        isOfficial: userRole === 'ADMIN',
        authorId: currentUser?.id,
        desc: newDesc,
        tags: tagsArray.length > 0 ? tagsArray : ['Development'],
        icon: icon
      }
      setProjects([newProject, ...projects])
    }
    closeModal()
  }

  // 🚨 OPEN EDIT MODAL 🚨
  function openEditModal(project: any) {
    setEditingProjectId(project.id)
    setNewTitle(project.title)
    setNewCategory(project.category)
    setNewDesc(project.desc)
    setNewTags(project.tags.join(', '))
    
    if (project.image && !project.image.startsWith('bg-')) {
      setNewImage(project.image)
    } else {
      setNewImage(null)
    }
    
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingProjectId(null)
    setNewTitle(''); setNewDesc(''); setNewTags(''); setNewImage(null)
  }

  function handleDeleteProject(projectId: string) {
    if (confirm("Are you sure you want to permanently delete this project?")) {
      setProjects(projects.filter(p => p.id !== projectId))
    }
  }

  return (
    <div className="h-full bg-slate-50 text-slate-800 overflow-y-auto font-sans relative transition-colors duration-500">
      
      {/* 🚨 CREATION / EDIT MODAL 🚨 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white border-2 border-slate-100 rounded-[2rem] max-w-2xl w-full p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] animate-in zoom-in-95 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 to-blue-500"></div>

            <div className="flex justify-between items-center mb-6 mt-2 border-b-2 border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {editingProjectId ? 'Update Project' : (userRole === 'ADMIN' ? 'Deploy Official System' : 'Submit Community Project')}
                </h2>
                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">Publish to Global Portfolio</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2.5 rounded-xl border-2 border-slate-200 transition-all hover:-translate-y-0.5"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">System Title</label>
                <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-slate-50 text-sm font-bold text-slate-800 border-2 border-slate-200 rounded-xl p-3.5 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300" placeholder="e.g. Next.js Analytics Dashboard" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Architecture Description</label>
                <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-slate-50 text-sm font-medium text-slate-800 border-2 border-slate-200 rounded-xl p-3.5 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all h-24 resize-none placeholder:text-slate-300" placeholder="Describe the stack, features, and purpose of this build..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full bg-slate-50 text-sm font-bold text-slate-700 border-2 border-slate-200 rounded-xl p-3.5 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all">
                    <option value="Infrastructure (Web Apps)">Infrastructure (Web Apps)</option>
                    <option value="Interactive (Games)">Interactive (Games)</option>
                    <option value="Data & AI (Software)">Data & AI (Software)</option>
                    <option value="Asset Architecture (3D)">Asset Architecture (3D)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tech Stack Tags</label>
                  <input type="text" value={newTags} onChange={e => setNewTags(e.target.value)} className="w-full bg-slate-50 text-sm font-bold text-slate-800 border-2 border-slate-200 rounded-xl p-3.5 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all placeholder:text-slate-300" placeholder="e.g. React, Supabase, Tailwind" />
                </div>
              </div>

              {/* 🚨 NEW: IMAGE UPLOAD UI 🚨 */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Image / Thumbnail</label>
                <div className="flex items-center gap-4">
                  {newImage && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-200 shrink-0 shadow-sm">
                      <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setNewImage(null)} className="absolute top-1 right-1 bg-white p-1 text-red-500 rounded-md shadow-sm hover:scale-105 transition-transform"><X className="w-3 h-3"/></button>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={e => e.target.files && handleImageProcess(e.target.files[0])} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors w-full shadow-sm hover:shadow">
                    <ImageIcon className="w-5 h-5" /> {newImage ? 'Replace Image' : 'Attach Display Image'}
                  </button>
                </div>
              </div>

              <button type="submit" className={`w-full py-4 text-sm mt-6 ${userRole === 'ADMIN' ? 'btn-indigo' : 'bg-white hover:bg-slate-50 text-indigo-600 border-2 border-slate-200 font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:translate-y-[2px]'}`}>
                {editingProjectId ? 'Save Changes' : (userRole === 'ADMIN' ? 'Deploy Official Build' : 'Submit for Review')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Corporate Header */}
      <div className="border-b-2 border-slate-100 bg-white pt-10 pb-8 px-8 md:px-12 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center gap-2 text-indigo-600 font-black tracking-widest text-[10px] uppercase bg-indigo-50 px-3 py-1.5 rounded-lg border-2 border-indigo-100 shadow-sm">
                  <Globe className="w-4 h-4" /> Apex Studio Global Portfolio
                </div>
                <button 
                  onClick={() => setShowModal(true)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm border-2 ${
                    userRole === 'ADMIN' 
                      ? 'bg-white text-indigo-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 hover:-translate-y-0.5' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Plus className="w-4 h-4" /> {userRole === 'ADMIN' ? 'Deploy System' : 'Submit Project'}
                </button>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-800 mb-4 leading-tight">Engineering at Scale.</h1>
              <p className="text-slate-500 text-lg leading-relaxed font-medium">Proprietary software architecture, AAA interactive mechanics, and enterprise-grade web infrastructure built by the Apex engineering division.</p>
            </div>
            
            <div className="flex gap-6 border-l-2 border-slate-100 pl-6 bg-slate-50 p-4 rounded-2xl shadow-inner border-2">
              <div><p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Global Uptime</p><p className="text-2xl font-black text-emerald-500">99.99%</p></div>
              <div className="border-l-2 border-slate-200 pl-6"><p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Active Nodes</p><p className="text-2xl font-black text-indigo-500">1,248</p></div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveTab(cat)} className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-xl border-2 ${activeTab === cat ? 'border-slate-200/50 text-indigo-600 bg-white shadow-sm' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Project Grid */}
      <div className="p-8 md:p-12">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {filteredProjects.map(project => {
            const isOwner = currentUser && project.authorId === currentUser.id
            const canManage = userRole === 'ADMIN' || isOwner

            const isCustomImage = project.image && !project.image.startsWith('bg-')

            return (
              <div key={project.id} className="bg-white border-2 border-slate-100 rounded-[2rem] overflow-hidden group hover:border-indigo-300 transition-colors shadow-sm hover:shadow-md flex flex-col md:flex-row relative">
                
                {canManage && (
                  <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(project)} className="text-slate-400 hover:text-indigo-600 bg-white/90 backdrop-blur-sm p-2.5 rounded-xl transition-colors border-2 border-slate-100 shadow-sm hover:scale-105" title="Edit Project"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteProject(project.id)} className="text-slate-400 hover:text-red-500 bg-white/90 backdrop-blur-sm p-2.5 rounded-xl transition-colors border-2 border-slate-100 shadow-sm hover:scale-105" title="Delete Project"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}

                {/* 🚨 DYNAMIC IMAGE RENDERING 🚨 */}
                <div className={`h-48 md:h-auto md:w-72 shrink-0 relative overflow-hidden flex items-center justify-center border-b-2 md:border-b-0 md:border-r-2 border-slate-100 ${!isCustomImage ? project.image : 'bg-slate-100'}`}>
                  
                  {isCustomImage && (
                    <img src={project.image} alt={project.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  
                  <div className="absolute inset-0 bg-white/10 group-hover:bg-white/0 transition-colors"></div>
                  
                  {!isCustomImage && <project.icon className="w-16 h-16 text-white/80 relative z-10 drop-shadow-md group-hover:scale-110 transition-transform duration-500" />}
                  
                  <div className={`absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border-2 border-slate-100 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-sm ${project.isOfficial ? 'text-emerald-600' : 'text-amber-600'} z-10`}>
                    <span className={`w-2 h-2 rounded-full animate-pulse ${project.isOfficial ? 'bg-emerald-500' : 'bg-amber-500'}`}></span> {project.status}
                  </div>
                </div>

                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between z-10">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight pr-16 mb-3">{project.title}</h2>
                    <div className="flex items-center gap-4 mb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b-2 border-slate-100 pb-4">
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border-2 border-slate-100"><GitBranch className="w-3.5 h-3.5" /> {project.version}</span>
                      {project.isOfficial ? (
                        <span className="flex items-center gap-1.5 text-emerald-600"><ShieldCheck className="w-3.5 h-3.5" /> Secure Build</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-purple-500"><Users className="w-3.5 h-3.5" /> Community Build</span>
                      )}
                    </div>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">{project.desc}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Architecture Stack</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border-2 border-indigo-100 px-2.5 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}