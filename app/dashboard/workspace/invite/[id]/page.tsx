'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Users, Loader2 } from 'lucide-react'
import { supabase } from '../../../../../utils/supabase' 

export default function InviteGateway() {
  const router = useRouter()
  const params = useParams() 
  const [status, setStatus] = useState('Authenticating and joining squad...')

  useEffect(() => {
    // Wait until the URL parameter is actually available
    if (!params?.id) return;

    async function processInvite() {
      try {
        // 1. Check if the user is logged in
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setStatus('Authentication required. Redirecting to login...')
          
          // 🚨 NEW: Save the invite destination before kicking them to login
          sessionStorage.setItem('pendingInvite', `/dashboard/workspace/invite/${params.id}`)
          
          setTimeout(() => router.push('/auth/login'), 2000)
          return
        }

        // 2. Add them to the squad
        const { error } = await supabase.from('team_members').insert([
          { team_id: params.id as string, user_id: user.id, role: 'developer' }
        ])

        // Error code 23505 means they are already in the team
        if (error && error.code !== '23505') {
           setStatus('Failed to join squad. The link may be invalid.')
           console.error("Join Error:", error)
           return
        }

        // 3. Drop them into the workspace
        setStatus('Squad joined! Initializing workspace...')
        setTimeout(() => router.push('/dashboard/workspace'), 1000)
      } catch (err) {
        console.error("Unexpected error:", err)
        setStatus('An unexpected error occurred.')
      }
    }
    
    processInvite()
  }, [params?.id, router])

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#050505] text-white font-sans">
      <div className="max-w-md w-full bg-[#0a0a0a] border border-gray-800 p-8 rounded-xl shadow-2xl text-center">
        <Users className="w-12 h-12 text-blue-500 mb-6 mx-auto" />
        <h2 className="text-xl font-bold mb-4 tracking-tight">Apex Secure Gateway</h2>
        <div className="flex items-center justify-center gap-3 text-sm text-gray-400 font-mono">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          {status}
        </div>
      </div>
    </div>
  )
}