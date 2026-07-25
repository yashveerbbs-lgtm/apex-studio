'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../utils/supabase'

export default function TournamentArena() {
  const [activeTab, setActiveTab] = useState<'open' | 'apex'>('open')
  const [isProcessing, setIsProcessing] = useState(false)
  const [registeredCircuits, setRegisteredCircuits] = useState<string[]>([])

  // Check database on load to see if the user is already registered
  useEffect(() => {
    checkRegistrations()
  }, [])

  async function checkRegistrations() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('tournament_registrations')
      .select('circuit_type')
      .eq('user_id', user.id)

    if (data) {
      setRegisteredCircuits(data.map(reg => reg.circuit_type))
    }
  }

  async function handleRegistration(tournamentName: string, circuitType: 'open' | 'apex') {
    setIsProcessing(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert("Operative not found. Disconnected from network.")
      setIsProcessing(false)
      return
    }

    const { error } = await supabase
      .from('tournament_registrations')
      .insert([
        {
          user_id: user.id,
          tournament_name: tournamentName,
          circuit_type: circuitType
        }
      ])

    setIsProcessing(false)

    if (error) {
      alert('Registration Protocol Failed: ' + error.message)
    } else {
      // Update UI state immediately without refreshing
      setRegisteredCircuits(prev => [...prev, circuitType])
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-end mb-10 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 uppercase tracking-widest mb-2">
              Tournament Arena
            </h1>
            <p className="text-gray-500 font-mono text-sm uppercase">Global Competitive Circuit // Live Registration</p>
          </div>
        </div>

        {/* Circuit Toggle */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('open')}
            className={`px-8 py-3 font-bold uppercase tracking-widest text-sm rounded transition-all ${
              activeTab === 'open' 
                ? 'bg-blue-900/40 text-blue-400 border border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                : 'bg-gray-900 text-gray-500 border border-gray-800 hover:text-white'
            }`}
          >
            Open Circuit (Free)
          </button>
          <button 
            onClick={() => setActiveTab('apex')}
            className={`px-8 py-3 font-bold uppercase tracking-widest text-sm rounded transition-all ${
              activeTab === 'apex' 
                ? 'bg-orange-900/40 text-orange-400 border border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]' 
                : 'bg-gray-900 text-gray-500 border border-gray-800 hover:text-white'
            }`}
          >
            Apex Circuit (Paid)
          </button>
        </div>

        {/* Tournament Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* OPEN CIRCUIT RENDER */}
          {activeTab === 'open' && (
            <div className="bg-gray-950 border border-blue-900/50 rounded-xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-bl-lg z-10">
                Registration Open
              </div>
              <h2 className="text-2xl font-black text-blue-400 uppercase tracking-wider mb-2">August Algorithmics</h2>
              <p className="text-gray-400 text-sm mb-6">A grueling endurance test of differential equations and complex data structures. Open to all ranks.</p>
              
              <div className="space-y-3 font-mono text-sm mb-8">
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">Entry Fee</span>
                  <span className="text-blue-400 font-bold">FREE</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">Reward Pool</span>
                  <span className="text-white">10,000 XP + Vanguard Badge</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">Start Date</span>
                  <span className="text-white">August 15, 2026</span>
                </div>
              </div>

              {registeredCircuits.includes('open') ? (
                <button disabled className="w-full bg-green-900/30 text-green-500 border border-green-800 py-3 rounded font-bold uppercase tracking-widest cursor-not-allowed">
                  [ Registered & Secured ]
                </button>
              ) : (
                <button 
                  onClick={() => handleRegistration('August Algorithmics', 'open')}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-wait"
                >
                  {isProcessing ? 'Processing...' : 'Enter Bracket'}
                </button>
              )}
            </div>
          )}

          {/* APEX CIRCUIT RENDER */}
          {activeTab === 'apex' && (
            <div className="bg-gray-950 border border-orange-900/50 rounded-xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-orange-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-bl-lg z-10">
                Qualifiers Active
              </div>
              <h2 className="text-2xl font-black text-orange-400 uppercase tracking-wider mb-2">The Work-Rate Protocol</h2>
              <p className="text-gray-400 text-sm mb-6">High-stakes competitive reasoning and physics algorithms. Secure your entry via secure ledger.</p>
              
              <div className="space-y-3 font-mono text-sm mb-8">
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">Entry Fee</span>
                  <span className="text-orange-400 font-bold">₹500 INR</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">Prize Pool</span>
                  <span className="text-green-400 font-bold">₹1,50,000 INR</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">Start Date</span>
                  <span className="text-white">August 22, 2026</span>
                </div>
              </div>

              {registeredCircuits.includes('apex') ? (
                <button disabled className="w-full bg-green-900/30 text-green-500 border border-green-800 py-3 rounded font-bold uppercase tracking-widest cursor-not-allowed">
                  [ Entry Confirmed ]
                </button>
              ) : (
                <button 
                  onClick={() => handleRegistration('The Work-Rate Protocol', 'apex')}
                  disabled={isProcessing}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-wait"
                >
                  {isProcessing ? 'Verifying...' : 'Submit Entry & Register'}
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </main>
  )
}