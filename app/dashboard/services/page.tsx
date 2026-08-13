'use client'
import { useState, useEffect, useRef } from 'react'
import { Monitor, Smartphone, Gamepad2, Box, Cpu, ChevronLeft, Sparkles, HeartHandshake, ShieldCheck, Plus, X, Trash2, Edit2, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../../../utils/supabase'

const iconMap: Record<string, any> = {
  Cpu,
  Monitor,
  Smartphone,
  Gamepad2,
  Box,
  Sparkles
}

export default function AgencyServices() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<'ADMIN' | 'INTERN'>('INTERN')

  const [selectedService, setSelectedService] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newIconStr, setNewIconStr] = useState('Cpu')
  
  const [newImage, setNewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [services, setServices] = useState<any[]>([
    { 
      id: 'software', 
      title: 'Enterprise Software', 
      icon: Cpu, 
      desc: 'Custom backend architectures and scalable infrastructure, perfectly structured to support anything from local startups to major global alliances.',
      image: null
    },
    { 
      id: 'web', 
      title: 'Web Platforms', 
      icon: Monitor, 
      desc: 'High-performance web experiences and dynamic digital presentations that tell your story and truly captivate your audience.',
      image: null
    },
    { 
      id: 'app', 
      title: 'Mobile Applications', 
      icon: Smartphone, 
      desc: 'Intuitive, beautiful mobile apps that put your brand right into the hands of your community.',
      image: null
    },
    { 
      id: 'game', 
      title: 'Game Development', 
      icon: Gamepad2, 
      desc: 'Immersive worlds and engaging mechanics that leave players completely spellbound and always coming back for more.',
      image: null
    },
    { 
      id: '3d', 
      title: '3D & Spatial Modeling', 
      icon: Box, 
      desc: 'Breathtaking 3D environments, digital graphics, and character models—from industrial concepts to fierce, realistic sports-themed warriors.',
      image: null
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

  function handleImageProcess(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      setNewImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  function handleDeployService(e: React.FormEvent) {
    e.preventDefault()
    
    if (editingServiceId) {
      setServices(services.map(s => {
        if (s.id === editingServiceId) {
          return {
            ...s,
            title: newTitle,
            desc: newDesc,
            icon: iconMap[newIconStr],
            image: newImage || s.image
          }
        }
        return s
      }))
    } else {
      const newService = {
        id: `service-${Date.now()}`,
        title: newTitle,
        icon: iconMap[newIconStr],
        desc: newDesc,
        image: newImage
      }
      setServices([newService, ...services])
    }

    closeModal()
    alert(`System Update: Service successfully saved.`)
  }

  function openEditModal(service: any) {
    setEditingServiceId(service.id)
    setNewTitle(service.title)
    setNewDesc(service.desc)
    
    const iconEntry = Object.entries(iconMap).find(([key, val]) => val === service.icon)
    if (iconEntry) setNewIconStr(iconEntry[0])
    
    setNewImage(service.image || null)
    setShowCreateModal(true)
  }

  function closeModal() {
    setShowCreateModal(false)
    setEditingServiceId(null)
    setNewTitle('')
    setNewDesc('')
    setNewIconStr('Cpu')
    setNewImage(null)
  }

  function handleDeleteService(e: React.MouseEvent, serviceId: string) {
    e.stopPropagation()
    if (confirm("Are you sure you want to permanently remove this service offering from the storefront?")) {
      setServices(services.filter(s => s.id !== serviceId))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const clientData = {
      service_id: selectedService.id,
      service_title: selectedService.title,
      client_name: formData.get('clientName'),
      client_email: formData.get('clientEmail'),
      budget: formData.get('budget'),
      vision: formData.get('vision'),
      user_id: currentUser?.id 
    }
    
    try {
      const { error } = await supabase.from('service_requests').insert([clientData])
      if (error) throw error

      setIsSubmitting(false)
      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        setSelectedService(null)
      }, 4000)

    } catch (error: any) {
      alert(`Error submitting request: ${error.message}`)
      setIsSubmitting(false)
    }
  }

  if (selectedService) {
    return (
      <div className="h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-8 overflow-y-auto font-sans transition-colors duration-500">
        <button 
          onClick={() => setSelectedService(null)}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8 text-sm font-bold tracking-wider uppercase bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border-2 border-slate-100 dark:border-slate-800 w-fit hover:-translate-y-0.5 active:translate-y-0"
        >
          <ChevronLeft className="w-4 h-4" /> Back to all services
        </button>

        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative overflow-hidden transition-colors">
          
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-400"></div>

          <div className="flex items-center gap-5 mb-8 pb-8 border-b-2 border-slate-100 dark:border-slate-800 mt-2 transition-colors">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/50 border-2 border-indigo-100 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm transition-colors">
              <selectedService.icon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 mb-1 transition-colors">Let's build your {selectedService.title}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm transition-colors">We can't wait to hear what you have in mind. Tell us your story.</p>
            </div>
          </div>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-100 dark:border-emerald-800/50 rounded-full flex items-center justify-center mb-6 shadow-sm transition-colors">
                <HeartHandshake className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-3 transition-colors">We've got it!</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed font-medium transition-colors">
                Your vision is safely in our hands. Our engineering team is reviewing your notes, and we'll reach out very soon to chat about the next steps.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">What should we call you?</label>
                  <input type="text" name="clientName" required className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm font-bold text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="Your name or company..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Where can we reach you?</label>
                  <input type="email" name="clientEmail" required className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm font-bold text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="hello@yourdomain.com" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">What's your investment range?</label>
                <select name="budget" className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer">
                  <option>&lt; $5,000 (Let's build a prototype)</option>
                  <option>$5,000 - $20,000 (Minimum Viable Product)</option>
                  <option>$20,000 - $50,000 (Full-scale launch)</option>
                  <option>$50,000+ (Enterprise ecosystem)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Tell us about your vision</label>
                <textarea name="vision" required rows={5} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none" placeholder="Don't hold back! The more details you share about your goals, features, and dreams for this project, the better..."></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-indigo w-full py-4 text-sm mt-4 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Sending your ideas...' : (
                  <>Start the Journey <Sparkles className="w-4 h-4 fill-white" /></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-8 md:p-12 overflow-y-auto font-sans relative transition-colors duration-500">
      
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] max-w-lg w-full p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative overflow-hidden animate-in zoom-in-95 transition-colors">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-400"></div>

            <div className="flex justify-between items-center mb-6 border-b-2 border-slate-100 dark:border-slate-800 pb-4 mt-2 transition-colors">
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors">
                  {editingServiceId ? 'Edit Service' : 'Add New Service'}
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider font-bold transition-colors">Publish to Storefront</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 p-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 transition-all hover:-translate-y-0.5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeployService} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">Service Name</label>
                <input 
                  type="text" 
                  required 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                  placeholder="e.g. AI Integrations" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">Marketing Pitch</label>
                <textarea 
                  required 
                  value={newDesc} 
                  onChange={e => setNewDesc(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all h-24 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                  placeholder="Craft a compelling description..." 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">Service Icon</label>
                <select 
                  value={newIconStr} 
                  onChange={e => setNewIconStr(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="Cpu">CPU (Backend/Software)</option>
                  <option value="Monitor">Monitor (Web)</option>
                  <option value="Smartphone">Smartphone (Mobile)</option>
                  <option value="Gamepad2">Gamepad (Gaming)</option>
                  <option value="Box">Box (3D/Spatial)</option>
                  <option value="Sparkles">Sparkles (Creative/AI)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">Cover Background Image</label>
                <div className="flex items-center gap-4">
                  {newImage && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shrink-0 shadow-sm transition-colors">
                      <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setNewImage(null)} 
                        className="absolute top-1 right-1 bg-white dark:bg-slate-800 p-1 text-red-500 rounded-md shadow-sm hover:scale-105 transition-transform"
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
                    className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-700 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow"
                  >
                    <ImageIcon className="w-5 h-5" /> {newImage ? 'Replace Image' : 'Attach Cover Image'}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-indigo w-full py-4 text-sm mt-6"
              >
                {editingServiceId ? 'Save Changes' : 'Publish Service'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12 max-w-7xl mx-auto border-b-2 border-slate-100 dark:border-slate-800 pb-8 transition-colors">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 border-2 border-indigo-100 dark:border-indigo-800/50 px-3 py-1 rounded-lg font-black tracking-widest text-xs uppercase shadow-sm transition-colors">
              <Sparkles className="w-4 h-4 fill-indigo-200 dark:fill-indigo-900" /> Welcome to Apex Studio
            </div>
            {userRole === 'ADMIN' && (
              <div className="text-[10px] bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 border-2 border-amber-200 dark:border-amber-800/50 px-2.5 py-1 rounded-lg font-black uppercase tracking-widest flex items-center gap-1 shadow-sm transition-colors">
                <ShieldCheck className="w-3 h-3" /> Admin Auth
              </div>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-800 dark:text-slate-100 mb-4 transition-colors">
            Bring your vision to life.
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed transition-colors">
            Behind every great idea is a team that cares enough to build it right. Choose a canvas below, and let's start crafting your next major project together.
          </p>
        </div>

        {userRole === 'ADMIN' && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="shrink-0 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-100 dark:border-indigo-800/50 px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all mt-2 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-5 h-5 bg-indigo-50 dark:bg-indigo-900/50 p-0.5 rounded-md" /> Add Service
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => setSelectedService(service)}
            className="flex flex-col text-left bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-8 rounded-[2rem] hover:border-indigo-300 dark:hover:border-indigo-700 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group relative overflow-hidden"
          >
            {userRole === 'ADMIN' && (
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div 
                  onClick={(e) => { e.stopPropagation(); openEditModal(service); }}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-700 shadow-sm transition-colors hover:scale-105"
                  title="Edit Service"
                >
                  <Edit2 className="w-4 h-4" />
                </div>
                <div 
                  onClick={(e) => handleDeleteService(e, service.id)}
                  className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-700 shadow-sm transition-colors hover:scale-105"
                  title="Remove Service"
                >
                  <Trash2 className="w-4 h-4" />
                </div>
              </div>
            )}

            {service.image && (
              <img 
                src={service.image} 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover opacity-5 group-hover:opacity-10 z-0 transition-opacity" 
              />
            )}

            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-900/50 group-hover:bg-indigo-500 group-hover:text-white text-indigo-500 dark:text-indigo-400 rounded-2xl w-max mb-6 transition-all duration-300 shadow-sm border-2 border-indigo-100 dark:border-indigo-800/50 group-hover:border-indigo-600 relative z-10">
              <service.icon className="w-7 h-7" />
            </div>
            
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-3 relative z-10 transition-colors">{service.title}</h3>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed flex-1 relative z-10 transition-colors">
              {service.desc}
            </p>
            
            <div className="mt-8 pt-5 border-t-2 border-slate-100 dark:border-slate-800 w-full text-sm font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-between relative z-10">
              <span className="uppercase tracking-wider">Start building</span>
              <ChevronLeft className="w-5 h-5 rotate-180 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
        
        {services.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white/50 dark:bg-slate-900/50 transition-colors">
            <p className="text-sm text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold transition-colors">Storefront is currently empty</p>
          </div>
        )}
      </div>
    </div>
  )
}