'use client'
import { useState } from 'react'
import { supabase } from '../utils/supabase'

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')

  async function joinWaitlist() {
    setStatus('Joining...')
    
    // This inserts the email into your new Supabase table
    const { error } = await supabase
      .from('waitlist')
      .insert([{ email: email }])
    
    if (error) {
      setStatus(`Failed: ${error.message}`)
    } else {
      setStatus('Success! You are on the waitlist. 🚀')
      setEmail('') // clear the input box
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-24">
      <h1 className="text-5xl font-bold mb-4">Apex Studio</h1>
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
          className="px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-700 font-bold"
        >
          Join Waitlist
        </button>
      </div>
      
      <p className="text-green-400">{status}</p>
    </main>
  )
}