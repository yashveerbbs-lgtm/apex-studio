'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [user, setUser] = useState(null)
  const [challenges, setChallenges] = useState([]) // The new state to hold your logic puzzles

  // Listen for login, and fetch challenges if approved
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

  // The bridge to your new database table
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
    setChallenges([]) // Clear puzzles from the screen on logout
  }

  async function joinWaitlist() {
    setStatus('Joining...')
    const { error } = await supabase.from('waitlist').insert([{ email: email }])
    if (error) {
      setStatus(`Failed: ${error.message}`)
    } else {
      setStatus('Success! You are on the waitlist. 🚀')
      setEmail('')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-900 text-white relative">
      
      {/* Top Right Navigation Bar */}
      <div className="absolute top-6 right-8">
        {user ? (
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-400">{user.email}</p>
            <button 
              onClick={signOut} 
              className="px-4 py-2 bg-red-900/40 text-red-400 rounded-md hover:bg-red-900/60 transition text-sm font-semibold"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button 
            onClick={signInWithGoogle} 
            className="px-4 py-2 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in
          </button>
        )}
      </div>

      <h1 className="text-5xl font-bold mb-10 mt-10">Apex Studio</h1>
      
      {user ? (
        <div className="w-full max-w-4xl animate-fade-in-up">
          <h2 className="text-2xl font-bold text-green-400 mb-6 border-b border-gray-700 pb-2">
            Active Logic Challenges
          </h2>
          
          {/* Map through the database data and generate cards */}
          <div className="grid grid-cols-1 gap-6">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="p-8 border border-gray-700 rounded-xl bg-gray-800/40 shadow-2xl backdrop-blur-sm">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-white">{challenge.title}</h3>
                  <span className="px-3 py-1 bg-blue-900/40 text-blue-300 rounded-full text-sm font-semibold border border-blue-700/50">
                    {challenge.difficulty}
                  </span>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed text-lg">{challenge.description}</p>
                
                <div className="flex justify-between items-center text-sm text-gray-400 bg-gray-900/50 p-4 rounded-lg">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    Reward: {challenge.points} XP
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Time Limit: {challenge.time_limit_minutes} mins
                  </span>
                </div>
                
                <button className="w-full mt-6 py-3 bg-green-600/20 text-green-400 font-bold rounded-lg border border-green-600/50 hover:bg-green-600/40 hover:scale-[1.02] transition-all">
                  Initialize Code Editor
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center mt-10">
          <p className="mb-8 text-gray-400 text-lg">The next generation of digital products. Hackathon 01 coming soon.</p>
          <div className="flex gap-4 mb-4">
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 rounded-md text-black w-64 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button 
              onClick={joinWaitlist}
              className="px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-700 font-bold transition shadow-lg"
            >
              Join Waitlist
            </button>
          </div>
          <p className="text-green-400 h-6">{status}</p>
        </div>
      )}
    </main>
  )
}