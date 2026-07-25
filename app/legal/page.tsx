import Link from 'next/link'
import { Scale, ShieldCheck, FileText, ArrowLeft } from 'lucide-react'

export default function LegalTermsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-sans p-6 md:p-12 selection:bg-cyan-900/50">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors text-sm font-bold tracking-widest uppercase mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-cyan-950/30 border border-cyan-900/50 rounded-lg flex items-center justify-center">
              <Scale className="w-6 h-6 text-cyan-500" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Platform Terms & IP Assignment</h1>
          </div>
          <p className="text-gray-400 text-lg font-mono">Last Updated: July 2026</p>
        </div>

        {/* Content Document */}
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8 md:p-12 shadow-2xl space-y-12">

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" /> Introduction
            </h2>
            <p className="leading-relaxed">
              By creating an account, accessing the Apex Workspace IDE, or participating in the Bounty Arena, you (the "User") agree to the following terms under the Information Technology Act, 2000. These terms legally govern your use of the Apex Studio ecosystem and the digital assets created within it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-500" /> 1. Intellectual Property Assignment
            </h2>
            <div className="bg-[#111111] p-6 rounded-lg border border-gray-800">
              <p className="leading-relaxed">
                Any code, software architecture, 3D models, or digital assets written, uploaded, or submitted through the Apex Studio platform (including Hackathons, Bounties, and Internships) immediately become the sole and exclusive intellectual property of Apex Studio.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-500" /> 2. Waiver of Rights
            </h2>
            <div className="bg-[#111111] p-6 rounded-lg border border-gray-800">
              <p className="leading-relaxed">
                The User waives all rights to commercially sell, license, or claim ownership over the submitted code. The User retains the right to display the code in a personal portfolio or resume, provided it does not expose proprietary company infrastructure, API keys, or sensitive client data.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-500" /> 3. Contractor Grants & Bounties
            </h2>
            <div className="bg-[#111111] p-6 rounded-lg border border-gray-800">
              <p className="leading-relaxed">
                If a User is selected as a winner in the Bounty Arena or completes a compensated Internship task, the monetary payout is classified strictly as a short-term contractor grant in exchange for the transferred IP. It is not a lottery prize, gambling winning, or sweepstakes. All payouts are at the sole discretion of Apex Studio management based on technical merit.
              </p>
            </div>
          </section>
          
          {/* Footer Seal */}
          <div className="border-t border-gray-800 pt-8 mt-8 text-sm text-gray-500 text-center font-mono uppercase tracking-widest flex flex-col items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-gray-600" />
            Protected under the Information Technology Act, 2000 (India)
          </div>

        </div>
      </div>
    </div>
  )
}