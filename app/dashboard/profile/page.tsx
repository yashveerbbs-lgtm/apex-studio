'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../utils/supabase'

export default function Profile() {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (data) setProfile(data)
    setIsLoading(false)
  }

  if (isLoading) return <div className="min-h-screen bg-[#0a0a0a] text-blue-400 flex justify-center items-center font-mono animate-pulse">Loading Operative Data...</div>

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <header className="mb-10">
        <a href="/portal" className="text-gray-500 hover:text-white text-sm font-bold uppercase tracking-widest mb-4 inline-block transition">← Back to Portal</a>
        <h1 className="text-4xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-600">Operative Dossier</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* STATS CARD */}
        <div className="bg-gray-900 p-8 rounded-xl border border-gray-800">
          <h2 className="text-xl font-bold uppercase tracking-widest mb-6">Combat Stats</h2>
          <div className="space-y-6">
            <div>
              <p className="text-gray-500 text-xs uppercase mb-1">Current Rank</p>
              <p className="text-2xl font-black text-teal-400">{profile?.rank || 'RECRUIT'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase mb-1">Total Experience (XP)</p>
              <p className="text-2xl font-black text-white">{profile?.xp || 0}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase mb-1">Total Tasks Completed</p>
              <p className="text-2xl font-black text-blue-400">{profile?.total_completed_tasks || 0}</p>
            </div>
          </div>
        </div>

        {/* AVATAR/IDENTITY CARD */}
        <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 flex flex-col items-center justify-center">
            <div className="w-32 h-32 rounded-full border-4 border-teal-500 bg-gray-800 flex items-center justify-center mb-4 text-4xl">
              ⚔️
            </div>
            <h3 className="text-xl font-bold uppercase">{profile?.username || 'New Operative'}</h3>
            <p className="text-gray-500 font-mono text-sm mt-1">ID: {profile?.id.substring(0, 8)}...</p>
        </div>
      </div>
    </main>
  )
}