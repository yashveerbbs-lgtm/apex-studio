'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'

export default function Portal() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [hasSigned, setHasSigned] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigning, setIsSigning] = useState(false)

  useEffect(() => {
    checkPortalAccess()
  }, [])

  async function checkPortalAccess() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      setIsLoading(false)
      return
    }
    
    setUser(session.user)

    // 1. Check if the user has an assigned corporate role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (roleData) {
      setRole(roleData.role)
      
      // 2. Check if they have signed the IP Agreement
      const { data: agreementData } = await supabase
        .from('legal_agreements')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('agreement_type', 'NDA_AND_IP_ASSIGNMENT')
        .single()
        
      setHasSigned(!!agreementData)
    }
    
    setIsLoading(false)
  }

  async function handleSignAgreement() {
    setIsSigning(true)
    try {
      const response = await fetch('/api/agree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      })
      
      const text = await response.text()
      
      let result;
      try {
        result = JSON.parse(text)
      } catch (parseError) {
        console.error("Raw API Response:", text)
        alert(`API Routing Error: The server returned HTML instead of JSON. Check your terminal. Status: ${response.status}`)
        setIsSigning(false)
        return
      }

      if (result.success) {
        setHasSigned(true)
      } else {
        alert("Signature failed: " + result.error)
      }
    } catch (err: any) {
      console.error(err)
      alert("Network error: " + err.message)
    } finally {
      setIsSigning(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-green-400 font-mono animate-pulse">Verifying Credentials...</div>
  }

  // State 1: Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-bold mb-4">Restricted Access</h1>
        <p className="text-gray-400 mb-8">You must authenticate via the main arena to access the Contributor Portal.</p>
        <a href="/" className="px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-500 font-bold transition uppercase tracking-wider text-sm">Return to Arena</a>
      </div>
    )
  }

  // State 2: Logged in, but no internal role assigned (Public User)
  if (!role) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Clearance Denied</h1>
        <p className="text-gray-400 max-w-md text-center">Your account ({user.email}) does not have an assigned operational role at Apex Studio. If you recently accepted an internship or contract, contact your administrator.</p>
        <a href="/" className="mt-8 text-gray-500 hover:text-white transition underline">Return to Arena</a>
      </div>
    )
  }

  // State 3: Role assigned, but agreement NOT signed (The Legal Gateway)
  if (!hasSigned) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white relative">
        <div className="max-w-2xl w-full bg-gray-800/80 border border-red-900/50 p-10 rounded-xl shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
            <h1 className="text-2xl font-bold text-red-400 uppercase tracking-widest">Mandatory Legal Execution</h1>
          </div>
          
          <div className="h-64 overflow-y-auto bg-gray-900/50 p-6 rounded-lg border border-gray-700 mb-8 font-mono text-sm text-gray-300 leading-relaxed shadow-inner">
            <p className="mb-4"><strong>NON-DISCLOSURE AND INTELLECTUAL PROPERTY ASSIGNMENT AGREEMENT</strong></p>
            <p className="mb-4">By accessing the Apex Studio internal portal, you (the "Contributor") agree to the following terms:</p>
            <p className="mb-4">1. <strong>Confidentiality:</strong> All software, codebases, 3D models, operational strategies, and client data accessed through this portal are strictly confidential. You may not distribute, copy, or discuss these assets outside of authorized Apex Studio channels.</p>
            <p className="mb-4">2. <strong>IP Assignment:</strong> Any code, designs, or products you create, modify, or contribute to while utilizing Apex Studio resources are the sole and exclusive property of Apex Studio. You hereby permanently assign all intellectual property rights to the Studio.</p>
            <p>3. <strong>Enforcement:</strong> Digital acceptance of this Clickwrap Agreement constitutes a legally binding electronic signature. Violation of these terms will result in immediate termination of access and potential legal action.</p>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Operative: {user.email}<br/>Role: {role.toUpperCase()}</p>
            <button 
              onClick={handleSignAgreement}
              disabled={isSigning}
              className={`px-8 py-3 font-bold rounded-lg transition-all uppercase tracking-wider text-sm ${isSigning ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-red-600/20 text-red-400 border border-red-600 hover:bg-red-600/40 hover:scale-105'}`}
            >
              {isSigning ? 'Executing...' : 'I Agree & Assign IP'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // State 4: Fully Cleared (The Internal Portal Dashboard)
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <header className="flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500">APEX STUDIO // INTERNAL</h1>
          <p className="text-green-400 font-mono mt-2 text-sm">STATUS: CLEARED. WELCOME BACK, OPERATIVE.</p>
        </div>
        <div className="flex items-center gap-4 bg-gray-900 px-6 py-2 rounded-full border border-gray-800">
          <span className={`w-2 h-2 rounded-full ${role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'}`}></span>
          <span className="text-sm font-bold uppercase tracking-widest text-gray-300">{role}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-600 transition">
          <h3 className="text-xl font-bold mb-2">Active Software Repos</h3>
          <p className="text-gray-400 text-sm mb-4">Access restricted codebases and engineering pipelines.</p>
          <button className="text-blue-400 text-sm font-bold uppercase tracking-wider hover:text-blue-300">View Repos →</button>
        </div>
        <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-600 transition">
          <h3 className="text-xl font-bold mb-2">3D & Assets Pipeline</h3>
          <p className="text-gray-400 text-sm mb-4">Download models, textures, and client design files.</p>
          <button className="text-blue-400 text-sm font-bold uppercase tracking-wider hover:text-blue-300">Access Drive →</button>
        </div>
        <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-600 transition group">
          <h3 className="text-xl font-bold mb-2">My Tasks</h3>
          <p className="text-gray-400 text-sm mb-4">View your assigned sprint deliverables and deadlines.</p>
          {/* THE UPDATED ROUTING LINK IS RIGHT HERE */}
          <a href="/portal/tasks" className="text-blue-400 text-sm font-bold uppercase tracking-wider group-hover:text-blue-300 inline-block transition">Open Board →</a>
        </div>
      </div>
    </main>
  )
}