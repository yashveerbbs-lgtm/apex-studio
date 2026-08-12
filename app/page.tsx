'use client'
import Link from 'next/link'
import { Terminal, Code2, Cpu, Sparkles, ChevronRight, Server, ShieldCheck, Gamepad2, ArrowRight, Database } from 'lucide-react'

export default function ApexLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-200 transition-colors duration-500 overflow-hidden relative">
      
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-200/40 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-rose-200/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-emerald-200/30 rounded-full blur-[120px] pointer-events-none"></div>

      {/* NAVIGATION */}
      <nav className="border-b-2 border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 border-2 border-indigo-100 p-2 rounded-xl shadow-sm">
              <Terminal className="w-6 h-6 text-indigo-500" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-800">Apex Studio</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-xs font-black text-slate-400 tracking-wider uppercase">
            <Link href="#divisions" className="hover:text-indigo-600 transition-colors">Divisions</Link>
            <Link href="#infrastructure" className="hover:text-indigo-600 transition-colors">Infrastructure</Link>
          </div>
          <Link 
            href="/auth/login" 
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-wider text-xs transition-all shadow-[0_4px_0_rgb(67,56,202)] hover:shadow-[0_2px_0_rgb(67,56,202)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none"
          >
            Access Portal
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-40">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 text-emerald-600 mb-8 font-black tracking-widest text-[10px] uppercase bg-emerald-50 px-4 py-2.5 rounded-xl border-2 border-emerald-100 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> Global Network Online
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-800 mb-8 leading-[1.1]">
            Engineering the next <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 drop-shadow-sm">
              generation of software.
            </span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            An elite digital agency and developer ecosystem. We build enterprise architecture for clients, and train the world's best engineers in our proprietary cloud academy.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link 
              href="/auth/login" 
              className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider text-sm transition-all shadow-[0_4px_0_rgb(67,56,202)] hover:shadow-[0_2px_0_rgb(67,56,202)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none flex items-center justify-center gap-2"
            >
              Enter the Ecosystem <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="#divisions" 
              className="w-full sm:w-auto bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-600 px-8 py-4 rounded-xl font-black uppercase tracking-wider text-sm transition-all shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
            >
              Explore Divisions
            </Link>
          </div>
        </div>
      </section>

      {/* CORE DIVISIONS SECTION */}
      <section id="divisions" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-800 mb-4">Core Divisions</h2>
            <p className="text-slate-500 font-medium text-lg">The three pillars of the Apex Studio ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Agency Card */}
            <div className="bg-white border-2 border-slate-100 p-8 md:p-10 rounded-[2.5rem] hover:border-sky-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500 z-0"></div>
              
              <div className="w-16 h-16 bg-sky-50 border-2 border-sky-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm relative z-10">
                <Cpu className="w-8 h-8 text-sky-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-4 relative z-10">Agency Services</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10 relative z-10">
                Custom enterprise software, AAA interactive mechanics, and scalable web infrastructure built by our elite engineering teams.
              </p>
              <Link href="/auth/login" className="text-xs font-black text-sky-600 bg-sky-50 border-2 border-sky-100 px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all w-fit shadow-sm relative z-10">
                Request Build <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Academy Card */}
            <div className="bg-white border-2 border-slate-100 p-8 md:p-10 rounded-[2.5rem] hover:border-indigo-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500 z-0"></div>

              <div className="w-16 h-16 bg-indigo-50 border-2 border-indigo-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm relative z-10">
                <Code2 className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-4 relative z-10">Apex Academy</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10 relative z-10">
                Master Next.js, Python, C++, and Go inside our proprietary cloud IDE. Write code, pass the blindfold exams, and secure internships.
              </p>
              <Link href="/auth/login" className="text-xs font-black text-indigo-600 bg-indigo-50 border-2 border-indigo-100 px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all w-fit shadow-sm relative z-10">
                Start Learning <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Hackathon Card */}
            <div className="bg-white border-2 border-slate-100 p-8 md:p-10 rounded-[2.5rem] hover:border-rose-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500 z-0"></div>

              <div className="w-16 h-16 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm relative z-10">
                <Gamepad2 className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-4 relative z-10">The Bounty Arena</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10 relative z-10">
                Compete in high-stakes algorithmic challenges and complex system builds. Prove your skills against the best and win cash bounties.
              </p>
              <Link href="/auth/login" className="text-xs font-black text-rose-600 bg-rose-50 border-2 border-rose-100 px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all w-fit shadow-sm relative z-10">
                Enter Arena <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* INFRASTRUCTURE SECTION */}
      <section id="infrastructure" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-8 md:p-16 flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative shadow-sm">
            
            {/* Background Tech Details */}
            <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-[0.03] pointer-events-none">
              <Server className="w-[30rem] h-[30rem] text-indigo-900" />
            </div>

            <div className="lg:w-1/2 relative z-10">
              <div className="inline-flex items-center gap-2 text-indigo-600 mb-6 font-black tracking-widest text-[10px] uppercase bg-indigo-50 px-4 py-2 rounded-xl border-2 border-indigo-100 shadow-sm">
                <Server className="w-4 h-4" /> Proprietary Tech
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-800 mb-6 leading-tight">
                An ecosystem built for absolute scale.
              </h2>
              <p className="text-slate-500 font-medium text-lg leading-relaxed mb-8">
                From the Dev Lounge social network to our in-browser Cloud IDE, the entire Apex platform runs on a unified, high-performance architecture.
              </p>
              <ul className="space-y-5">
                <li className="flex items-center gap-4 text-sm font-bold text-slate-700 tracking-wide bg-slate-50 p-3 rounded-2xl border-2 border-slate-100">
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100"><ShieldCheck className="w-5 h-5 text-emerald-500" /></div> Legal-Grade IP Protection & Clickwrap Contracts
                </li>
                <li className="flex items-center gap-4 text-sm font-bold text-slate-700 tracking-wide bg-slate-50 p-3 rounded-2xl border-2 border-slate-100">
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100"><Sparkles className="w-5 h-5 text-indigo-500" /></div> Automated Code Scanning & Grading Engine
                </li>
                <li className="flex items-center gap-4 text-sm font-bold text-slate-700 tracking-wide bg-slate-50 p-3 rounded-2xl border-2 border-slate-100">
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100"><Database className="w-5 h-5 text-rose-500" /></div> Lightning-Fast Relational Data Processing
                </li>
              </ul>
            </div>

            <div className="lg:w-1/2 w-full relative z-10">
              {/* Gamified Light-Theme Mockup Window */}
              <div className="bg-slate-50 border-4 border-slate-200 rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.05)] overflow-hidden transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="h-12 bg-white border-b-2 border-slate-200 flex items-center px-5 gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-400 shadow-sm"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-sm"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-sm"></div>
                </div>
                <div className="p-8 font-mono text-sm text-slate-600 leading-loose bg-slate-50/50">
                  <span className="text-indigo-600 font-bold">user@apex-studio</span>:<span className="text-slate-400">~</span>$ ./init_ecosystem.sh<br/>
                  <span className="text-slate-400 font-bold mt-2 inline-block">Initializing core components...</span><br/>
                  <span className="text-emerald-500 font-black">[ OK ]</span> Booting Authentication Protocol<br/>
                  <span className="text-emerald-500 font-black">[ OK ]</span> Connecting Supabase PostgreSQL<br/>
                  <span className="text-emerald-500 font-black">[ OK ]</span> Injecting Next.js Edge Functions<br/>
                  <div className="mt-4 bg-emerald-100 text-emerald-700 border-2 border-emerald-200 px-4 py-2 rounded-xl font-black inline-block">System fully operational. Ready for deployment.</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t-2 border-slate-200 py-12 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="bg-slate-50 border-2 border-slate-200 p-1.5 rounded-lg">
            <Terminal className="w-5 h-5 text-slate-400" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-700">Apex Studio</span>
        </div>
        <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">
          © {new Date().getFullYear()} Apex Studio. All Rights Reserved.
        </p>
      </footer>
    </div>
  )
}