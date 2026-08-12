'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../utils/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      const pendingInvite = sessionStorage.getItem('pendingInvite')
      
      if (pendingInvite) {
        sessionStorage.removeItem('pendingInvite') 
        router.push(pendingInvite) 
      } else {
        router.push('/dashboard/overview') 
      }
    }
  }

  async function handleGoogleLogin() {
    const pendingInvite = sessionStorage.getItem('pendingInvite');
    const redirectPath = pendingInvite ? pendingInvite : '/dashboard/overview';
    
    if (pendingInvite) {
      sessionStorage.removeItem('pendingInvite');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${redirectPath}`,
        queryParams: {
          prompt: 'select_account' 
        }
      }
    })
    
    if (error) setError(error.message)
  }

  return (
    <main className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6 font-sans text-slate-800 transition-colors duration-500">
      <div className="w-full max-w-md bg-white border-2 border-slate-100 p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        
        {/* Soft, friendly header gradient */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-400 to-purple-400"></div>

        <div className="mb-8 text-center mt-2">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
            Welcome Back! 👋
          </h1>
          <p className="text-slate-500 font-medium text-sm">Let's get back to learning and building.</p>
        </div>

        {/* GOOGLE AUTH BUTTON */}
        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="w-full mb-6 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold text-base py-3.5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:-translate-y-1 hover:shadow-sm active:translate-y-0 active:shadow-none"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center mb-6">
          <div className="flex-1 border-t-2 border-slate-100"></div>
          <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Or use email</span>
          <div className="flex-1 border-t-2 border-slate-100"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@awesome.com"
              className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 p-3.5 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-sm font-medium placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 p-3.5 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-sm font-medium placeholder:text-slate-400"
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-600 text-sm font-medium p-4 rounded-xl flex items-center gap-2">
              <span className="text-xl">😅</span> Oops! {error}
            </div>
          )}

          {/* Gamified 3D Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold text-base py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-wait shadow-[0_4px_0_rgb(67,56,202)] hover:shadow-[0_2px_0_rgb(67,56,202)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-medium text-sm">
            Don't have an account? <Link href="/auth/register" className="text-indigo-600 hover:text-indigo-500 font-bold ml-1 hover:underline underline-offset-4 transition-all">Sign Up</Link>
          </p>
        </div>
      </div>
    </main>
  )
}