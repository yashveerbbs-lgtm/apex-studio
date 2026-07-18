'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [user, setUser] = useState(null)

  // 1. Listen for the user's login status when the page loads
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2. Trigger the Google Popup
  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000' // Brings them right back here
      }
    })
    if (error) console.error('Error logging in:', error.message)
  }

  // 3. Log them out securely
  async function signOut() {
    await supabase.auth.signOut()
  }

  // 4. Your existing Waitlist logic
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-24 relative">
      
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
            {/* Standard Google G Logo */}
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

      <h1 className="text-5xl font-bold mb-4">Apex Studio</h1>
      
      {/* The Dynamic Content Area */}
      {user ? (
        <div className="text-center mt-8 p-10 border border-gray-700 rounded-xl bg-gray-800/40 shadow-2xl backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-green-400 mb-2">Access Granted</h2>
          <p className="text-xl text-gray-200 mt-4">Welcome to the mainframe, {user.user_metadata?.full_name || 'Hacker'}.</p>
          <p className="text-sm text-gray-500 mt-6">Your private dashboard infrastructure is online.</p>
        </div>
      ) : (
        <>
          <p className="mb-8 text-gray-400 text-lg">The next generation of digital products. Hackathon 01 coming soon.</p>
          <div className="flex gap-4 mb-4">
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 rounded-md text-black w-64"
            />
            <button 
              onClick={joinWaitlist}
              className="px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-700 font-bold transition"
            >
              Join Waitlist
            </button>
          </div>
          <p className="text-green-400">{status}</p>
        </>
      )}
    </main>
  )
}