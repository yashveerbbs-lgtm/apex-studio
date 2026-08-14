'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabase'
import { CheckCircle2, Sparkles, Menu, X, BookOpen, HeartHandshake, Moon, Sun, Briefcase, Users, Trophy, Terminal, Code2 } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<'ADMIN' | 'INTERN' | 'EMPLOYER'>('INTERN')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const [showClickwrap, setShowClickwrap] = useState(false)
  const [showAssessment, setShowAssessment] = useState(false)
  const [hasAgreed, setHasAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [assessmentStep, setAssessmentStep] = useState(0)
  const [score, setScore] = useState(0)

  const examQuestions = [
    {
      question: "Which of the following best describes the purpose of a React useEffect dependency array?",
      options: [
        "It defines which variables trigger a re-render of the component.",
        "It determines when the effect should re-run based on variable changes.",
        "It stores state variables securely in local storage.",
        "It passes props down to child components."
      ],
      correct: 1
    },
    {
      question: "What is the primary benefit of creating an 'Index' in a relational database?",
      options: [
        "It compresses the database size to save cloud storage.",
        "It automatically backs up tables to prevent data loss.",
        "It drastically speeds up data retrieval (SELECT) operations.",
        "It encrypts sensitive row data automatically."
      ],
      correct: 2
    },
    {
      question: "What is the Big O time complexity of looking up a value in a perfectly balanced Binary Search Tree?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
      correct: 2
    }
  ]

  useEffect(() => {
    checkLegalStatus()
    const savedTheme = localStorage.getItem('apex_theme') || 'light'
    setTheme(savedTheme as 'light' | 'dark')
    if (savedTheme === 'dark') document.documentElement.classList.add('dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('apex_theme', newTheme)
    if (newTheme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }

  async function checkLegalStatus() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUser(user)
      
      let currentRole = 'INTERN'
      let onboardingDone = localStorage.getItem('bz_onboarding_done') === 'true'
      let ipSigned = localStorage.getItem('bz_ip_signed') === 'true'

      // 🚨 STRICT DB ROLE ENFORCEMENT
      const { data: profile } = await supabase.from('profiles').select('role, onboarding_completed, ip_agreement_signed').eq('id', user.id).single()
      
      if (profile) {
        currentRole = profile.role || 'INTERN'
        localStorage.setItem('apex_role', currentRole) // Sync UI purely to what the DB says
        if (profile.onboarding_completed) onboardingDone = true
        if (profile.ip_agreement_signed) ipSigned = true
      }
      
      setUserRole(currentRole as any)

      if (!ipSigned) {
        setShowClickwrap(true)
      } else if (!onboardingDone && currentRole === 'INTERN') {
        setShowAssessment(true)
      }
    }
  }

  async function handleSignAgreement() {
    if (!hasAgreed) return
    setIsSubmitting(true)
    
    localStorage.setItem('bz_ip_signed', 'true')
    
    if (currentUser) {
      await supabase.from('profiles').update({ 
        ip_agreement_signed: true 
      }).eq('id', currentUser.id)
    }
    
    setShowClickwrap(false)
    setIsSubmitting(false)
    
    if (userRole === 'INTERN') {
      setShowAssessment(true)
    }
  }

  function handleAnswer(selectedIndex: number) {
    if (selectedIndex === examQuestions[assessmentStep].correct) {
      setScore(score + 1)
    }
    
    if (assessmentStep < examQuestions.length - 1) {
      setAssessmentStep(assessmentStep + 1)
    } else {
      finishAssessment(score + (selectedIndex === examQuestions[assessmentStep].correct ? 1 : 0))
    }
  }

  async function finishAssessment(finalScore: number) {
    setIsSubmitting(true)
    let calculatedSkill = 'Rookie'
    if (finalScore === 2) calculatedSkill = 'Pro'
    if (finalScore === 3) calculatedSkill = 'Elite'

    localStorage.setItem('bz_onboarding_done', 'true')
    localStorage.setItem('apex_skill_level', calculatedSkill)

    if (currentUser) {
      await supabase.from('profiles').update({ 
        onboarding_completed: true,
        skill_level: calculatedSkill 
      }).eq('id', currentUser.id)
    }
    
    setTimeout(() => {
      setShowAssessment(false)
      setIsSubmitting(false)
    }, 1500)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  // 🚨 REMOVED toggleUserMode function entirely.

  const getLinkStyle = (path: string) => {
    if (pathname === path) return "block px-4 py-3 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-100 dark:border-indigo-500/30 rounded-xl transition-all"
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
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] max-w-lg w-full p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] animate-in zoom-in-95 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-100 dark:border-blue-800 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-sm">
              <HeartHandshake className="w-8 h-8 text-blue-500 dark:text-blue-400"/>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white text-center mb-2">Welcome to the Workspace!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-8 font-medium">Before we start building awesome things, let's review our community guidelines.</p>
            <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 p-5 rounded-2xl mb-6">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5"/>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">"I understand that the code and projects I build here are part of the Beyond Zero ecosystem. I'm ready to learn, collaborate, and respect the community's shared resources."</p>
              </div>
            </div>
            <div onClick={() => setHasAgreed(!hasAgreed)} className="flex items-center gap-3 cursor-pointer mb-8 group">
              <div className={`w-6 h-6 border-2 rounded-lg transition-all flex items-center justify-center ${hasAgreed ? 'bg-indigo-500 border-indigo-500' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                {hasAgreed && <CheckCircle2 className="w-4 h-4 text-white"/>}
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:text-slate-200 transition-colors select-none">I'm ready to start building!</span>
            </div>
            <button onClick={handleSignAgreement} disabled={!hasAgreed || isSubmitting} className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:shadow-none shadow-[0_4px_0_rgb(67,56,202)] hover:shadow-[0_2px_0_rgb(67,56,202)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]">
              {isSubmitting ? 'Processing...' : "Let's Go!"} 
            </button>
          </div>
        </div>
      )}

      {showAssessment && !showClickwrap && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] max-w-2xl w-full p-8 md:p-10 shadow-[0_20px_50px_rgb(0,0,0,0.15)] animate-in zoom-in-95 relative overflow-hidden transition-colors">
            
            {isSubmitting ? (
              <div className="text-center py-12 animate-in fade-in">
                <Terminal className="w-16 h-16 text-indigo-500 mx-auto mb-6 animate-pulse"/>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Analyzing Telemetry...</h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm">Calibrating your Beyond Zero workspace</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8 border-b-2 border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                      <Code2 className="w-6 h-6 text-indigo-500"/> Beyond Zero Placement Protocol
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Question {assessmentStep + 1} of {examQuestions.length}</p>
                  </div>
                  <div className="text-xl font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl border-2 border-indigo-100 dark:border-indigo-800">
                    {Math.round((assessmentStep / examQuestions.length) * 100)}%
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg md:text-xl font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
                    {examQuestions[assessmentStep].question}
                  </h3>
                </div>

                <div className="space-y-3">
                  {examQuestions[assessmentStep].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className="w-full text-left bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 p-4 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all shadow-sm hover:shadow"
                    >
                      <span className="inline-block bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 w-6 h-6 text-center rounded-md mr-3 text-xs leading-5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
      
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r-2 border-slate-100 dark:border-slate-800 flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${(showClickwrap || showAssessment) ? 'opacity-20 pointer-events-none blur-sm' : ''}`}>
        
        <div className="overflow-y-auto">
          <div className="p-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight flex items-center gap-2">
                BEYOND ZERO <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400"/>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full animate-pulse ${userRole === 'EMPLOYER' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                <span className={`text-[10px] tracking-wider font-bold uppercase ${userRole === 'EMPLOYER' ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {userRole === 'EMPLOYER' ? 'Employer Portal' : 'Student Hub'}
                </span>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-1 bg-slate-50 dark:bg-slate-800 rounded-lg"><X className="w-5 h-5"/></button>
          </div>

          <nav className="px-4 space-y-6 pb-6">
            {userRole === 'EMPLOYER' ? (
              <>
                <div>
                  <h2 className="text-[11px] font-extrabold text-slate-300 dark:text-slate-600 mb-2 tracking-widest uppercase px-4">Recruitment</h2>
                  <div className="space-y-1">
                    <Link href="/dashboard/employer" onClick="{()"> setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/employer')}>Candidate Pool</Link>
                    <Link href="/dashboard/internships" onClick="{()"> setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/internships')}>Manage Bounties</Link>
                  </div>
                </div>
                <div>
                  <h2 className="text-[11px] font-extrabold text-slate-300 dark:text-slate-600 mb-2 tracking-widest uppercase px-4">Talent Discovery</h2>
                  <div className="space-y-1">
                    <Link href="/dashboard/showcase" onClick="{()"> setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/showcase')}>Verified Builds</Link>
                    <Link href="/dashboard/hackathons" onClick="{()"> setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/hackathons')}>Sponsored Arenas</Link>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-[11px] font-extrabold text-slate-300 dark:text-slate-600 mb-2 tracking-widest uppercase px-4">Workspace</h2>
                  <div className="space-y-1">
                    <Link href="/dashboard/home" onClick="{()"> setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/home')}>Home</Link>
                    <Link href="/dashboard/internships" onClick="{()"> setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/internships')}>Internships</Link>
                  </div>
                </div>
                <div>
                  <h2 className="text-[11px] font-extrabold text-slate-300 dark:text-slate-600 mb-2 tracking-widest uppercase px-4">Learning</h2>
                  <div className="space-y-1">
                    <Link href="/dashboard/courses" onClick="{()"> setIsSidebarOpen(false)} className={getAcademyStyle('/dashboard/courses')}>Learning Courses</Link>
                    <Link href="/dashboard/services" onClick="{()"> setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/services')}>Services</Link>
                    <Link href="/dashboard/showcase" onClick="{()"> setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/showcase')}>Showcase</Link>
                  </div>
                </div>
                <div>
                  <h2 className="text-[11px] font-extrabold text-slate-300 dark:text-slate-600 mb-2 tracking-widest uppercase px-4">Community</h2>
                  <div className="space-y-1">
                    <Link href="/dashboard/community" onClick="{()"> setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/community')}>Dev Lounge</Link>
                    <Link href="/dashboard/hackathons" onClick="{()"> setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/hackathons')}>Live Arenas</Link>
                  </div>
                </div>
                <div>
                  <h2 className="text-[11px] font-extrabold text-slate-300 dark:text-slate-600 mb-2 tracking-widest uppercase px-4">Tools</h2>
                  <div className="space-y-1">
                    <Link href="/dashboard/workspace" onClick="{()"> setIsSidebarOpen(false)} className={getLinkStyle('/dashboard/workspace')}>Code Studio</Link>
                  </div>
                </div>
              </>
            )}
          </nav>
        </div>

        <div className="p-4 border-t-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-2 shrink-0">
           <button onClick={toggleTheme} className="w-full py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
             {theme === 'dark' ? <><Sun className="w-4 h-4 text-amber-400"/> Light Mode</> : <><Moon className="w-4 h-4 text-indigo-500"/> Dark Mode</>}
           </button>
           
           {/* 🚨 REMOVED the "Switch to Employer/Student" toggle button entirely */}

           <button onClick={handleSignOut} className="w-full py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-red-50 hover:border-red-200 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:border-red-900/50 dark:hover:text-red-400 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
             Log Out
           </button>
        </div>
      </aside>

      <main className={`flex-1 flex flex-col overflow-hidden relative transition-opacity ${(showClickwrap || showAssessment) ? 'opacity-20 pointer-events-none blur-sm' : ''}`}>
        <header className="md:hidden flex items-center justify-between p-4 border-b-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2">
             <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${userRole === 'EMPLOYER' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
             <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">BEYOND ZERO</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded-lg bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700">
            <Menu className="w-5 h-5"/>
          </button>
        </header>

        <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-slate-950">
          {children}
        </div>
      </main>
      
    </div>
  )
}