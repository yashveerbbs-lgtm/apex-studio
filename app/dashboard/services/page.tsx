'use client'
import { useState, useEffect, useRef } from 'react'
import { Monitor, Smartphone, Gamepad2, Box, Cpu, ChevronLeft, Sparkles, HeartHandshake, ShieldCheck, Plus, X, Trash2, Edit2, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../../../utils/supabase'

// Map strings to Lucide icons for the dynamic creation modal
const iconMap: Record<string, any> = {
  Cpu,
  Monitor,
  Smartphone,
  Gamepad2,
  Box,
  Sparkles
}

export default function AgencyServices() {
  // ROLE & AUTH STATE
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<'ADMIN' | 'INTERN'>('INTERN')

  // INTAKE FORM STATE
  const [selectedService, setSelectedService] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // 🚨 ADMIN CREATION & EDIT STATE 🚨
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newIconStr, setNewIconStr] = useState('Cpu')
  
  // 🚨 IMAGE UPLOAD STATE 🚨
  const [newImage, setNewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 🚨 DYNAMIC SERVICES STATE
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
    if (confirm("ADMIN OVERRIDE: Permanently remove this service offering from the storefront?")) {
      setServices(services.filter(s => s.id !== serviceId))
    }
  }

  // 🚨 REAL SUPABASE SUBMISSION LOGIC 🚨
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    // Grab all the data from the form inputs
    const formData = new FormData(e.currentTarget)
    const clientData = {
      service_id: selectedService.id,
      service_title: selectedService.title,
      client_name: formData.get('clientName'),
      client_email: formData.get('clientEmail'),
      budget: formData.get('budget'),
      vision: formData.get('vision'),
      user_id: currentUser?.id // Links the request to the logged-in user if available
    }
    
    try {
      // Send it to the new Supabase table
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

  // VIEW 1: THE WARM INTAKE FORM
  if (selectedService) {
    return (
      <div className="h-full bg-[#1e1e1e] text-white p-8 overflow-y-auto font-sans">
        <button 
          onClick={() => setSelectedService(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors mb-8 text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" /> Back to all services
        </button>

        <div className="max-w-2xl mx-auto bg-gradient-to-br from-[#252526] to-[#1e1e24] border border-gray-700/50 rounded-2xl p-8 md:p-10 shadow-2xl">
          <div className="flex items-center gap-5 mb-8 pb-8 border-b border-gray-700/50">
            <div className="p-4 bg-gradient-to-br from-blue-600/20 to-purple-600/20 text-blue-400 rounded-xl shadow-inner">
              <selectedService.icon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Let's build your {selectedService.title}</h2>
              <p className="text-gray-400 text-sm">We can't wait to hear what you have in mind. Tell us your story.</p>
            </div>
          </div>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                <HeartHandshake className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">We've got it!</h3>
              <p className="text-gray-400 max-w-sm leading-relaxed">
                Your vision is safely in our hands. Our engineering team is reviewing your notes, and we'll reach out very soon to chat about the next steps.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">What should we call you?</label>
                  {/* Added name="clientName" */}
                  <input type="text" name="clientName" required className="w-full bg-[#181818] border border-gray-700 rounded-lg p-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Your name or company..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Where can we reach you?</label>
                  {/* Added name="clientEmail" */}
                  <input type="email" name="clientEmail" required className="w-full bg-[#181818] border border-gray-700 rounded-lg p-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="hello@yourdomain.com" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">What's your investment range?</label>
                {/* Added name="budget" */}
                <select name="budget" className="w-full bg-[#181818] border border-gray-700 rounded-lg p-3.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer">
                  <option>&lt; $5,000 (Let's build a prototype)</option>
                  <option>$5,000 - $20,000 (Minimum Viable Product)</option>
                  <option>$20,000 - $50,000 (Full-scale launch)</option>
                  <option>$50,000+ (Enterprise ecosystem)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tell us about your vision</label>
                {/* Added name="vision" */}
                <textarea name="vision" required rows={5} className="w-full bg-[#181818] border border-gray-700 rounded-lg p-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none" placeholder="Don't hold back! The more details you share about your goals, features, and dreams for this project, the better..."></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-900/20 mt-4"
              >
                {isSubmitting ? 'Sending your ideas...' : (
                  <>Start the Journey <Sparkles className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  // VIEW 2: THE DIGITAL STOREFRONT
  return (
    <div className="h-full bg-[#1e1e1e] text-white p-8 md:p-12 overflow-y-auto font-sans relative">
      
      {/* 🚨 ADMIN CREATION & EDIT MODAL 🚨 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#1e1e1e] border border-blue-900/50 rounded-2xl max-w-lg w-full p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  {editingServiceId ? 'Edit Service Details' : 'Add New Service'}
                </h2>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Publish to Storefront</p>
              </div>
              <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeployService} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Service Name</label>
                <input 
                  type="text" 
                  required 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  className="w-full bg-[#181818] text-sm text-white border border-gray-700 rounded-lg p-3.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                  placeholder="e.g. AI Integrations" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Marketing Pitch (Description)</label>
                <textarea 
                  required 
                  value={newDesc} 
                  onChange={e => setNewDesc(e.target.value)} 
                  className="w-full bg-[#181818] text-sm text-gray-300 border border-gray-700 rounded-lg p-3.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-24 resize-none" 
                  placeholder="Craft a compelling description..." 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Service Icon</label>
                <select 
                  value={newIconStr} 
                  onChange={e => setNewIconStr(e.target.value)} 
                  className="w-full bg-[#181818] text-sm text-gray-300 border border-gray-700 rounded-lg p-3.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  <option value="Cpu">CPU (Backend/Software)</option>
                  <option value="Monitor">Monitor (Web)</option>
                  <option value="Smartphone">Smartphone (Mobile)</option>
                  <option value="Gamepad2">Gamepad (Gaming)</option>
                  <option value="Box">Box (3D/Spatial)</option>
                  <option value="Sparkles">Sparkles (Creative/AI)</option>
                </select>
              </div>

              {/* 🚨 NEW: IMAGE UPLOAD FIELD 🚨 */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Cover Background Image</label>
                <div className="flex items-center gap-4">
                  {newImage && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-700 shrink-0">
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
                    className="flex items-center justify-center gap-2 bg-[#181818] border border-gray-700 text-gray-400 hover:text-blue-400 px-4 py-3.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors w-full"
                  >
                    <ImageIcon className="w-4 h-4" /> {newImage ? 'Replace Image' : 'Attach Cover Image'}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold uppercase tracking-widest py-4 rounded-lg mt-6 transition-all shadow-lg shadow-blue-900/20"
              >
                {editingServiceId ? 'Save Changes' : 'Publish Service'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-blue-400 font-semibold tracking-wider text-sm uppercase">
              <Sparkles className="w-4 h-4" /> Welcome to Apex Studio
            </div>
            {/* 🚨 ADMIN SHIELD 🚨 */}
            {userRole === 'ADMIN' && (
              <div className="text-[10px] bg-red-950/30 text-red-400 border border-red-900/50 px-2.5 py-0.5 rounded font-bold uppercase tracking-widest flex items-center gap-1 ml-2">
                <ShieldCheck className="w-3 h-3" /> Admin Auth
              </div>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Bring your vision to life.
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Behind every great idea is a team that cares enough to build it right. Choose a canvas below, and let's start crafting your next major project together.
          </p>
        </div>

        {/* 🚨 ADMIN DEPLOY BUTTON 🚨 */}
        {userRole === 'ADMIN' && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="shrink-0 bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 border border-blue-900/50 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all mt-2 shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add Service
          </button>
        )}
      </div>

      {/* SERVICES GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => setSelectedService(service)}
            className="flex flex-col text-left bg-gradient-to-br from-[#252526] to-[#1e1e24] border border-gray-800/80 p-8 rounded-2xl hover:border-blue-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 group relative overflow-hidden"
          >
            {/* 🚨 ADMIN EDIT & DELETE BUTTONS 🚨 */}
            {userRole === 'ADMIN' && (
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div 
                  onClick={(e) => { e.stopPropagation(); openEditModal(service); }}
                  className="text-gray-400 hover:text-blue-400 bg-black/50 hover:bg-black/80 backdrop-blur-sm p-2 rounded-lg transition-all"
                  title="Edit Service"
                >
                  <Edit2 className="w-4 h-4" />
                </div>
                <div 
                  onClick={(e) => handleDeleteService(e, service.id)}
                  className="text-gray-400 hover:text-red-400 bg-black/50 hover:bg-black/80 backdrop-blur-sm p-2 rounded-lg transition-all"
                  title="Remove Service"
                >
                  <Trash2 className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* 🚨 DYNAMIC COVER IMAGE 🚨 */}
            {service.image && (
              <img 
                src={service.image} 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 z-0 transition-opacity" 
              />
            )}

            <div className="p-3.5 bg-[#181818] group-hover:bg-gradient-to-br group-hover:from-blue-500/20 group-hover:to-indigo-500/20 group-hover:text-blue-400 text-gray-400 rounded-xl w-max mb-6 transition-all duration-300 shadow-sm relative z-10">
              <service.icon className="w-7 h-7" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-100 mb-3 relative z-10">{service.title}</h3>
            
            <p className="text-sm text-gray-400 leading-relaxed flex-1 relative z-10">
              {service.desc}
            </p>
            
            <div className="mt-8 text-sm font-bold text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 transform group-hover:translate-x-1 relative z-10">
              Start building <ChevronLeft className="w-4 h-4 rotate-180" />
            </div>
          </button>
        ))}
        
        {services.length === 0 && (
          <div className="col-span-full py-20 text-center border border-dashed border-gray-700 rounded-2xl bg-[#252526]/50">
            <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Storefront is currently empty</p>
          </div>
        )}
      </div>
    </div>
  )
}