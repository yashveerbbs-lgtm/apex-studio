'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import Editor from '@monaco-editor/react' // The new VS Code engine

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [user, setUser] = useState<any>(null)
  const [challenges, setChallenges] = useState<any[]>([])
  
  // NEW: State to manage the active IDE session
  const [activeChallenge, setActiveChallenge] = useState<any>(null)
  const [code, setCode] = useState<string>('// Initialize your algorithm here...\n\nfunction solve(data) {\n  \n}\n')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchChallenges() 
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchChallenges()
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchChallenges() {
    const { data, error } = await supabase.from('challenges').select('*')
    if (error) console.error('Error fetching challenges:', error.message)
    else setChallenges(data)
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
    setActiveChallenge(null) // Reset IDE on logout
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

  // NEW: Mock execution function
  function handleRunExecution() {
    alert("Pipeline engaged! Sending algorithm to backend for mathematical validation:\n\n" + code)
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-900 text-white relative">
      
      {/* Top Right Navigation */}
      <div className="absolute top-6 right-8">
        {user ? (
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-400">{user.email}</p>
            <button onClick={signOut} className="px-4 py-2 bg-red-900/40 text-red-400 rounded-md hover:bg-red-900/60 transition text-sm font-semibold">
              Sign Out
            </button>
          </div>
        ) : (
          <button onClick={signInWithGoogle} className="px-4 py-2 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition flex items-center gap-2">
            Sign in with Google
          </button>
        )}
      </div>

      <h1 className="text-5xl font-bold mb-10 mt-10">Apex Studio</h1>
      
      {user ? (
        activeChallenge ? (
          // --- THE NEW BROWSER IDE UI ---
          <div className="w-full max-w-7xl animate-fade-in-up grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Panel: Challenge Context */}
            <div className="lg:col-span-4 bg-gray-800/40 p-8 rounded-xl border border-gray-700 h-fit">
              <button 
                onClick={() => setActiveChallenge(null)} 
                className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 text-sm font-semibold"
              >
                ← Abort & Return to Dashboard
              </button>
              <h2 className="text-3xl font-bold text-green-400 mb-4">{activeChallenge.title}</h2>
              <div className="flex flex-wrap gap-3 mb-6 text-xs font-bold">
                <span className="px-3 py-1 bg-blue-900/40 text-blue-300 rounded-full border border-blue-700/50">{activeChallenge.difficulty}</span>
                <span className="px-3 py-1 bg-yellow-900/40 text-yellow-300 rounded-full border border-yellow-700/50">{activeChallenge.points} XP</span>
                <span className="px-3 py-1 bg-purple-900/40 text-purple-300 rounded-full border border-purple-700/50">{activeChallenge.time_limit_minutes} Mins</span>
              </div>
              <div className="w-full h-[1px] bg-gray-700 mb-6"></div>
              <p className="text-gray-300 text-lg leading-relaxed">{activeChallenge.description}</p>
            </div>

            {/* Right Panel: Monaco Editor & Execution */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="h-[600px] rounded-xl overflow-hidden border border-gray-700 shadow-2xl bg-[#1e1e1e]">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 16,
                    padding: { top: 24 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                  }}
                />
              </div>
              <button 
                onClick={handleRunExecution} 
                className="w-full py-4 bg-green-600/20 text-green-400 border border-green-600/50 hover:bg-green-600/40 font-bold rounded-xl transition-all shadow-lg text-lg uppercase tracking-wider"
              >
                Run Execution Pipeline
              </button>
            </div>
            
          </div>
        ) : (
          // --- THE CHALLENGE DASHBOARD (Existing) ---
          <div className="w-full max-w-4xl animate-fade-in-up">
            <h2 className="text-2xl font-bold text-green-400 mb-6 border-b border-gray-700 pb-2">Active Logic Challenges</h2>
            <div className="grid grid-cols-1 gap-6">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="p-8 border border-gray-700 rounded-xl bg-gray-800/40 shadow-2xl backdrop-blur-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-white">{challenge.title}</h3>
                    <span className="px-3 py-1 bg-blue-900/40 text-blue-300 rounded-full text-sm font-semibold border border-blue-700/50">{challenge.difficulty}</span>
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed text-lg">{challenge.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-400 bg-gray-900/50 p-4 rounded-lg">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span>Reward: {challenge.points} XP</span>
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"></span>Time Limit: {challenge.time_limit_minutes} mins</span>
                  </div>
                  <button 
                    onClick={() => setActiveChallenge(challenge)} // This triggers the IDE view
                    className="w-full mt-6 py-3 bg-green-600/20 text-green-400 font-bold rounded-lg border border-green-600/50 hover:bg-green-600/40 hover:scale-[1.02] transition-all"
                  >
                    Initialize Code Editor
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        // --- WAITLIST UI ---
        <div className="flex flex-col items-center mt-10">
          <p className="mb-8 text-gray-400 text-lg">The next generation of digital products. Hackathon 01 coming soon.</p>
          <div className="flex gap-4 mb-4">
            <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="px-4 py-2 rounded-md text-black w-64 focus:ring-2 focus:ring-blue-500 outline-none" />
            <button onClick={joinWaitlist} className="px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-700 font-bold transition shadow-lg">Join Waitlist</button>
          </div>
          <p className="text-green-400 h-6">{status}</p>
        </div>
      )}
    </main>
  )
}