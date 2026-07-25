'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../utils/supabase'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Passes the name into the database metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Force an update to the profiles table to ensure the name saves
      if (data.user) {
        await supabase.from('profiles').update({ display_name: name }).eq('id', data.user.id)
      }
router.push('/dashboard/workspace')    }
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/portal`,
        queryParams: { prompt: 'select_account' }
      }
    })
    if (error) setError(error.message)
  }

  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans text-white">
      <div className="w-full max-w-md bg-gray-950 border border-gray-800 p-8 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400"></div>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500 mb-2">
            New Enlistment
          </h1>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Create Operative Profile</p>
        </div>

        <button onClick={handleGoogleLogin} type="button" className="w-full mb-6 bg-white hover:bg-gray-200 text-black font-bold uppercase tracking-widest text-sm py-3 rounded flex items-center justify-center gap-3 transition-all">
           {/* Google SVG Icon */}
           <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google Enlistment
        </button>

        <div className="flex items-center mb-6">
          <div className="flex-1 border-t border-gray-800"></div>
          <span className="px-3 text-xs font-mono text-gray-600 uppercase tracking-widest">Or Secure Cipher</span>
          <div className="flex-1 border-t border-gray-800"></div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* NEW NAME FIELD */}
          <div>
            <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Operative Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded focus:border-green-500 outline-none font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Email Designation</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded focus:border-green-500 outline-none font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Set Security Cipher</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded focus:border-green-500 outline-none font-mono text-sm"
            />
          </div>

          {error && <div className="bg-red-900/20 text-red-500 text-xs font-mono p-3 rounded">ERR: {error}</div>}

          <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold uppercase tracking-widest text-sm py-4 rounded mt-4">
            {loading ? 'Registering...' : 'Submit Profile Data'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-gray-800 pt-6">
          <p className="text-gray-500 font-mono text-xs uppercase">
            Already enlisted? <Link href="/auth/login" className="text-green-500 hover:text-white transition-all pb-1">Initialize Connection</Link>
          </p>
        </div>
      </div>
    </main>
  )
}