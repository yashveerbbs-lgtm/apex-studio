'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabase'
import { ShieldAlert, CheckCircle2, Lock, Scale, Zap, UserX } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  
  // Legal Clickwrap & Role State
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<'ADMIN' | 'INTERN'>('INTERN')
  const [showClickwrap, setShowClickwrap] = useState(true) // ALWAYS default to true on load
  const [hasAgreed, setHasAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 🚨 SECURITY CLEARANCE CHECK 🚨
  // Only emails containing these strings will ever see the God Mode button
  const isExecutive = currentUser?.email?.toLowerCase().includes('yashveer') || currentUser?.email?.toLowerCase().includes('aparna')

  useEffect(() => {
    checkLegalStatus()
  }, [])

  async function checkLegalStatus() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUser(user)
      
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile) setUserRole(profile.role)
    }
    setShowClickwrap(true)
  }

  async function handleSignAgreement() {
    if (!hasAgreed) return
    setIsSubmitting(true)
    
    // Check if user is loaded to update backend, but don't trap them if it's slow!
    if (currentUser) {
      await supabase.auth.updateUser({
        data: { 
          ip_agreement_signed: true,
          ip_agreement_timestamp: new Date().toISOString(),
          ip_agreement_version: 'v1.1'
        }
      })
    }
    
    setShowClickwrap(false)
    setIsSubmitting(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  // 🚨 THE SECURE GOD MODE TOGGLE 🚨
  async function toggleGodMode() {
    if (!currentUser || !isExecutive) return // Double-lock backend protection
    
    const newRole = userRole === 'ADMIN' ? 'INTERN' : 'ADMIN'
    const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Executive'
    
    await supabase.from('profiles').upsert({
      id: currentUser.id,
      display_name: displayName,
      role: newRole
    })
    
    window.location.reload()
  }

  const getLinkStyle = (path: string) => {
    if (pathname === path) {
      return "block px-4 py-2.5 text-sm font-bold text-cyan-400 bg-cyan-900/20 border border-cyan-900/50 rounded transition-all"
    }
    return "block px-4 py-2.5 text-sm hover:text-cyan-300 hover:bg-gray-900/50 rounded transition-all"
  }

  const getAcademyStyle = (path: string) => {
    if (pathname === path) {
      return "block px-4 py-2.5 text-sm font-bold text-indigo-400 bg-indigo-900/20 border border-indigo-900/50 rounded transition-all"
    }
    return "block px-4 py-2.5 text-sm text-indigo-500 hover:text-indigo-400 hover:bg-gray-900/50 rounded transition-all"
  }

  return (
    <div className="flex h-screen bg-[#050505] text-gray-400 font-mono overflow-hidden relative">
      
      {showClickwrap && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md font-sans">
          <div className="bg-[#0a0a0a] border border-red-900/50 rounded-xl max-w-lg w-full p-8 shadow-2xl shadow-red-900/20 animate-in zoom-in duration-300">
            
            <div className="w-16 h-16 bg-red-950/30 border border-red-900/50 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Scale className="w-8 h-8 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-black text-white text-center mb-2 tracking-tight">
              Intellectual Property Release
            </h2>
            <p className="text-gray-400 text-center text-sm mb-8 leading-relaxed">
              Apex Studio operates proprietary commercial architecture. Before entering the ecosystem, you must agree to our standard IP & Code Contribution terms.
            </p>

            <div className="bg-[#111111] border border-gray-800 p-5 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300 leading-relaxed font-medium">
                  "I agree that all code, designs, algorithms, and digital assets I write, submit, or generate within this platform belong entirely to Apex Studio. I waive all rights to use, sell, or claim ownership over these digital assets."
                </p>
              </div>
            </div>

            {/* 🚨 FIXED FAIL-PROOF CHECKBOX 🚨 */}
            <div 
              onClick={() => setHasAgreed(!hasAgreed)}
              className="flex items-center gap-3 cursor-pointer mb-8 group"
            >
              <div className="relative flex items-center justify-center">
                <div className={`w-6 h-6 border-2 rounded transition-all flex items-center justify-center ${hasAgreed ? 'bg-cyan-600 border-cyan-500' : 'bg-[#111111] border-gray-700'}`}>
                  {hasAgreed && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
              </div>
              <span className="text-sm font-bold text-gray-400 group-hover:text-gray-200 transition-colors select-none">
                I have read and agree to the IP Release terms.
              </span>
            </div>

            <button 
              onClick={handleSignAgreement}
              disabled={!hasAgreed || isSubmitting}
              className="w-full bg-cyan-700 hover:bg-cyan-600 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-3.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
            >
              {isSubmitting ? 'Recording Signature...' : 'Accept & Enter Workspace'} 
              {!isSubmitting && <Lock className="w-4 h-4" />}
            </button>
            <p className="text-center text-[10px] text-gray-600 mt-4 font-mono uppercase tracking-widest">
              Secured via India IT Act 2000 Electronic Contract Standards
            </p>
          </div>
        </div>
      )}

      <aside className={`w-64 bg-[#0a0a0a] border-r border-gray-800 flex flex-col justify-between shrink-0 transition-opacity ${showClickwrap ? 'opacity-20 pointer-events-none' : ''}`}>
        
        <div className="overflow-y-auto">
          <div className="p-6">
            <h1 className="text-2xl font-black text-cyan-400 tracking-wider">APEX STUDIO</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <div className={`w-2 h-2 rounded-full animate-pulse ${userRole === 'ADMIN' ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className={`text-[10px] tracking-widest font-bold ${userRole === 'ADMIN' ? 'text-red-500' : 'text-gray-500'}`}>
                {userRole === 'ADMIN' ? '[ SYSTEM ADMIN ]' : 'DEVELOPER ECOSYSTEM'}
              </span>
            </div>
          </div>

          <nav className="px-4 space-y-8 mt-2 pb-6">
            <div>
              <h2 className="text-[10px] font-bold text-gray-600 mb-3 tracking-widest uppercase">Workspace</h2>
              <div className="space-y-1">
                <Link href="/dashboard/overview" className={getLinkStyle('/dashboard/overview')}>/ OVERVIEW</Link>
                <Link href="/dashboard/internships" className={getLinkStyle('/dashboard/internships')}>/ INTERNSHIPS</Link>
              </div>
            </div>
            <div>
              <h2 className="text-[10px] font-bold text-gray-600 mb-3 tracking-widest uppercase">Apex Divisions</h2>
              <div className="space-y-1">
                <Link href="/dashboard/courses" className={getAcademyStyle('/dashboard/courses')}>/ APEX ACADEMY</Link>
                <Link href="/dashboard/services" className={getLinkStyle('/dashboard/services')}>/ AGENCY SERVICES</Link>
                <Link href="/dashboard/showcase" className={getLinkStyle('/dashboard/showcase')}>/ APEX SHOWCASE</Link>
              </div>
            </div>
            <div>
              <h2 className="text-[10px] font-bold text-gray-600 mb-3 tracking-widest uppercase">Network</h2>
              <div className="space-y-1">
                <Link href="/dashboard/community" className={getLinkStyle('/dashboard/community')}>/ DEV LOUNGE</Link>
              </div>
            </div>
            <div>
              <h2 className="text-[10px] font-bold text-gray-600 mb-3 tracking-widest uppercase">Hackathon Arena</h2>
              <div className="space-y-1">
                <Link href="/dashboard/hackathons" className={getLinkStyle('/dashboard/hackathons')}>/ ACTIVE ARENAS</Link>
              </div>
            </div>
            <div>
              <h2 className="text-[10px] font-bold text-gray-600 mb-3 tracking-widest uppercase">Proprietary Tools</h2>
              <div className="space-y-1">
                <Link href="/dashboard/workspace" className={getLinkStyle('/dashboard/workspace')}>/ IN-HOUSE IDE & CHAT</Link>
              </div>
            </div>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800 bg-[#0a0a0a] flex flex-col gap-2">
           {/* EXCLUSIVE EXECUTIVE TOGGLE BUTTON */}
           {isExecutive && (
             <button 
               onClick={toggleGodMode} 
               className={`w-full py-3 border text-xs font-bold tracking-widest rounded transition-colors flex items-center justify-center gap-2 ${
                 userRole === 'ADMIN' 
                   ? 'bg-gray-900/50 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500' 
                   : 'bg-red-950/20 border-red-900/50 text-red-500 hover:bg-red-900/40'
               }`}
             >
               {userRole === 'ADMIN' ? <><UserX className="w-3.5 h-3.5" /> DISABLE GOD MODE</> : <><Zap className="w-3.5 h-3.5" /> ENABLE GOD MODE</>}
             </button>
           )}
           <button 
             onClick={handleSignOut}
             className="w-full py-3 border border-red-900/50 text-red-500 text-xs font-bold tracking-widest hover:bg-red-900/30 rounded transition-colors flex items-center justify-center gap-2"
           >
             [ DISCONNECT ]
           </button>
        </div>
      </aside>

      <main className={`flex-1 overflow-hidden relative transition-opacity ${showClickwrap ? 'opacity-20 pointer-events-none' : ''}`}>
        {children}
      </main>
      
    </div>
  )
}