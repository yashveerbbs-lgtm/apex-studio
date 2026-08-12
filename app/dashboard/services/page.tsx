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

  // 🚨 SIH PIVOT: GOV-TECH SERVICES 🚨
  const [services, setServices] = useState<any[]>([
    { 
      id: 'software', 
      title: 'Smart City Infrastructure', 
      icon: Cpu, 
      desc: 'Scalable, highly-secure backend architectures built for national scale, supporting municipal data pipelines, IoT sensors, and critical public infrastructure.',
      image: null
    },
    { 
      id: 'web', 
      title: 'Citizen e-Portals', 
      icon: Monitor, 
      desc: 'High-performance, accessible web platforms that connect citizens directly to government services, subsidies, and public records with complete transparency.',
      image: null
    },
    { 
      id: 'app', 
      title: 'Public Utility Apps', 
      icon: Smartphone, 
      desc: 'Intuitive, multi-lingual mobile applications designed for public transit tracking, utility bill payments, and civic grievance reporting.',
      image: null
    },
    { 
      id: 'game', 
      title: 'Defense & Training Simulations', 
      icon: Gamepad2, 
      desc: 'Secure, immersive virtual environments and wargaming mechanics built for military training, disaster response, and tactical simulations.',
      image: null
    },
    { 
      id: '3d', 
      title: 'Urban Planning & 3D GIS', 
      icon: Box, 
      desc: 'Highly detailed 3D spatial modeling for city planning, topographical mapping, and smart grid visualization to aid policymaking.',
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
      <div className="h-full bg-slate-50 text-slate-800 p-8 overflow-y-auto font-sans transition-colors duration-500">
        <button 
          onClick={() => setSelectedService(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-8 text-sm font-bold tracking-wider uppercase bg-white px-4 py-2 rounded-xl shadow-sm border-2 border-slate-100 w-fit hover:-translate-y-0.5 active:translate-y-0"
        >
          <ChevronLeft className="w-4 h-4" /> Back to all services
        </button>

        <div className="max-w-2xl mx-auto bg-white border-2 border-slate-100 rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-400"></div>

          <div className="flex items-center gap-5 mb-8 pb-8 border-b-2 border-slate-100 mt-2">
            <div className="p-4 bg-indigo-50 border-2 border-indigo-100 text-indigo-600 rounded-2xl shadow-sm">
              <selectedService.icon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-800 mb-1">Commission {selectedService.title}</h2>
              <p className="text-slate-500 font-medium text-sm">Submit your departmental requirements or problem statement below.</p>
            </div>
          </div>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-50 border-2 border-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <HeartHandshake className="w-12 h-12 text-emerald-500" />
              </div>
              <h3 className="text-3xl font-black text-slate-800 mb-3">Proposal Received</h3>
              <p className="text-slate-500 max-w-sm leading-relaxed font-medium">
                Your vision is securely logged. Our national engineering division is reviewing your requirements and will reach out shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department / Ministry Name</label>
                  <input type="text" name="clientName" required className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="e.g. Ministry of Education..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Contact Email</label>
                  <input type="email" name="clientEmail" required className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="official@gov.in" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Project Scale / Budget Allocation</label>
                <select name="budget" className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer">
                  <option>Local / Municipal Prototype (₹5L - ₹10L)</option>
                  <option>State-Level Deployment (₹10L - ₹50L)</option>
                  <option>National Infrastructure (₹50L+)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Problem Statement Details</label>
                <textarea name="vision" required rows={5} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none" placeholder="Provide full details on the civic problem, required features, and scalability needs..."></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-indigo w-full py-4 text-sm mt-4 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Transmitting Securely...' : (
                  <>Submit Official Proposal <Sparkles className="w-4 h-4 fill-white" /></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-slate-50 text-slate-800 p-8 md:p-12 overflow-y-auto font-sans relative transition-colors duration-500">
      
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white border-2 border-slate-100 rounded-[2rem] max-w-lg w-full p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative overflow-hidden animate-in zoom-in-95">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-400"></div>

            <div className="flex justify-between items-center mb-6 border-b-2 border-slate-100 pb-4 mt-2">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {editingServiceId ? 'Edit Service' : 'Add Gov-Tech Service'}
                </h2>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">Publish to Government Portfolio</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl border-2 border-slate-200 transition-all hover:-translate-y-0.5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeployService} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Service Name</label>
                <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-slate-50 text-sm font-bold text-slate-800 border-2 border-slate-200 rounded-xl p-3.5 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400" placeholder="e.g. e-Governance APIs" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Service Pitch</label>
                <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-slate-50 text-sm font-medium text-slate-800 border-2 border-slate-200 rounded-xl p-3.5 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all h-24 resize-none placeholder:text-slate-400" placeholder="Craft a compelling description..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Service Icon</label>
                <select value={newIconStr} onChange={e => setNewIconStr(e.target.value)} className="w-full bg-slate-50 text-sm font-bold text-slate-700 border-2 border-slate-200 rounded-xl p-3.5 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer">
                  <option value="Cpu">CPU (Backend/Software)</option>
                  <option value="Monitor">Monitor (Web)</option>
                  <option value="Smartphone">Smartphone (Mobile)</option>
                  <option value="Gamepad2">Gamepad (Simulations)</option>
                  <option value="Box">Box (3D/Spatial)</option>
                  <option value="Sparkles">Sparkles (Creative/AI)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cover Background Image</label>
                <div className="flex items-center gap-4">
                  {newImage && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-200 shrink-0 shadow-sm">
                      <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setNewImage(null)} className="absolute top-1 right-1 bg-white p-1 text-red-500 rounded-md shadow-sm hover:scale-105 transition-transform"><X className="w-3 h-3"/></button>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={e => e.target.files && handleImageProcess(e.target.files[0])} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow w-full">
                    <ImageIcon className="w-5 h-5" /> {newImage ? 'Replace Image' : 'Attach Cover Image'}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-indigo w-full py-4 text-sm mt-6">
                {editingServiceId ? 'Save Changes' : 'Publish Service'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12 max-w-7xl mx-auto border-b-2 border-slate-100 pb-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 border-2 border-indigo-100 px-3 py-1 rounded-lg font-black tracking-widest text-xs uppercase shadow-sm">
              <ShieldCheck className="w-4 h-4 text-indigo-500" /> B2G Digital Infrastructure
            </div>
            {userRole === 'ADMIN' && (
              <div className="text-[10px] bg-amber-50 text-amber-600 border-2 border-amber-200 px-2.5 py-1 rounded-lg font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3 h-3" /> Admin Auth
              </div>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-800 mb-4">
            Build for the Nation.
          </h1>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            Apex Studio builds scalable, transparent, and secure digital infrastructure for government bodies, ministries, and smart cities. Choose a sector below to request an official build.
          </p>
        </div>

        {userRole === 'ADMIN' && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="shrink-0 bg-white hover:bg-slate-50 text-indigo-600 border-2 border-indigo-100 px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all mt-2 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-5 h-5 bg-indigo-50 p-0.5 rounded-md" /> Add Service
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => setSelectedService(service)}
            className="flex flex-col text-left bg-white border-2 border-slate-100 p-8 rounded-[2rem] hover:border-indigo-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group relative overflow-hidden"
          >
            {userRole === 'ADMIN' && (
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div onClick={(e) => { e.stopPropagation(); openEditModal(service); }} className="text-slate-400 hover:text-indigo-600 bg-white/90 backdrop-blur-sm p-2.5 rounded-xl border-2 border-slate-100 shadow-sm transition-colors hover:scale-105"><Edit2 className="w-4 h-4" /></div>
                <div onClick={(e) => { e.stopPropagation(); handleDeleteService(e, service.id); }} className="text-slate-400 hover:text-red-500 bg-white/90 backdrop-blur-sm p-2.5 rounded-xl border-2 border-slate-100 shadow-sm transition-colors hover:scale-105"><Trash2 className="w-4 h-4" /></div>
              </div>
            )}
            {service.image && (
              <img src={service.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-5 group-hover:opacity-10 z-0 transition-opacity" />
            )}
            <div className="p-3.5 bg-indigo-50 group-hover:bg-indigo-500 group-hover:text-white text-indigo-500 rounded-2xl w-max mb-6 transition-all duration-300 shadow-sm border-2 border-indigo-100 group-hover:border-indigo-600 relative z-10">
              <service.icon className="w-7 h-7" />
            </div>
            
            <h3 className="text-xl font-extrabold text-slate-800 mb-3 relative z-10">{service.title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed flex-1 relative z-10">{service.desc}</p>
            
            <div className="mt-8 pt-5 border-t-2 border-slate-100 w-full text-sm font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-between relative z-10">
              <span className="uppercase tracking-wider">Request Proposal</span>
              <ChevronLeft className="w-5 h-5 rotate-180 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}