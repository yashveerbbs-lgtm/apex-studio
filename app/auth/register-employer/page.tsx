'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../utils/supabase'
import { Briefcase } from 'lucide-react'

export default function RegisterEmployer() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Sign up with Supabase and tag them as an EMPLOYER in their metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: companyName, 
          role: 'EMPLOYER'
        }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Set the local storage flag so the dashboard instantly boots into Employer Mode
      localStorage.setItem('apex_role', 'EMPLOYER')
      
      // If Supabase requires email confirmation, you might need to handle that, 
      // but assuming auto-login is on:
      router.push('/dashboard/employer') 
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6 font-sans text-slate-800 transition-colors duration-500">
      <div className="w-full max-w-md bg-white border-2 border-slate-100 p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        
        {/* Corporate Amber header gradient */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-400"></div>

        <div className="mb-8 text-center mt-2 flex flex-col items-center">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
            <Briefcase className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
            Hire Top Talent
          </h1>
          <p className="text-slate-500 font-medium text-sm">Create your Beyond Zero employer account.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Company Name</label>
            <input 
              type="text" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              placeholder="e.g. Acme Corp"
              className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 p-3.5 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/20 outline-none transition-all text-sm font-medium placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Work Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="recruiting@company.com"
              className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 p-3.5 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/20 outline-none transition-all text-sm font-medium placeholder:text-slate-400"
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
              className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 p-3.5 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/20 outline-none transition-all text-sm font-medium placeholder:text-slate-400"
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-600 text-sm font-medium p-4 rounded-xl flex items-center gap-2">
              <span className="text-xl">😅</span> Oops! {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-base py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-wait shadow-[0_4px_0_rgb(217,119,6)] hover:shadow-[0_2px_0_rgb(217,119,6)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]"
          >
            {loading ? 'Creating Account...' : 'Create Employer Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-medium text-sm">
            Already have an account? <Link href="/auth/login" className="text-amber-600 hover:text-amber-500 font-bold ml-1 hover:underline underline-offset-4 transition-all">Log In</Link>
          </p>
        </div>
      </div>
    </main>
  )
}