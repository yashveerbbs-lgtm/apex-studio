'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../utils/supabase'

// 1. Define the numerical hierarchy of your gamified ranks
const RANK_TIERS: Record<string, number> = {
  'NOVICE': 1,
  'VANGUARD': 2,
  'COMMANDER': 3,
  'APEX': 4
}

const jobListings = [
  { id: 1, title: 'Frontend Systems Engineer', company: 'Nexus Dynamics', type: 'Internship', stipend: '₹45,000 / mo', reqRank: 'COMMANDER', tags: ['React', 'Next.js', 'UI/UX'], isOpen: true },
  { id: 2, title: 'Smart Contract Auditor', company: 'Apex Financial', type: 'Contract', stipend: '₹1,50,000 total', reqRank: 'VANGUARD', tags: ['Solidity', 'Web3', 'Security'], isOpen: true },
  { id: 3, title: 'Physics Engine Developer', company: 'Polyhedron Labs', type: 'Full-Time', stipend: '₹14,00,000 / yr', reqRank: 'APEX', tags: ['C++', 'Math', 'Algorithms'], isOpen: true },
  { id: 4, title: 'Data Structures Tutor', company: 'EduTech India', type: 'Part-Time', stipend: '₹25,000 / mo', reqRank: 'NOVICE', tags: ['Python', 'DSA', 'Logic'], isOpen: false },
]

export default function RecruitmentBoard() {
  const [searchTerm, setSearchTerm] = useState('')
  // Hardcoding the current operative rank to COMMANDER for this test
  const [userRank, setUserRank] = useState('COMMANDER') 
  const [appliedJobs, setAppliedJobs] = useState<number[]>([])

  const filteredJobs = jobListings.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function handleApplication(jobId: number, reqRank: string) {
    const userTier = RANK_TIERS[userRank]
    const reqTier = RANK_TIERS[reqRank]

    if (userTier >= reqTier) {
      // Operative meets or exceeds the rank requirement
      setAppliedJobs(prev => [...prev, jobId])
      alert('Application successfully routed to corporate ledger.')
    } else {
      // Operative rank is too low
      alert(`ACCESS DENIED. This position requires ${reqRank} clearance. Keep grinding in the Arena.`)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-end mb-10 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-400 uppercase tracking-widest mb-2">
              Opportunities
            </h1>
            <p className="text-gray-500 font-mono text-sm uppercase">Verified Recruitment // Rank-Gated Access</p>
          </div>
          <div className="bg-gray-900 border border-yellow-900/50 px-6 py-2 rounded-lg text-right">
            <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Current Clearance</p>
            <p className="text-yellow-500 font-bold uppercase tracking-widest">{userRank}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input 
            type="text" 
            placeholder="Search roles, companies, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 p-4 rounded-lg focus:border-yellow-500 outline-none font-mono text-sm text-gray-300"
          />
        </div>

        {/* Job Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredJobs.map((job) => {
            const hasApplied = appliedJobs.includes(job.id)
            const isRankEligible = RANK_TIERS[userRank] >= RANK_TIERS[job.reqRank]

            return (
              <div key={job.id} className="bg-gray-950 border border-gray-800 p-6 rounded-xl hover:border-yellow-900/50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center group">
                
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-200">{job.title}</h2>
                    <span className="bg-gray-900 text-gray-400 border border-gray-700 text-xs px-2 py-1 rounded uppercase tracking-wider font-mono">
                      {job.type}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{job.company}</p>
                  <div className="flex gap-2">
                    {job.tags.map(tag => (
                      <span key={tag} className="text-xs text-yellow-500/70 bg-yellow-900/10 px-2 py-1 rounded font-mono">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end w-full md:w-auto border-t md:border-t-0 border-gray-800 pt-4 md:pt-0">
                  <div className="text-lg font-bold text-green-400 mb-1">{job.stipend}</div>
                  <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">
                    Req Rank: <span className={isRankEligible ? 'text-white font-bold' : 'text-red-500 font-bold'}>{job.reqRank}</span>
                  </div>
                  
                  {!job.isOpen ? (
                    <button disabled className="w-full md:w-auto bg-gray-900 text-gray-600 border border-gray-800 px-8 py-2 rounded font-bold uppercase tracking-widest text-sm cursor-not-allowed">
                      Position Filled
                    </button>
                  ) : hasApplied ? (
                    <button disabled className="w-full md:w-auto bg-green-900/20 text-green-500 border border-green-800 px-8 py-2 rounded font-bold uppercase tracking-widest text-sm cursor-not-allowed">
                      Applied
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleApplication(job.id, job.reqRank)}
                      className={`w-full md:w-auto px-8 py-2 rounded font-bold uppercase tracking-widest text-sm transition-all ${
                        isRankEligible 
                          ? 'bg-yellow-600/20 text-yellow-500 border border-yellow-600 hover:bg-yellow-600 hover:text-white' 
                          : 'bg-red-900/10 text-red-500 border border-red-900/50 hover:bg-red-900 hover:text-white'
                      }`}
                    >
                      Apply Now
                    </button>
                  )}
                </div>

              </div>
            )
          })}
        </div>

      </div>
    </main>
  )
}