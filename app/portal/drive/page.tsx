'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../utils/supabase'

export default function AssetDrive() {
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFiles()
  }, [])

  async function fetchFiles() {
    // Fetch all files from the secure 'assets' bucket
    const { data, error } = await supabase.storage.from('assets').list()
    
    if (data) {
      // Filter out the hidden Supabase folder if it exists
      setFiles(data.filter(file => file.name !== '.emptyFolderPlaceholder'))
    }
    setIsLoading(false)
  }

  async function handleDownload(fileName: string) {
    const { data, error } = await supabase.storage.from('assets').download(fileName)
    
    if (error) {
      alert("Clearance Denied or File Not Found: " + error.message)
      return
    }

    // Create a temporary secure link to download the file directly to the user's machine
    const url = window.URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.parentNode?.removeChild(link)
  }

  if (isLoading) return <div className="min-h-screen bg-[#0a0a0a] text-blue-400 flex justify-center items-center font-mono animate-pulse">Establishing Secure Connection...</div>

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <header className="mb-10 flex items-center justify-between border-b border-gray-800 pb-6">
        <div>
          <a href="/portal" className="text-gray-500 hover:text-white text-sm font-bold uppercase tracking-widest mb-4 inline-block transition">← Back to Portal</a>
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-600 uppercase">3D Asset Pipeline</h1>
          <p className="text-gray-400 font-mono mt-2 text-sm">SECURE CLOUD STORAGE // END-TO-END ENCRYPTED</p>
        </div>
      </header>

      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
          <h3 className="text-gray-300 font-bold uppercase tracking-widest text-sm">Proprietary Files</h3>
          <span className="text-xs font-mono text-gray-500">{files.length} ASSETS DETECTED</span>
        </div>

        {files.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-700 rounded-lg">
            <p className="text-gray-500 font-mono">No assets currently deployed in the pipeline.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <div key={file.name} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col justify-between hover:border-teal-500 transition group">
                <div className="mb-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded bg-gray-900 flex items-center justify-center text-teal-500 font-bold border border-gray-700">
                    {file.name.split('.').pop()?.toUpperCase().substring(0, 3)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-gray-200 truncate" title={file.name}>{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{(file.metadata?.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDownload(file.name)}
                  className="w-full py-2 bg-gray-900 text-teal-400 text-xs font-bold uppercase tracking-wider rounded border border-gray-700 hover:bg-teal-900/30 hover:border-teal-500 transition"
                >
                  Download Asset ↓
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}