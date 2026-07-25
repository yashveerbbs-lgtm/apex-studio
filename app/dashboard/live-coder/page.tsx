'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../../utils/supabase'
import jsPDF from 'jspdf'

export default function LiveCoder() {
  const [isMounted, setIsMounted] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)
  const [code, setCode] = useState('// Initialize Apex Free Tier Hackathon\nfunction unlockCertificate() {\n  return "CLEARANCE_GRANTED";\n}\n\nunlockCertificate();')

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
        const operativeName = user.user_metadata?.full_name || profile?.display_name || 'Operative'
        
        // 🔥 Dynamic Free Tier Email Trigger
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
    doc.setFillColor(5, 5, 5)
    doc.rect(0, 0, 210, 297, 'F')
    doc.setTextColor(34, 197, 94)
    doc.setFontSize(24)
    doc.text('APEX STUDIO', 105, 40, { align: 'center' })
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.text('CERTIFICATE OF CLEARANCE', 105, 60, { align: 'center' })
    doc.setFontSize(12)
    doc.text('This certifies that the operative has successfully', 105, 90, { align: 'center' })
    doc.text('breached the mainframe and completed the Open Hackathon.', 105, 100, { align: 'center' })
    doc.setTextColor(34, 197, 94)
    doc.text('STATUS: VERIFIED', 105, 130, { align: 'center' })
    doc.save('Apex_Clearance_Certificate.pdf')
  }

  if (!isMounted) return null

  return (
    <div className="p-8 md:p-12 text-white font-sans max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <Link href="/portal" className="text-gray-500 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors">
          ← Back to Central Hub
        </Link>
      </div>

      <div className="border-b border-green-900/50 pb-6 mb-8">
        <h1 className="text-4xl font-black uppercase tracking-widest mb-2 text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]">
          Live Coder Arena
        </h1>
        <p className="text-green-400/70 font-mono text-sm uppercase tracking-widest">
          Free Tier // Open Hackathon
        </p>
      </div>

      <div className="bg-[#050505] border border-gray-800 rounded-xl overflow-hidden mb-8 shadow-[0_0_30px_rgba(34,197,94,0.05)]">
        <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
        </div>
        <textarea 
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-64 bg-transparent text-green-400 font-mono p-6 outline-none resize-none"
          spellCheck="false"
        />
      </div>

      <div className="text-center space-y-6">
        <button 
          onClick={executeCode}
          disabled={executing}
          className="bg-green-600 hover:bg-green-500 text-black font-bold uppercase tracking-widest text-sm py-4 px-12 rounded transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {executing ? 'Compiling Algorithm...' : 'Execute Code Submission'}
        </button>
        
        {hasCompleted && (
          <div className="pt-2 animate-fade-in">
            <button 
              onClick={generatePDF}
              className="bg-transparent border border-green-500 text-green-500 hover:bg-green-950 font-bold uppercase tracking-widest text-xs py-3 px-8 rounded transition-all"
            >
              Download PDF Certificate
            </button>
          </div>
        )}
      </div>
    </div>
  )
}