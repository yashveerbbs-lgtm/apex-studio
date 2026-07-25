'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../utils/supabase'

export default function AssetDrive() {
  const [searchTerm, setSearchTerm] = useState('')
  const [assets, setAssets] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchAssets()
  }, [])

  async function fetchAssets() {
    const { data, error } = await supabase.storage.from('assets').list()
    
    if (error) {
      console.error('Storage Fetch Error:', error)
      return
    }
    
    // Filter out the hidden placeholder file Supabase sometimes creates
    const validAssets = data.filter(file => file.name !== '.emptyFolderPlaceholder')
    setAssets(validAssets)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return
    
    const file = e.target.files[0]
    setIsUploading(true)

    // Add a timestamp to prevent overwriting files with the exact same name
    const filePath = `${Date.now()}_${file.name}`

    const { error } = await supabase.storage.from('assets').upload(filePath, file)

    setIsUploading(false)
    
    if (error) {
      alert('Upload failed: ' + error.message)
    } else {
      // Clear the input and refresh the grid
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchAssets()
    }
  }

  async function handleDelete(fileName: string) {
    const { error } = await supabase.storage.from('assets').remove([fileName])
    if (error) {
      alert('Delete failed: ' + error.message)
    } else {
      fetchAssets()
    }
  }

  async function handleDownload(fileName: string) {
    const { data } = supabase.storage.from('assets').getPublicUrl(fileName)
    if (data?.publicUrl) {
      window.open(data.publicUrl, '_blank')
    }
  }

  // Formatting Helpers
  const formatSize = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  
  const getAssetType = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase()
    if (['obj', 'fbx', 'blend', 'gltf'].includes(ext || '')) return { type: '3D Model', tag: '3D', color: 'text-cyan-500' }
    if (['png', 'jpg', 'jpeg', 'exr', 'hdr'].includes(ext || '')) return { type: 'Texture/Img', tag: 'IMG', color: 'text-purple-500' }
    if (['psd', 'ai'].includes(ext || '')) return { type: 'Concept Art', tag: 'ART', color: 'text-pink-500' }
    return { type: 'Source File', tag: 'SRC', color: 'text-orange-500' }
  }

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-end mb-10 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 uppercase tracking-widest mb-2">
              Asset Pipeline
            </h1>
            <p className="text-gray-500 font-mono text-sm uppercase">Secure Digital Storage // Live Connection</p>
          </div>
          
          {/* Hidden File Input & Upload Button */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-cyan-900/30 text-cyan-400 border border-cyan-800 hover:bg-cyan-800 hover:text-white px-6 py-2 rounded font-bold uppercase tracking-widest text-sm transition-all disabled:opacity-50 disabled:cursor-wait"
          >
            {isUploading ? 'UPLOADING...' : '+ Upload Asset'}
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex gap-4">
          <input 
            type="text" 
            placeholder="Search filenames, tags, or extensions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-800 p-4 rounded-lg focus:border-cyan-500 outline-none font-mono text-sm text-gray-300"
          />
        </div>

        {/* Dynamic Asset Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => {
            const { type, tag, color } = getAssetType(asset.name)
            // Strip the timestamp we added during upload so it looks clean in the UI
            const displayName = asset.name.includes('_') ? asset.name.substring(asset.name.indexOf('_') + 1) : asset.name

            return (
              <div key={asset.id} className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-cyan-900/50 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-black p-3 rounded border border-gray-800">
                    <span className={`${color} font-bold`}>{tag}</span>
                  </div>
                  <span className="text-xs font-mono text-gray-600">
                    {asset.metadata?.size ? formatSize(asset.metadata.size) : 'Unknown'}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-200 mb-1 truncate" title={displayName}>
                  {displayName}
                </h3>
                <p className="text-xs text-gray-500 font-mono mb-6 uppercase">
                  {type} • {new Date(asset.created_at).toLocaleDateString()}
                </p>
                
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleDownload(asset.name)}
                    className="flex-1 bg-gray-800 hover:bg-cyan-900 hover:text-white text-gray-400 py-2 rounded text-xs font-bold uppercase tracking-wider transition"
                  >
                    Download
                  </button>
                  <button 
                    onClick={() => handleDelete(asset.name)}
                    className="px-4 bg-gray-800 hover:bg-red-900 hover:text-white text-gray-400 py-2 rounded text-xs font-bold uppercase transition"
                  >
                    Del
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-20 text-gray-600 font-mono border border-dashed border-gray-800 rounded-xl">
            No active assets in the database. Awaiting secure upload.
          </div>
        )}

      </div>
    </main>
  )
}