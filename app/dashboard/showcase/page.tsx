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
      image: 'bg-gradient-to-br from-fuchsia-900 to-purple-950', // Uses Tailwind gradient classes by default
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
      image: 'bg-gradient-to-br from-blue-900 to-cyan-950',
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
      const gradients = ['from-fuchsia-900 to-purple-950', 'from-blue-900 to-cyan-950', 'from-emerald-900 to-teal-950', 'from-orange-900 to-red-950', 'from-gray-800 to-black']
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
    
    // If the image is a data URL/HTTP link, show it in the preview. If it's a CSS class (bg-gradient), leave it blank.
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
    <div className="h-full bg-[#050505] text-white overflow-y-auto font-sans relative">
      
      {/* 🚨 CREATION / EDIT MODAL 🚨 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className={`bg-[#0a0a0a] border rounded-xl max-w-2xl w-full p-8 shadow-2xl ${userRole === 'ADMIN' ? 'border-cyan-900/50' : 'border-gray-800'}`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  {editingProjectId ? 'Update Project Details' : (userRole === 'ADMIN' ? 'Deploy Official System' : 'Submit Community Project')}
                </h2>
                <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">Publish to Global Portfolio</p>
              </div>
              <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">System Title</label>
                <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-[#111111] text-sm text-white border border-gray-800 rounded p-3 focus:outline-none focus:border-cyan-500" placeholder="e.g. Next.js Analytics Dashboard" />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Architecture Description</label>
                <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-[#111111] text-sm text-gray-300 border border-gray-800 rounded p-3 focus:outline-none focus:border-cyan-500 h-24 resize-none" placeholder="Describe the stack, features, and purpose of this build..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full bg-[#111111] text-sm text-gray-300 border border-gray-800 rounded p-3 focus:outline-none focus:border-cyan-500">
                    <option value="Infrastructure (Web Apps)">Infrastructure (Web Apps)</option>
                    <option value="Interactive (Games)">Interactive (Games)</option>
                    <option value="Data & AI (Software)">Data & AI (Software)</option>
                    <option value="Asset Architecture (3D)">Asset Architecture (3D)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tech Stack Tags</label>
                  <input type="text" value={newTags} onChange={e => setNewTags(e.target.value)} className="w-full bg-[#111111] text-sm text-white border border-gray-800 rounded p-3 focus:outline-none focus:border-cyan-500" placeholder="e.g. React, Supabase, Tailwind" />
                </div>
              </div>

              {/* 🚨 NEW: IMAGE UPLOAD UI 🚨 */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Project Image / Thumbnail</label>
                <div className="flex items-center gap-4">
                  {newImage && (
                    <div className="relative w-16 h-16 rounded overflow-hidden border border-gray-700 shrink-0">
                      <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setNewImage(null)} className="absolute top-0 right-0 bg-red-600 p-1 text-white hover:bg-red-500 transition-colors"><X className="w-3 h-3"/></button>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={e => e.target.files && handleImageProcess(e.target.files[0])} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-[#111111] border border-gray-800 text-gray-400 hover:text-cyan-400 px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors w-full">
                    <ImageIcon className="w-4 h-4" /> {newImage ? 'Replace Image' : 'Attach Display Image'}
                  </button>
                </div>
              </div>

              <button type="submit" className={`w-full text-white text-xs font-bold uppercase tracking-widest py-4 rounded mt-6 transition-colors shadow-lg ${userRole === 'ADMIN' ? 'bg-cyan-700 hover:bg-cyan-600' : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'}`}>
                {editingProjectId ? 'Save Changes' : (userRole === 'ADMIN' ? 'Deploy Official Build' : 'Submit for Review')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Corporate Header */}
      <div className="border-b border-gray-800 bg-[#0a0a0a] pt-12 pb-8 px-8 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center gap-2 text-cyan-500 font-bold tracking-widest text-[10px] uppercase bg-cyan-950/30 px-3 py-1.5 rounded-sm border border-cyan-900/50">
                  <Globe className="w-3 h-3" /> Apex Studio Global Portfolio
                </div>
                <button 
                  onClick={() => setShowModal(true)}
                  className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors border ${
                    userRole === 'ADMIN' 
                      ? 'bg-cyan-900/30 text-cyan-400 border-cyan-900/50 hover:bg-cyan-900/50' 
                      : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Plus className="w-3 h-3" /> {userRole === 'ADMIN' ? 'Deploy System' : 'Submit Project'}
                </button>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">Engineering at Scale.</h1>
              <p className="text-gray-400 text-lg leading-relaxed font-light">Proprietary software architecture, AAA interactive mechanics, and enterprise-grade web infrastructure built by the Apex engineering division.</p>
            </div>
            
            <div className="flex gap-6 border-l border-gray-800 pl-6">
              <div><p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Global Uptime</p><p className="text-2xl font-mono text-green-400">99.99%</p></div>
              <div><p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Active Nodes</p><p className="text-2xl font-mono text-cyan-400">1,248</p></div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-gray-800 pt-6">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveTab(cat)} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === cat ? 'border-cyan-500 text-cyan-400 bg-cyan-950/10' : 'border-transparent text-gray-500 hover:border-gray-600 hover:text-gray-300'}`}>
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

            // Check if the image is a real uploaded picture or a CSS gradient
            const isCustomImage = project.image && !project.image.startsWith('bg-')

            return (
              <div key={project.id} className="bg-[#0a0a0a] border border-gray-800 rounded-lg overflow-hidden group hover:border-cyan-900/50 transition-colors shadow-xl flex flex-col md:flex-row relative">
                
                {canManage && (
                  <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(project)} className="text-gray-500 hover:text-blue-400 bg-black/50 hover:bg-black/80 backdrop-blur-sm p-2 rounded transition-colors border border-transparent hover:border-blue-900/50" title="Edit Project"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteProject(project.id)} className="text-gray-600 hover:text-red-500 bg-black/50 hover:bg-black/80 backdrop-blur-sm p-2 rounded transition-colors border border-transparent hover:border-red-900/50" title="Delete Project"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}

                {/* 🚨 DYNAMIC IMAGE RENDERING 🚨 */}
                <div className={`h-48 md:h-auto md:w-64 shrink-0 relative overflow-hidden flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-800 ${!isCustomImage ? project.image : 'bg-[#050505]'}`}>
                  
                  {isCustomImage && (
                    <img src={project.image} alt={project.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                  )}
                  
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                  
                  {!isCustomImage && <project.icon className="w-12 h-12 text-white/50 relative z-10" />}
                  
                  <div className={`absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-gray-700/50 px-2 py-1 rounded text-[9px] font-mono font-bold tracking-widest uppercase ${project.isOfficial ? 'text-green-400' : 'text-yellow-400'} z-10`}>
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${project.isOfficial ? 'bg-green-500' : 'bg-yellow-500'}`}></span> {project.status}
                  </div>
                </div>

                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between z-10">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight pr-16 mb-3">{project.title}</h2>
                    <div className="flex items-center gap-4 mb-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest border-b border-gray-800/50 pb-4">
                      <span className="flex items-center gap-1.5"><GitBranch className="w-3 h-3" /> {project.version}</span>
                      {project.isOfficial ? (
                        <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-cyan-600" /> Secure Build</span>
                      ) : (
                        <span className="flex items-center gap-1.5"><Users className="w-3 h-3 text-fuchsia-500" /> Community Build</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">{project.desc}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-2">Architecture Stack</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold text-cyan-100 bg-cyan-950/20 border border-cyan-900/30 px-2 py-1.5 rounded-sm uppercase tracking-wider">{tag}</span>
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