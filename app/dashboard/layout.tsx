'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabase'
import { CheckCircle2, Lock, Sparkles, Zap, UserX, Menu, X, BookOpen, HeartHandshake, Moon, Sun, Briefcase, Users, Search, Trophy } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  
  // Legal Clickwrap & Role State
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<'ADMIN' | 'INTERN' | 'EMPLOYER'>('INTERN')
  const [showClickwrap, setShowClickwrap] = useState(true)
  const [hasAgreed, setHasAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // MOBILE SIDEBAR & THEME STATE
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    checkLegalStatus()
    
    const savedTheme = localStorage.getItem('apex_theme') || 'light'
    setTheme(savedTheme as 'light' | 'dark')
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('apex_theme', newTheme)
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    window.dispatchEvent(new Event('themeChanged'))
  }

  async function checkLegalStatus() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUser(user)
      
      // 🚨 CHECK LOCAL STORAGE FIRST TO SYNC UI INSTANTLY
      const localRole = localStorage.getItem('apex_role')
      if (localRole) {
        setUserRole(localRole as any)
      } else {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        setUserRole(profile?.role || 'INTERN')
      }
    }
    setShowClickwrap(true)
  }

  async function handleSignAgreement() {
    if (!hasAgreed) return
    setIsSubmitting(true)
    
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

  async function toggleUserMode() {
    if (!currentUser) return 
    
    // Cycle between INTERN (Student) and EMPLOYER (Recruiter)
    const newRole = userRole === 'EMPLOYER' ? 'INTERN' : 'EMPLOYER'
    const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'User'
    
    // 🚨 SAVE LOCALLY AND TRIGGER EVENT TO UPDATE ALL PAGES INSTANTLY
    localStorage.setItem('apex_role', newRole)
    window.dispatchEvent(new Event('roleChanged')) 
    
    // Try to update DB (will fail silently if RLS is strict, which is fine now)
    await supabase.from('profiles').upsert({
      id: currentUser.id,
      display_name: displayName,
      role: newRole
    })
    
    setUserRole(newRole)
    if (newRole === 'EMPLOYER') {
      router.push('/dashboard/employer')
    } else {
      router.push('/dashboard/home')
    }
  }

  const getLinkStyle = (path: string) => {
    if (pathname === path) {
      return "block px-4 py-3 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-100 dark:border-indigo-500/30 rounded-xl transition-all"
    }
    return "block px-4 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
  }

  const getAcademyStyle = (path: string) => {
    if (pathname === path) {
      return "block px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-100 dark:border-emerald-500/30 rounded-xl transition-all"
    }
    return "block px-4 py-3 text-sm font-semibold text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-xl transition-all"
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 font-sans overflow-hidden relative transition-colors duration-500">
      
      {showClickwrap && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm font-sans p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] max-w-lg w-full p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] animate-in zoom-in-95 duration-300 relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-400"></div>

            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-100 dark:border-blue-800 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-sm">
              <HeartHandshake className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            </div>
            
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white text-center mb-2">
              Welcome to the Workspace!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-8 font-medium">
              Before we start building awesome things, let's quickly review our community guidelines.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 p-4 md:p-5 rounded-2xl mb-6">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  "I understand that the code and projects I build here are part of the Apex Studio ecosystem. I'm ready to learn, collaborate, and respect the community's shared resources."
                </p>
              </div>
            </div>

            <div 
              onClick={() => setHasAgreed(!hasAgreed)}
              className="flex items-center gap-3 cursor-pointer mb-8 group"
            >
              <div className="relative flex items-center justify-center shrink-0">
                <div className={`w-6 h-6 border-2 rounded-lg transition-all flex items-center justify-center ${hasAgreed ? 'bg-indigo-500 border-indigo-500' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                  {hasAgreed && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors select-none">
                I'm ready to start building!
              </span>
            </div>

            <button 
              onClick={handleSignAgreement}
              disabled={!hasAgreed || isSubmitting}
              className="w-full bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-bold py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:shadow-none shadow-[0_4px_0_rgb(67,56,202)] hover:shadow-[0_2px_0_rgb(67,56,202)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]"
            >
              {isSubmitting ? 'Loading Workspace...' : "Let's Go!"} 
              {!isSubmitting && <Sparkles className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r-2 border-slate-100 dark:border-slate-800 flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${showClickwrap ? 'opacity-20 pointer-events-none' : ''}`}>
        
        <div className="overflow-y-auto">
          <div className="p-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight flex items-center gap-2">
                APEX <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full animate-pulse ${userRole === 'EMPLOYER' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                <span className={`text-[10px] tracking-wider font-bold uppercase ${userRole === 'EMPLOYER' ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {userRole === 'EMPLOYER' ? 'Employer Portal' : 'Student Hub'}
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="md:hidden text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-1 bg-slate-50 dark:bg-slate-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="px-4 space-y-6 pb-6">
            
            {/* DUAL UI: EMPLOYER NAVIGATION */}
            {userRole === 'EMPLOYER' ? (
              <>
                <div>
                  <h2 className="text-[11px] font-extrabold text-slate-300 dark:text-slate-600 mb-2 tracking-widest uppercase px-4">Recruitment</h2>
                  <div className="space-y-1">
                    <Link href="/dashboard/employer" onClick={() => setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/employer')}>Candidate Pool</Link>
                    <Link href="/dashboard/internships" onClick={() => setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/internships')}>Manage Bounties</Link>
                  </div>
                </div>
                <div>
                  <h2 className="text-[11px] font-extrabold text-slate-300 dark:text-slate-600 mb-2 tracking-widest uppercase px-4">Talent Discovery</h2>
                  <div className="space-y-1">
                    <Link href="/dashboard/showcase" onClick={() => setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/showcase')}>Verified Builds</Link>
                    <Link href="/dashboard/hackathons" onClick={() => setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/hackathons')}>Sponsored Arenas</Link>
                  </div>
                </div>
              </>
            ) : (
              /* DUAL UI: STUDENT NAVIGATION */
              <>
                <div>
                  <h2 className="text-[11px] font-extrabold text-slate-300 dark:text-slate-600 mb-2 tracking-widest uppercase px-4">Workspace</h2>
                  <div className="space-y-1">
                    <Link href="/dashboard/home" onClick={() => setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/home')}>Home</Link>
                    <Link href="/dashboard/internships" onClick={() => setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/internships')}>Internships</Link>
                  </div>
                </div>
                <div>
                  <h2 className="text-[11px] font-extrabold text-slate-300 dark:text-slate-600 mb-2 tracking-widest uppercase px-4">Learning</h2>
                  <div className="space-y-1">
                    <Link href="/dashboard/courses" onClick={() => setIsSidebarOpen(false)} className={getAcademyStyle('/dashboard/courses')}>Learning Courses</Link>
                    <Link href="/dashboard/services" onClick={() => setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/services')}>Services</Link>
                    <Link href="/dashboard/showcase" onClick={() => setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/showcase')}>Showcase</Link>
                  </div>
                </div>
                <div>
                  <h2 className="text-[11px] font-extrabold text-slate-300 dark:text-slate-600 mb-2 tracking-widest uppercase px-4">Community</h2>
                  <div className="space-y-1">
                    <Link href="/dashboard/community" onClick={() => setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/community')}>Dev Lounge</Link>
                    <Link href="/dashboard/hackathons" onClick={() => setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/hackathons')}>Live Arenas</Link>
                  </div>
                </div>
                <div>
                  <h2 className="text-[11px] font-extrabold text-slate-300 dark:text-slate-600 mb-2 tracking-widest uppercase px-4">Tools</h2>
                  <div className="space-y-1">
                    <Link href="/dashboard/workspace" onClick={() => setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/workspace')}>Code Studio</Link>
                  </div>
                </div>
              </>
            )}

          </nav>
        </div>

        <div className="p-4 border-t-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-2 shrink-0">
           
           <button 
             onClick={toggleTheme}
             className="w-full py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
           >
             {theme === 'dark' ? <><Sun className="w-4 h-4 text-amber-400" /> Light Mode</> : <><Moon className="w-4 h-4 text-indigo-500" /> Dark Mode</>}
           </button>

           {/* SWITCH BETWEEN STUDENT AND EMPLOYER MODE */}
           <button 
             onClick={toggleUserMode} 
             className={`w-full py-3 border-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
               userRole === 'EMPLOYER' 
                 ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700/50 text-amber-600 dark:text-amber-400 shadow-sm' 
                 : 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-sm'
             }`}
           >
             {userRole === 'EMPLOYER' ? <><Users className="w-4 h-4" /> Switch to Student</> : <><Briefcase className="w-4 h-4" /> Switch to Employer</>}
           </button>

           <button 
             onClick={handleSignOut}
             className="w-full py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-red-50 hover:border-red-200 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:border-red-900/50 dark:hover:text-red-400 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
           >
             Log Out
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main className={`flex-1 flex flex-col overflow-hidden relative transition-opacity ${showClickwrap ? 'opacity-20 pointer-events-none' : ''}`}>
        
        <header className="md:hidden flex items-center justify-between p-4 border-b-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2">
             <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${userRole === 'EMPLOYER' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
             <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">APEX</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded-lg bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-slate-950">
          {children}
        </div>
      </main>
      
    </div>
  )
}