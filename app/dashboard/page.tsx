'use client'
import Link from 'next/link'
import { Terminal, Trophy, GraduationCap, ArrowRight, Activity } from 'lucide-react'

export default function DashboardOverview() {
  return (
    <div className="p-8 md:p-12 text-white font-sans max-w-6xl mx-auto animate-fade-in">
      
      <div className="mb-12">
        <h1 className="text-4xl font-black mb-2 tracking-tight">Developer Overview</h1>
        <p className="text-gray-400 text-lg">Welcome back to the Apex Studio ecosystem.</p>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#050505] border border-gray-800 p-6 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Terminal className="w-16 h-16" /></div>
          <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Workspace Status</div>
          <div className="text-3xl font-black text-blue-500 flex items-center gap-3">
            Online <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <div className="bg-[#050505] border border-gray-800 p-6 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy className="w-16 h-16" /></div>
          <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Active Hackathons</div>
          <div className="text-3xl font-black text-white">2 Live Events</div>
        </div>

        <div className="bg-[#050505] border border-gray-800 p-6 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><GraduationCap className="w-16 h-16" /></div>
          <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Open Internships</div>
          <div className="text-3xl font-black text-white">14 Bounties</div>
        </div>
      </div>

      {/* ACTION PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Workspace Launcher */}
        <div className="bg-gradient-to-br from-blue-900/20 to-black border border-blue-900/50 p-8 rounded-xl shadow-[0_0_30px_rgba(37,99,235,0.05)]">
          <Terminal className="w-10 h-10 text-blue-500 mb-6" />
          <h2 className="text-2xl font-bold mb-3">Launch Workspace</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Enter the proprietary Apex IDE. All active intern bounties and hackathon team projects must be completed within this secure environment.
          </p>
          <Link 
            href="/dashboard/workspace" 
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full justify-center"
          >
            Connect to Engine <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-6">
          {/* Hackathons Link */}
          <div className="bg-[#050505] border border-gray-800 p-6 rounded-xl hover:border-gray-600 transition-colors group relative overflow-hidden">
            <h3 className="text-xl font-bold mb-2 group-hover:text-white text-gray-200 transition-colors">The Hackathon Arena</h3>
            <p className="text-sm text-gray-500 mb-4">Compete in Free or Pro tiers for experience, certificates, and prize pools.</p>
            <div className="flex gap-4">
              <Link href="/dashboard/hackathon-free" className="text-xs font-bold uppercase tracking-widest text-green-500 hover:text-green-400">Free Tier →</Link>
              <Link href="/dashboard/hackathon-pro" className="text-xs font-bold uppercase tracking-widest text-orange-500 hover:text-orange-400">Pro Tier →</Link>
            </div>
          </div>

          {/* Internships Link */}
          <div className="bg-[#050505] border border-gray-800 p-6 rounded-xl hover:border-gray-600 transition-colors group relative overflow-hidden">
            <h3 className="text-xl font-bold mb-2 group-hover:text-white text-gray-200 transition-colors">Internship Pipeline</h3>
            <p className="text-sm text-gray-500 mb-4">Claim active company tasks, deploy to production, and earn official graded experience.</p>
            <Link href="/dashboard/internships" className="text-xs font-bold uppercase tracking-widest text-yellow-500 hover:text-yellow-400">
              View Board →
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}