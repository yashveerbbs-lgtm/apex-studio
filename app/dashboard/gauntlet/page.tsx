'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../utils/supabase'

export default function Gauntlet() {
  const [puzzle, setPuzzle] = useState<any>(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchNewPuzzle()
    getUser()
  }, [])

  async function getUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) setUser(session.user)
  }

  async function fetchNewPuzzle() {
    setFeedback('')
    setAnswer('')
    const res = await fetch('/api/generate-puzzle')
    const data = await res.json()
    setPuzzle(data)
  }

  async function awardXP() {
    // 1. Bypass React state and grab the session directly from the auth client
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      console.error("XP SYSTEM ERROR: No active operative session detected.")
      return
    }

    const userId = session.user.id

    // 2. Fetch the absolute latest XP from the database
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('xp')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error("XP SYSTEM ERROR (Fetch):", fetchError)
      return
    }

    // 3. Calculate the new XP
    const newXP = (profile?.xp || 0) + 10

    // 4. Push the update to Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ xp: newXP })
      .eq('id', userId)

    if (updateError) {
      console.error("XP SYSTEM ERROR (Update):", updateError)
    } else {
      console.log("SUCCESS: Database updated. New XP:", newXP)
    }
  }

  function checkAnswer() {
    if (parseInt(answer) === puzzle.solution) {
      setFeedback('CORRECT: ACCESS GRANTED (+10 XP)')
      awardXP()
    } else {
      setFeedback('ERROR: ACCESS DENIED')
    }
  }

  if (!puzzle) return <div className="p-10 font-mono text-green-500">Initializing Gauntlet...</div>

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-12">
      <h1 className="text-4xl font-black mb-8 text-red-500 uppercase">The Gauntlet</h1>
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-xl max-w-lg shadow-2xl">
        <p className="text-sm text-gray-500 font-mono mb-4 uppercase">{puzzle.type} Protocol</p>
        <p className="text-xl mb-6">{puzzle.question}</p>
        <input 
          type="number" 
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full bg-black border border-gray-700 p-3 rounded mb-4 focus:border-red-500 outline-none"
          placeholder="Enter numeric solution..."
        />
        <button 
          onClick={checkAnswer} 
          className="w-full bg-red-600 hover:bg-red-700 transition text-white font-bold py-3 rounded uppercase tracking-widest"
        >
          Execute
        </button>
        {feedback && (
          <p className={`mt-4 font-bold text-center ${feedback.includes('CORRECT') ? 'text-green-500' : 'text-red-500'}`}>
            {feedback}
          </p>
        )}
        <button onClick={fetchNewPuzzle} className="mt-6 text-xs underline text-gray-600 hover:text-white transition">Regenerate Problem</button>
      </div>
    </main>
  )
}