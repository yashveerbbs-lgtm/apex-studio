'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Terminal, Code2, Users, Briefcase, Zap, Sparkles, ShieldCheck } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[60%] h-[20%] bg-purple-600/10 blur-[100px] rounded-full mix-blend-screen"></div>
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgb(99,102,241,0.5)]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">BEYOND ZERO</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/auth/register" className="hover:text-white transition-colors">Academy</Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">For Employers</Link>
          </div>
          <div className="flex items-center gap-4">
            {/* 🚨 FIXED: Now points to the actual login screen */}
            <Link href="/auth/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            {/* 🚨 FIXED: Now points to the register screen */}
            <Link href="/auth/register" className="bg-white text-slate-950 hover:bg-slate-200 px-5 py-2.5 rounded-xl text-sm font-black transition-all shadow-[0_0_15px_rgb(255,255,255,0.2)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="pt-40 pb-20 px-6 max-w-7xl mx-auto text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full text-xs font-bold text-indigo-400 uppercase tracking-widest mb-8">
            <Zap className="w-3.5 h-3.5" /> The Next Generation of Engineering
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-[1.1]">
            Build the future. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
              Get hired on the spot.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Beyond Zero is a unified ecosystem where elite developers master new skills in the cloud, deploy real bounties, and get discovered by top tech companies.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register" className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_4px_0_rgb(67,56,202)] hover:translate-y-[2px] hover:shadow-[0_2px_0_rgb(67,56,202)] active:translate-y-[4px] active:shadow-none">
              Join as Developer <Code2 className="w-4 h-4" />
            </Link>
            <Link href="/auth/login" className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-slate-700">
              Hire Top Talent <Briefcase className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* HERO UI PREVIEW */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 relative mx-auto max-w-5xl"
        >
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-2 shadow-2xl backdrop-blur-xl">
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col">
              <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
              </div>
              <div className="p-8 text-left font-mono text-sm sm:text-base text-slate-300">
                <p><span className="text-pink-500">const</span> <span className="text-blue-400">developer</span> = <span className="text-pink-500">await</span> BeyondZero.<span className="text-emerald-400">train</span>();</p>
                <p className="mt-2"><span className="text-pink-500">if</span> (developer.<span className="text-blue-400">skills</span> === <span className="text-amber-300">'Elite'</span>) {'{'}</p>
                <p className="ml-4 mt-2">company.<span className="text-emerald-400">hire</span>(developer);</p>
                <p className="ml-4 mt-2">console.<span className="text-emerald-400">log</span>(<span className="text-amber-300">"Deploying to production..."</span>);</p>
                <p className="mt-2">{'}'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* FEATURES GRID */}
      <section id="features" className="py-24 bg-slate-950 border-t border-slate-800/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">Everything you need to scale.</h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto">Stop jumping between tutorials and job boards. Beyond Zero brings learning, coding, and recruitment into one unified platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 🚨 FIXED: Converted static divs into clickable Links pointing to registration */}
            <Link href="/auth/register" className="block bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-indigo-500/50 transition-colors group cursor-pointer">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3 group-hover:text-indigo-400 transition-colors">Cloud Code Studio</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Write, compile, and execute code directly in your browser. No local setup required. Backed by enterprise-grade infrastructure.</p>
            </Link>

            <Link href="/auth/register" className="block bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-emerald-500/50 transition-colors group cursor-pointer">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3 group-hover:text-emerald-400 transition-colors">Verified Bounties</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Complete real-world tasks and open-source bounties to earn Gems, XP, and verified credentials that employers actually trust.</p>
            </Link>

            <Link href="/auth/login" className="block bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-amber-500/50 transition-colors group cursor-pointer">
              <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3 group-hover:text-amber-400 transition-colors">Direct Recruitment</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Employers can search the talent pool based on actual code performance and completed projects, not just padded resumes.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <footer className="border-t border-slate-800/50 bg-slate-900/50 pt-20 pb-10 relative z-10 text-center">
        <h2 className="text-3xl font-black text-white mb-6">Ready to enter the ecosystem?</h2>
        <Link href="/auth/register" className="inline-block bg-white text-slate-950 hover:bg-slate-200 px-8 py-4 rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgb(255,255,255,0.2)] hover:scale-105">
          Launch Beyond Zero
        </Link>
        <p className="text-slate-600 text-xs mt-12 font-bold uppercase tracking-widest">© 2026 Beyond Zero. All rights reserved.</p>
      </footer>
    </div>
  )
}