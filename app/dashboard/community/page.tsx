'use client'
import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Heart, Share2, Image as ImageIcon, Code2, Send, Server, ShieldCheck, TrendingUp, Activity, Users, X, UploadCloud, Trash2, Check } from 'lucide-react'
import { supabase } from '../../../utils/supabase'

export default function EnterpriseNetwork() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<'ADMIN' | 'INTERN'>('INTERN') // <-- Added Role State
  
  // Post & Drag-and-Drop State
  const [newPost, setNewPost] = useState('')
  const [attachedImage, setAttachedImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Interaction State
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({})
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({})
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({})
  const [copiedId, setCopiedId] = useState<number | null>(null) // <-- Added Copied State for Share Button
  const [postComments, setPostComments] = useState<Record<number, any[]>>({
    1: [{ author: 'Yashveer', role: 'Apex Executive', text: 'I can allocate some backend resources for the lighting optimization. Check your internal inbox.', time: '1 hr ago' }]
  })

  // Feed State (Corporate Data)
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Aparna_Dev',
      role: 'System Admin', 
      isVerified: true,
      avatar: 'bg-fuchsia-900 text-fuchsia-400',
      time: '2 hours ago',
      content: 'Production Update: Just finished modeling the new 3D assets for our upcoming Unreal Engine client project! The rendering pipeline in C++ is finally stable on our internal servers.\n\nDoes anyone in the engineering org have experience optimizing lighting textures for mobile? Could use some advice before the client demo.',
      image: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=800&q=80',
      tags: ['#InternalBuild', '#UnrealEngine5', '#Engineering'],
      likes: 24,
      commentCount: 1
    },
    {
      id: 2,
      author: 'Alex_Engineer',
      role: 'L2 Software Engineer',
      isVerified: false,
      avatar: 'bg-blue-900 text-blue-400',
      time: '5 hours ago',
      content: 'Successfully migrated the legacy database to our new Supabase architecture. Query speeds are up 400%. Documentation has been pushed to the company wiki.',
      image: null,
      tags: ['#Backend', '#Database', '#Milestone'],
      likes: 89,
      commentCount: 0
    }
  ])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setCurrentUser(user)
        // <-- Added Admin Power Check
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile) setUserRole(profile.role)
      }
    })
  }, [])

  // --- DRAG AND DROP & FILE UPLOAD LOGIC ---
  function handleFileProcess(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      setAttachedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0])
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0])
    }
  }

  // --- POSTING LOGIC ---
  function handleCreatePost() {
    if (!newPost.trim() && !attachedImage) return

    const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Apex Staff'
    
    const createdPost = {
      id: Date.now(),
      author: displayName,
      role: userRole === 'ADMIN' ? 'System Admin' : 'Apex Staff', // <-- Admin Override
      isVerified: userRole === 'ADMIN' || displayName.toLowerCase().includes('yash') || displayName.toLowerCase().includes('aparna'),
      avatar: userRole === 'ADMIN' ? 'bg-red-900 text-red-400' : 'bg-cyan-900 text-cyan-400', // <-- Admin Styling
      time: 'Just now',
      content: newPost,
      image: attachedImage,
      tags: ['#OrgUpdate'],
      likes: 0,
      commentCount: 0
    }

    setPosts([createdPost, ...posts])
    setNewPost('')
    setAttachedImage(null)
  }

  // --- DELETE POST LOGIC (ADMIN ONLY) ---
  function handleDeletePost(postId: number) {
    if (confirm("ADMIN OVERRIDE: Are you sure you want to delete this post?")) {
      setPosts(posts.filter(p => p.id !== postId))
    }
  }

  // --- INTERACTION LOGIC ---
  function toggleLike(postId: number) {
    const isLiked = likedPosts[postId]
    setLikedPosts(prev => ({ ...prev, [postId]: !isLiked }))
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1 } : p))
  }

  function toggleComments(postId: number) {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }))
  }

  function handleAddComment(postId: number) {
    const text = commentInputs[postId]
    if (!text?.trim()) return

    const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Apex Staff'
    const newComment = { 
      author: displayName, 
      role: userRole === 'ADMIN' ? 'System Admin' : 'Apex Staff', // <-- Admin Override 
      text, 
      time: 'Just now' 
    }

    setPostComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), newComment] }))
    setPosts(posts.map(p => p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p))
    setCommentInputs(prev => ({ ...prev, [postId]: '' }))
  }

  // --- SHARE LINK LOGIC ---
  function handleShare(postId: number) {
    const linkToCopy = `${window.location.origin}/dashboard/community#post-${postId}`
    navigator.clipboard.writeText(linkToCopy)
    setCopiedId(postId)
    
    // Reset back to normal after 2 seconds
    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
  }

  return (
    <div className="h-full bg-[#050505] text-white overflow-y-auto font-sans">
      
      {/* Enterprise Header */}
      <div className="border-b border-gray-800 bg-[#0a0a0a] sticky top-0 z-20 shadow-xl">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
              <Server className="w-6 h-6 text-cyan-500" /> Apex Internal Network
            </h1>
            <p className="text-gray-500 text-xs mt-1 font-mono uppercase tracking-widest">Global Communications & Engineering Updates</p>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] text-green-500 font-bold uppercase tracking-widest bg-green-950/30 px-4 py-1.5 rounded-sm border border-green-900/50">
              <Activity className="w-3 h-3 animate-pulse" /> Org Servers Online
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: THE FEED */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Create Post Box (Drag and Drop Zone) */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`bg-[#0a0a0a] border ${isDragging ? 'border-cyan-500 bg-cyan-950/10' : 'border-gray-800'} rounded-lg p-6 shadow-lg transition-all relative`}
          >
            {isDragging && (
              <div className="absolute inset-0 bg-cyan-950/80 backdrop-blur-sm z-10 rounded-lg border-2 border-dashed border-cyan-400 flex flex-col items-center justify-center text-cyan-400">
                <UploadCloud className="w-12 h-12 mb-2" />
                <p className="font-bold tracking-widest uppercase">Drop Image to Attach</p>
              </div>
            )}

            <div className="flex gap-4 mb-4">
              {/* <-- Admin Color Override --> */}
              <div className={`w-10 h-10 rounded text-white flex items-center justify-center font-bold text-lg shrink-0 border border-gray-700 ${userRole === 'ADMIN' ? 'bg-red-900 text-red-400' : 'bg-cyan-900 text-cyan-400'}`}>
                {(currentUser?.user_metadata?.full_name || currentUser?.email || 'A').charAt(0).toUpperCase()}
              </div>
              <textarea 
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={userRole === 'ADMIN' ? "Broadcast an official admin update..." : "Broadcast an update to the company network..."}
                className="w-full bg-[#111111] text-gray-200 border border-gray-800 rounded-md p-4 focus:outline-none focus:border-cyan-900/50 resize-none h-24 text-sm"
              />
            </div>
            
            {/* Image Preview Area */}
            {attachedImage && (
              <div className="relative mb-4 ml-14 inline-block">
                <img src={attachedImage} alt="Attachment preview" className="h-40 object-cover rounded border border-gray-700" />
                <button 
                  onClick={() => setAttachedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-500 shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex justify-between items-center border-t border-gray-800 pt-4 ml-14">
              <div className="flex gap-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileInput}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-cyan-400 hover:bg-cyan-900/20 rounded-sm transition-colors text-xs font-bold uppercase tracking-widest"
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Attach Image
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-900/20 rounded-sm transition-colors text-xs font-bold uppercase tracking-widest">
                  <Code2 className="w-3.5 h-3.5" /> Code Snippet
                </button>
              </div>
              <button 
                onClick={handleCreatePost}
                disabled={!newPost.trim() && !attachedImage}
                className="bg-cyan-700 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-900/20 text-xs font-bold uppercase tracking-widest py-2 px-6 rounded-sm transition-all flex items-center gap-2 disabled:opacity-50"
              >
                Broadcast <Send className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Feed Posts */}
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} id={`post-${post.id}`} className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors shadow-lg">
                
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded border border-gray-700 flex items-center justify-center font-bold text-lg ${post.avatar}`}>
                      {post.author.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-100 flex items-center gap-1.5 text-sm">
                        {post.author} 
                        {post.isVerified && <ShieldCheck className="w-4 h-4 text-cyan-500" />}
                      </h3>
                      <p className={`text-[10px] font-mono tracking-widest uppercase ${post.role === 'System Admin' || post.role === 'Apex Executive' ? 'text-red-400' : 'text-gray-500'}`}>
                        {post.role}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-600 font-mono">{post.time}</span>
                    {/* 🚨 ADMIN ONLY: MODERATION BUTTON 🚨 */}
                    {userRole === 'ADMIN' && (
                      <button 
                        onClick={() => handleDeletePost(post.id)} 
                        className="text-gray-600 hover:text-red-500 transition-colors" 
                        title="Admin Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                {post.content && <p className="text-gray-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap ml-13">{post.content}</p>}
                
                {/* Attached Image */}
                {post.image && (
                  <div className="mb-4 ml-13 rounded overflow-hidden border border-gray-800">
                    <img src={post.image} alt="Post attachment" className="w-full h-auto max-h-96 object-cover hover:opacity-90 transition-opacity" />
                  </div>
                )}
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4 ml-13">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold text-gray-400 bg-[#111111] border border-gray-800 px-2 py-1 rounded-sm uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-4 border-t border-gray-800 pt-3 ml-13">
                  <button 
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 transition-colors text-xs font-bold px-2 py-1.5 rounded-sm ${likedPosts[post.id] ? 'text-pink-500 bg-pink-950/20' : 'text-gray-500 hover:text-pink-400 hover:bg-gray-900'}`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${likedPosts[post.id] ? 'fill-current' : ''}`} /> {post.likes}
                  </button>
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className={`flex items-center gap-1.5 transition-colors text-xs font-bold px-2 py-1.5 rounded-sm ${expandedComments[post.id] ? 'text-cyan-400 bg-cyan-950/20' : 'text-gray-500 hover:text-cyan-400 hover:bg-gray-900'}`}
                  >
                    <MessageSquare className={`w-3.5 h-3.5 ${expandedComments[post.id] ? 'fill-current' : ''}`} /> {post.commentCount} Threads
                  </button>
                  
                  {/* UPDATED SHARE BUTTON */}
                  <button 
                    onClick={() => handleShare(post.id)} 
                    className={`flex items-center gap-1.5 text-xs font-bold ml-auto px-2 py-1.5 rounded-sm transition-all ${copiedId === post.id ? 'text-green-400 bg-green-950/30' : 'text-gray-500 hover:text-gray-200 hover:bg-gray-900'}`}
                  >
                    {copiedId === post.id ? (
                      <><Check className="w-3.5 h-3.5" /> Copied!</>
                    ) : (
                      <><Share2 className="w-3.5 h-3.5" /> Share</>
                    )}
                  </button>
                </div>

                {/* EXPANDABLE COMMENT SECTION */}
                {expandedComments[post.id] && (
                  <div className="mt-4 pt-4 border-t border-gray-800 bg-[#070707] -mx-6 -mb-6 p-6 rounded-b-lg ml-7">
                    <div className="space-y-4 mb-4">
                      {postComments[post.id]?.map((c, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className={`w-8 h-8 rounded border border-gray-800 flex items-center justify-center font-bold text-xs shrink-0 ${c.role === 'System Admin' || c.role === 'Apex Executive' ? 'bg-red-900/20 text-red-400' : 'bg-[#111111] text-gray-400'}`}>
                            {c.author.charAt(0)}
                          </div>
                          <div className="bg-[#111111] p-3 rounded-md border border-gray-800 flex-1">
                            <div className="flex justify-between items-baseline mb-1">
                              <span className="font-bold text-xs text-gray-200">{c.author} <span className={`text-[9px] font-mono uppercase ml-1 ${c.role === 'System Admin' || c.role === 'Apex Executive' ? 'text-red-400' : 'text-gray-500'}`}>{c.role}</span></span>
                              <span className="text-[10px] text-gray-600 font-mono">{c.time}</span>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">{c.text}</p>
                          </div>
                        </div>
                      ))}
                      {(!postComments[post.id] || postComments[post.id].length === 0) && (
                        <p className="text-xs text-gray-600 font-mono uppercase tracking-widest text-center py-2">No active threads.</p>
                      )}
                    </div>
                    
                    {/* Add Comment Input */}
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        placeholder="Reply to this broadcast..."
                        className="flex-1 bg-[#111111] text-sm text-gray-200 border border-gray-800 rounded-sm px-4 py-2 focus:outline-none focus:border-cyan-900/50"
                      />
                      <button 
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentInputs[post.id]?.trim()}
                        className="bg-gray-800 hover:bg-cyan-900/50 text-cyan-400 text-xs uppercase tracking-widest px-4 rounded-sm font-bold transition-colors disabled:opacity-50 border border-gray-700 hover:border-cyan-800"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: ENTERPRISE WIDGETS */}
        <div className="space-y-6 hidden lg:block">
          
          {/* System Status Panel */}
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-5 shadow-lg">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-500" /> Org Health
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Workspace IDE</span>
                <span className="text-xs text-green-500 font-mono">100% UP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Code Scanning Engine</span>
                <span className="text-xs text-green-500 font-mono">100% UP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Postgres Database</span>
                <span className="text-xs text-yellow-500 font-mono">45ms LATENCY</span>
              </div>
            </div>
          </div>

          {/* Trending Panel */}
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-5 shadow-lg">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-pink-500" /> Trending Topics
            </h3>
            <div className="space-y-4">
              <div className="cursor-pointer group">
                <p className="text-sm font-bold text-gray-200 group-hover:text-cyan-400 transition-colors">#UnrealEngine5</p>
                <p className="text-[10px] text-gray-500 font-mono">2.4k org mentions</p>
              </div>
              <div className="cursor-pointer group">
                <p className="text-sm font-bold text-gray-200 group-hover:text-cyan-400 transition-colors">#ApexAcademy</p>
                <p className="text-[10px] text-gray-500 font-mono">1.8k org mentions</p>
              </div>
              <div className="cursor-pointer group">
                <p className="text-sm font-bold text-gray-200 group-hover:text-cyan-400 transition-colors">#SupabaseMigration</p>
                <p className="text-[10px] text-gray-500 font-mono">850 org mentions</p>
              </div>
            </div>
          </div>

          {/* Org Directory Panel */}
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-5 shadow-lg">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" /> Executive Staff
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded border border-indigo-900/50 bg-indigo-900/20 text-indigo-400 flex items-center justify-center font-bold text-xs">A</div>
                <div>
                  <p className="text-sm font-bold text-gray-200 flex items-center gap-1">Aparna <ShieldCheck className="w-3 h-3 text-cyan-500"/></p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Co-Founder</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded border border-blue-900/50 bg-blue-900/20 text-blue-400 flex items-center justify-center font-bold text-xs">Y</div>
                <div>
                  <p className="text-sm font-bold text-gray-200 flex items-center gap-1">Yashveer <ShieldCheck className="w-3 h-3 text-cyan-500"/></p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Co-Founder / Lead Arch</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}