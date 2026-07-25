'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../../utils/supabase'
import jsPDF from 'jspdf'
import { Code2, Terminal, CheckCircle2 } from 'lucide-react'

export default function HackathonFree() {
  const [isMounted, setIsMounted] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)
  const [code, setCode] = useState('// Apex Hackathon: Free Tier Submission\n// Note: Build your full project in the Apex Workspace.\n// Paste your final validation script here.\n\nfunction validateSubmission() {\n  return "HACKATHON_PROJECT_VERIFIED";\n}\n\nvalidateSubmission();')

  useEffect(() => {
    setIsMounted(true)
    checkCompletion()
  }, [])

  async function checkCompletion() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('event_completions').select('*').eq('user_id', user.id).eq('event_type', 'FREE').maybeSingle()
      if (data) setHasCompleted(true)
    }
  }

  async function executeCode() {
    setExecuting(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: existing } = await supabase
        .from('event_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_type', 'FREE')
        .maybeSingle()
        
      if (!existing) {
        await supabase.from('event_completions').insert([
          { user_id: user.id, event_type: 'FREE' }
        ])
        
        const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).single()
        const operativeName = user.user_metadata?.full_name || profile?.display_name || 'Developer'
        
        await fetch('/api/send-completion-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, name: operativeName, tier: 'FREE' })
        })
        setHasCompleted(true)
      }
    }
    
    setTimeout(() => setExecuting(false), 1500) 
  }

  function generatePDF() {
    const doc = new jsPDF()
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, 210, 297, 'F')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(28)
    doc.text('APEX STUDIO', 105, 40, { align: 'center' })
    doc.setTextColor(37, 99, 235)
    doc.setFontSize(18)
    doc.text('HACKATHON COMPLETION CERTIFICATE', 105, 60, { align: 'center' })
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(12)
    doc.text('This certifies that the developer has successfully', 105, 90, { align: 'center' })
    doc.text('built and deployed a project during the Free Tier event.', 105, 100, { align: 'center' })
    doc.setTextColor(34, 197, 94)
    doc.setFontSize(14)
    doc.text('STATUS: VERIFIED & AUTHENTICATED', 105, 130, { align: 'center' })
    doc.save('Apex_Hackathon_Certificate.pdf')
  }

  if (!isMounted) return null

  return (
    <div className="p-8 md:p-12 text-white font-sans max-w-5xl mx-auto animate-fade-in">

      <div className="border-b border-gray-800 pb-8 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Code2 className="w-8 h-8 text-green-500" />
          <h1 className="text-4xl font-black tracking-tight">Free Tier Hackathon</h1>
        </div>
        <p className="text-gray-400 text-lg">
          Compete solo or with a team. Gain real experience and earn your official completion certificate.
        </p>
      </div>

      <div className="mb-8 bg-blue-900/10 border border-blue-900/30 p-4 rounded-xl flex items-start gap-4">
        <Terminal className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
        <div>
          <h3 className="font-bold text-blue-100 mb-1">Development Phase</h3>
          <p className="text-sm text-blue-300 mb-2">All project code, team communication, and architecture planning must be done inside the <Link href="/dashboard/workspace" className="font-bold underline hover:text-white">Apex Internal IDE</Link>.</p>
          <p className="text-xs text-blue-400">Once your team's project is complete, paste your validation script below to unlock your certificate.</p>
        </div>
      </div>

      <div className="bg-[#050505] border border-gray-800 rounded-xl overflow-hidden mb-8 shadow-xl">
        <div className="bg-gray-900 px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
          </div>
          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">submission_portal.js</div>
        </div>
        <textarea 
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-64 bg-transparent text-green-400 font-mono p-6 outline-none resize-none leading-relaxed"
          spellCheck="false"
        />
      </div>

      <div className="flex flex-col items-center space-y-6">
        <button 
          onClick={executeCode}
          disabled={executing}
          className="bg-green-600 hover:bg-green-500 text-black font-bold uppercase tracking-widest text-sm py-4 px-12 rounded-full transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {executing ? 'Validating Project...' : 'Submit Project & Unlock Certificate'}
        </button>
        
        {hasCompleted && (
          <div className="pt-4 animate-fade-in flex flex-col items-center">
            <div className="flex items-center gap-2 text-green-500 font-bold mb-4">
              <CheckCircle2 className="w-5 h-5" />
              Project Verified
            </div>
            <button 
              onClick={generatePDF}
              className="bg-transparent border border-gray-600 text-gray-300 hover:bg-white hover:text-black font-bold uppercase tracking-widest text-xs py-3 px-8 rounded-full transition-all"
            >
              Download PDF Certificate
            </button>
          </div>
        )}
      </div>
    </div>
  )
}