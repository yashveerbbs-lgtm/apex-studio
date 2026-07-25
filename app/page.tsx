'use client'
import Link from 'next/link'
import { Terminal, Code2, Cpu, Sparkles, ChevronRight, Server, ShieldCheck, Gamepad2, ArrowRight, Database } from 'lucide-react'
export default function ApexLandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-900/50">
      
      {/* NAVIGATION */}
      <nav className="border-b border-gray-800/50 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-8 h-8 text-cyan-500" />
            <span className="text-2xl font-black tracking-widest uppercase">Apex Studio</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400 tracking-widest uppercase">
            <Link href="#divisions" className="hover:text-cyan-400 transition-colors">Divisions</Link>
            <Link href="#infrastructure" className="hover:text-cyan-400 transition-colors">Infrastructure</Link>
          </div>
          <Link 
            href="/auth/login" 
            className="bg-white hover:bg-gray-200 text-black px-6 py-2.5 rounded-sm font-bold uppercase tracking-widest text-xs transition-colors"
          >
            Access Portal
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-40 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fuchsia-900/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 text-cyan-400 mb-8 font-bold tracking-widest text-[10px] uppercase bg-cyan-950/30 px-4 py-2 rounded-full border border-cyan-900/50">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span> Global Network Online
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-8 leading-[1.1]">
            Engineering the next <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">
              generation of software.
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            An elite digital agency and developer ecosystem. We build enterprise architecture for clients, and train the world's best engineers in our proprietary cloud academy.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/auth/login" 
              className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20 px-8 py-4 rounded-sm font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2"
            >
              Enter the Ecosystem <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="#divisions" 
              className="w-full sm:w-auto bg-[#111111] hover:bg-[#1a1a1a] border border-gray-800 text-gray-300 px-8 py-4 rounded-sm font-bold uppercase tracking-widest text-sm transition-all"
            >
              Explore Divisions
            </Link>
          </div>
        </div>
      </section>

      {/* CORE DIVISIONS SECTION */}
      <section id="divisions" className="py-24 bg-[#0a0a0a] border-y border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Core Divisions</h2>
            <p className="text-gray-400">The three pillars of the Apex Studio ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Agency Card */}
            <div className="bg-[#111111] border border-gray-800 p-8 rounded-lg hover:border-cyan-500/50 transition-colors group">
              <div className="w-14 h-14 bg-cyan-950/50 border border-cyan-900/50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-wide">Agency Services</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                Custom enterprise software, AAA interactive mechanics, and scalable web infrastructure built by our elite engineering teams.
              </p>
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                Request Build <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Academy Card */}
            <div className="bg-[#111111] border border-gray-800 p-8 rounded-lg hover:border-indigo-500/50 transition-colors group">
              <div className="w-14 h-14 bg-indigo-950/50 border border-indigo-900/50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Code2 className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-wide">Apex Academy</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                Master Next.js, Python, C++, and Go inside our proprietary cloud IDE. Write code, pass the blindfold exams, and secure internships.
              </p>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                Start Learning <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Hackathon Card */}
            <div className="bg-[#111111] border border-gray-800 p-8 rounded-lg hover:border-fuchsia-500/50 transition-colors group">
              <div className="w-14 h-14 bg-fuchsia-950/50 border border-fuchsia-900/50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-7 h-7 text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-wide">The Bounty Arena</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                Compete in high-stakes algorithmic challenges and complex system builds. Prove your skills against the best and win cash bounties.
              </p>
              <div className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                Enter Arena <ChevronRight className="w-4 h-4" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* INFRASTRUCTURE SECTION */}
      <section id="infrastructure" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-[#0a0a0a] to-[#111111] border border-gray-800 rounded-2xl p-8 md:p-16 flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative">
            
            {/* Background Tech Details */}
            <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
              <Server className="w-96 h-96 text-white" />
            </div>

            <div className="lg:w-1/2 relative z-10">
              <div className="inline-flex items-center gap-2 text-gray-400 mb-4 font-bold tracking-widest text-[10px] uppercase bg-gray-900 px-3 py-1.5 rounded-sm border border-gray-800">
                <Server className="w-3 h-3" /> Proprietary Tech
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
                An ecosystem built for absolute scale.
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                From the Dev Lounge social network to our in-browser Cloud IDE, the entire Apex platform runs on a unified, high-performance architecture.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-sm font-bold text-gray-300 tracking-wide">
                  <ShieldCheck className="w-5 h-5 text-cyan-500" /> Legal-Grade IP Protection & Clickwrap Contracts
                </li>
                <li className="flex items-center gap-3 text-sm font-bold text-gray-300 tracking-wide">
                  <Sparkles className="w-5 h-5 text-indigo-500" /> Automated Code Scanning & Grading Engine
                </li>
                <li className="flex items-center gap-3 text-sm font-bold text-gray-300 tracking-wide">
                  <Database className="w-5 h-5 text-fuchsia-500" /> Lightning-Fast Relational Data Processing
                </li>
              </ul>
            </div>

            <div className="lg:w-1/2 w-full relative z-10">
              {/* Mockup Window */}
              <div className="bg-[#050505] border border-gray-800 rounded-lg shadow-2xl overflow-hidden transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="h-8 bg-[#111111] border-b border-gray-800 flex items-center px-4 gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                </div>
                <div className="p-6 font-mono text-xs text-gray-400 leading-loose">
                  <span className="text-cyan-400">user@apex-studio</span>:<span className="text-blue-400">~</span>$ ./init_ecosystem.sh<br/>
                  <span className="text-gray-500">Initializing core components...</span><br/>
                  [ OK ] Booting Authentication Protocol<br/>
                  [ OK ] Connecting Supabase PostgreSQL<br/>
                  [ OK ] Injecting Next.js Edge Functions<br/>
                  <span className="text-green-400 font-bold mt-2 inline-block">System fully operational. Ready for deployment.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#050505] border-t border-gray-900 py-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Terminal className="w-5 h-5 text-gray-600" />
          <span className="text-lg font-black tracking-widest uppercase text-gray-600">Apex Studio</span>
        </div>
        <p className="text-xs text-gray-600 font-mono tracking-widest uppercase">
          © {new Date().getFullYear()} Apex Studio. All Rights Reserved.
        </p>
      </footer>
    </div>
  )
}