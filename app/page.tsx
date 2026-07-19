'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import Editor from '@monaco-editor/react'

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [user, setUser] = useState<any>(null)
  const [userXp, setUserXp] = useState<number>(0)
  const [challenges, setChallenges] = useState<any[]>([])
  
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard'>('challenges')
  
  const [activeChallenge, setActiveChallenge] = useState<any>(null)
  const [code, setCode] = useState<string>('  // Write your logic here...\n  \n  return 0;')
  const [isExecuting, setIsExecuting] = useState<boolean>(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserSession(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserSession(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleUserSession(currentUser: any) {
    setUser(currentUser)
    if (currentUser) {
      fetchChallenges()
      fetchUserXp(currentUser.id)
      fetchLeaderboard() 
      
      const { data } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single()
      if (!data) {
         await supabase.from('profiles').insert([{ id: currentUser.id, email: currentUser.email, xp_balance: 0 }])
      }
    }
  }

  async function fetchUserXp(userId: string) {
    const { data, error } = await supabase.from('profiles').select('xp_balance').eq('id', userId).single()
    if (!error && data) setUserXp(data.xp_balance)
  }

  async function fetchChallenges() {
    const { data, error } = await supabase.from('challenges').select('*').order('points', { ascending: true })
    if (error) console.error('Error fetching challenges:', error.message)
    else setChallenges(data)
  }

  async function fetchLeaderboard() {
    const { data, error } = await supabase
      .from('profiles')
      .select('email, xp_balance')
      .order('xp_balance', { ascending: false })
      .limit(10)
    if (!error && data) setLeaderboard(data)
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'http://localhost:3000' }
    })
    if (error) console.error('Login failed:', error.message)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setChallenges([])
    setLeaderboard([])
    setActiveChallenge(null)
    setUserXp(0)
  }

  async function joinWaitlist() {
    setStatus('Joining...')
    const { error } = await supabase.from('waitlist').insert([{ email: email }])
    if (error) setStatus(`Failed: ${error.message}`)
    else {
      setStatus('Success! You are on the waitlist. 🚀')
      setEmail('')
    }
  }

  async function handleRunExecution() {
    setIsExecuting(true)
    const fullCode = `function solve(data) {\n${code}\n}`
    
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: fullCode,
          challengeId: activeChallenge.id,
          userId: user.id,   
          email: user.email  
        }), 
      })
      
      const result = await response.json()
      
      if (result.success) {
        if (result.passed === result.total) {
           // UPDATED: Dynamically rendering the exact points awarded from the backend response
           alert(`MISSION ACCOMPLISHED!\n\nYou passed ${result.passed} out of ${result.total} test cases. Mathematics verified. ${result.pointsAwarded} XP Awarded.`);
           fetchUserXp(user.id) 
           fetchLeaderboard()
        } else {
           alert(`EVALUATION FAILED\n\nYou passed ${result.passed} out of ${result.total} test cases. Check your logic and try again.`);
        }
      } else {
        alert("Sandbox Error:\n" + result.error)
      }
    } catch (err) {
      console.error("Pipeline failure:", err)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-900 text-white relative">
      
      <div className="absolute top-6 right-8 z-50">
        {user ? (
          <div className="flex items-center gap-6 bg-gray-800/80 px-6 py-2 rounded-full border border-gray-700 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
              <p className="text-yellow-400 font-bold tracking-widest">{userXp} <span className="text-gray-400 text-sm">XP</span></p>
            </div>
            <div className="h-6 w-[1px] bg-gray-600"></div>
            <p className="text-sm text-gray-300 font-medium">{user.email}</p>
            <button onClick={signOut} className="ml-2 text-red-400 hover:text-red-300 transition text-sm font-bold uppercase tracking-wider">
              Abort
            </button>
          </div>
        ) : (
          <button onClick={signInWithGoogle} className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition flex items-center gap-2 shadow-lg uppercase tracking-wider text-sm">
            Authenticate
          </button>
        )}
      </div>

      <h1 className="text-5xl font-black mb-10 mt-10 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500">APEX STUDIO</h1>
      
      {user ? (
        activeChallenge ? (
          <div className="w-full max-w-7xl animate-fade-in-up grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-gray-800/40 p-8 rounded-xl border border-gray-700 h-fit">
              <button 
                onClick={() => setActiveChallenge(null)} 
                className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider"
              >
                ← Disengage
              </button>
              <h2 className="text-3xl font-bold text-green-400 mb-4">{activeChallenge.title}</h2>
              <div className="flex flex-wrap gap-3 mb-6 text-xs font-bold">
                <span className={`px-3 py-1 rounded-full border ${activeChallenge.difficulty === 'Hard' ? 'bg-red-900/40 text-red-300 border-red-700/50' : 'bg-blue-900/40 text-blue-300 border-blue-700/50'}`}>
                  {activeChallenge.difficulty}
                </span>
                <span className="px-3 py-1 bg-yellow-900/40 text-yellow-300 rounded-full border border-yellow-700/50">{activeChallenge.points} XP</span>
                <span className="px-3 py-1 bg-purple-900/40 text-purple-300 rounded-full border border-purple-700/50">{activeChallenge.time_limit_minutes} Mins</span>
              </div>
              <div className="w-full h-[1px] bg-gray-700 mb-6"></div>
              <p className="text-gray-300 text-lg leading-relaxed">{activeChallenge.description}</p>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="h-[600px] flex flex-col rounded-xl overflow-hidden border border-gray-700 shadow-2xl bg-[#1e1e1e]">
                <div className="px-6 py-4 bg-[#1e1e1e] text-lg font-mono border-b border-gray-800 flex items-center gap-2">
                  <span className="text-[#569cd6]">function</span> 
                  <span className="text-[#dcdcaa]">solve</span>
                  <span className="text-[#d4d4d4]">(</span>
                  <span className="text-[#9cdcfe]">data</span>
                  <span className="text-[#d4d4d4]">) {'{'}</span>
                </div>
                
                <div className="flex-1">
                  <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 16,
                      padding: { top: 16, bottom: 16 },
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                    }}
                  />
                </div>

                <div className="px-6 py-4 bg-[#1e1e1e] text-[#d4d4d4] text-lg font-mono border-t border-gray-800">
                  {'}'}
                </div>
              </div>

              <button 
                onClick={handleRunExecution} 
                disabled={isExecuting}
                className={`w-full py-4 font-bold rounded-xl transition-all shadow-lg text-lg uppercase tracking-wider flex justify-center items-center gap-3
                  ${isExecuting 
                    ? 'bg-gray-700 text-gray-400 border border-gray-600 cursor-not-allowed' 
                    : 'bg-green-600/20 text-green-400 border border-green-600/50 hover:bg-green-600/40'
                  }
                `}
              >
                {isExecuting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying Logic...
                  </>
                ) : (
                  'Run Execution Pipeline'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl animate-fade-in-up">
            
            <div className="flex gap-8 mb-8 border-b border-gray-700">
              <button 
                onClick={() => setActiveTab('challenges')}
                className={`pb-4 text-xl font-bold uppercase tracking-widest transition-all ${activeTab === 'challenges' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Active Objectives
              </button>
              <button 
                onClick={() => setActiveTab('leaderboard')}
                className={`pb-4 text-xl font-bold uppercase tracking-widest transition-all ${activeTab === 'leaderboard' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Global Rankings
              </button>
            </div>

            {activeTab === 'challenges' ? (
              <div className="grid grid-cols-1 gap-6">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="p-8 border border-gray-700 rounded-xl bg-gray-800/40 shadow-2xl backdrop-blur-sm group hover:border-gray-500 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors">{challenge.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${challenge.difficulty === 'Hard' ? 'bg-red-900/40 text-red-300 border-red-700/50' : 'bg-blue-900/40 text-blue-300 border-blue-700/50'}`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-6 leading-relaxed text-lg">{challenge.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-400 bg-gray-900/50 p-4 rounded-lg">
                      <span className="flex items-center gap-2 font-bold"><span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]"></span>Reward: {challenge.points} XP</span>
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"></span>Time Limit: {challenge.time_limit_minutes} mins</span>
                    </div>
                    <button 
                      onClick={() => {
                        setActiveChallenge(challenge)
                        setCode('  // Write your logic here...\n  \n  return 0;') 
                      }}
                      className="w-full mt-6 py-3 bg-gray-700/50 text-white font-bold rounded-lg border border-gray-600 hover:bg-green-600/20 hover:border-green-500 hover:text-green-400 hover:scale-[1.02] transition-all uppercase tracking-wider"
                    >
                      Initialize Code Editor
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800/40 border border-gray-700 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-900/80 border-b border-gray-700">
                    <tr>
                      <th className="px-8 py-4 text-gray-400 font-bold uppercase tracking-widest text-sm">Rank</th>
                      <th className="px-8 py-4 text-gray-400 font-bold uppercase tracking-widest text-sm">Operative</th>
                      <th className="px-8 py-4 text-gray-400 font-bold uppercase tracking-widest text-sm text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((profile, index) => (
                      <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                        <td className="px-8 py-5">
                          <span className={`font-bold text-lg ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                            #{index + 1}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-gray-200 font-medium">{profile.email}</td>
                        <td className="px-8 py-5 text-right font-bold text-green-400 tracking-wider">{profile.xp_balance} XP</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center mt-10">
          <p className="mb-8 text-gray-400 text-lg uppercase tracking-widest">Awaiting Verification.</p>
          <div className="flex gap-4 mb-4">
            <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-white w-64 focus:border-blue-500 outline-none transition-all shadow-inner text-sm" />
            <button onClick={joinWaitlist} className="px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-500 font-bold transition shadow-[0_0_15px_rgba(37,99,235,0.4)] text-sm uppercase tracking-wider">Join Waitlist</button>
          </div>
          <p className="text-green-400 h-6 text-sm">{status}</p>
        </div>
      )}
    </main>
  )
}