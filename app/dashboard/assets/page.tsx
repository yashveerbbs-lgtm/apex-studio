import Link from 'next/link'

export default function AssetPipeline() {
  return (
    <div className="p-8 md:p-12 text-white font-sans max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <Link href="/portal" className="text-gray-500 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors">
          ← Back to Central Hub
        </Link>
      </div>
      <div className="border-b border-gray-800 pb-6 mb-8">
        <h1 className="text-3xl font-black uppercase tracking-widest mb-2 text-purple-500">Asset Pipeline</h1>
        <p className="text-gray-400 font-mono text-sm uppercase">Encrypted File Storage & Design Deliverables</p>
      </div>
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-12 text-center flex flex-col items-center justify-center h-[40vh]">
        <svg className="w-12 h-12 text-purple-900 mb-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
        <p className="text-gray-600 font-mono text-sm uppercase tracking-widest">
          Establishing secure connection to storage node...
        </p>
      </div>
    </div>
  )
}