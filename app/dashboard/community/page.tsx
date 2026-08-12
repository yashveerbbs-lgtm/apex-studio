'use client'
import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Heart, Share2, Image as ImageIcon, Code2, Send, Server, ShieldCheck, TrendingUp, Activity, Users, X, UploadCloud, Trash2, Check } from 'lucide-react'
import { supabase } from '../../../utils/supabase'

export default function EnterpriseNetwork() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<'ADMIN' | 'INTERN'>('INTERN') 
  
  // Post & Drag-and-Drop State
  const [newPost, setNewPost] = useState('')
  const [attachedImage, setAttachedImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Interaction State
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({})
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({})
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({})
  const [copiedId, setCopiedId] = useState<number | null>(null) 
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
      avatar: 'bg-purple-100 text-purple-600 border-purple-200',
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
      avatar: 'bg-sky-100 text-sky-600 border-sky-200',
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
      role: userRole === 'ADMIN' ? 'System Admin' : 'Apex Staff', 
      isVerified: userRole === 'ADMIN' || displayName.toLowerCase().includes('yash') || displayName.toLowerCase().includes('aparna'),
      avatar: userRole === 'ADMIN' ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-indigo-100 text-indigo-600 border-indigo-200', 
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
    if (confirm("Are you sure you want to delete this post?")) {
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
      role: userRole === 'ADMIN' ? 'System Admin' : 'Apex Staff',
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
    
    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
  }

  return (
    <div className="h-full bg-slate-50 text-slate-800 overflow-y-auto font-sans transition-colors duration-500">
      
      {/* Enterprise Header */}
      <div className="border-b-2 border-slate-100 bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
              <Server className="w-7 h-7 text-indigo-500 bg-indigo-50 p-1.5 rounded-lg border-2 border-indigo-100" /> Apex Internal Network
            </h1>
            <p className="text-slate-500 text-xs mt-2 font-bold uppercase tracking-wider">Global Communications & Engineering Updates</p>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-black uppercase tracking-widest bg-emerald-50 px-4 py-2.5 rounded-xl border-2 border-emerald-100 shadow-sm">
              <Activity className="w-4 h-4 animate-pulse" /> Org Servers Online
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: THE FEED */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Create Post Box (Drag and Drop Zone) */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`bg-white border-2 ${isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-slate-100'} rounded-[2rem] p-6 sm:p-8 shadow-sm transition-all relative overflow-hidden`}
          >
            {isDragging && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 rounded-[2rem] border-4 border-dashed border-indigo-300 flex flex-col items-center justify-center text-indigo-500">
                <UploadCloud className="w-14 h-14 mb-3 animate-bounce" />
                <p className="font-black tracking-widest uppercase">Drop Image to Attach</p>
              </div>
            )}

            <div className="flex gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl text-white flex items-center justify-center font-black text-xl shrink-0 border-2 shadow-sm ${userRole === 'ADMIN' ? 'bg-rose-50 text-rose-500 border-rose-200' : 'bg-indigo-50 text-indigo-500 border-indigo-200'}`}>
                {(currentUser?.user_metadata?.full_name || currentUser?.email || 'A').charAt(0).toUpperCase()}
              </div>
              <textarea 
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={userRole === 'ADMIN' ? "Broadcast an official admin update..." : "Broadcast an update to the company network..."}
                className="w-full bg-slate-50 text-slate-800 font-medium border-2 border-slate-200 rounded-2xl p-4 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 resize-none h-28 text-sm placeholder:text-slate-400 transition-all"
              />
            </div>
            
            {/* Image Preview Area */}
            {attachedImage && (
              <div className="relative mb-4 sm:ml-16 inline-block">
                <img src={attachedImage} alt="Attachment preview" className="h-40 object-cover rounded-xl border-2 border-slate-200 shadow-sm" />
                <button 
                  onClick={() => setAttachedImage(null)}
                  className="absolute -top-2 -right-2 bg-white text-rose-500 border-2 border-slate-200 rounded-lg p-1.5 hover:scale-105 shadow-sm transition-transform"
                >
                  <X className="w-4 h-4 font-bold" />
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t-2 border-slate-100 pt-5 sm:ml-16 gap-4 sm:gap-0">
              <div className="flex gap-3">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileInput}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="flex items-center gap-2 px-4 py-2 text-slate-500 bg-white border-2 border-slate-200 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-xl transition-all text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow"
                >
                  <ImageIcon className="w-4 h-4" /> Attach Image
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-slate-500 bg-white border-2 border-slate-200 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-xl transition-all text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow">
                  <Code2 className="w-4 h-4" /> Snippet
                </button>
              </div>
              <button 
                onClick={handleCreatePost}
                disabled={!newPost.trim() && !attachedImage}
                className="btn-indigo text-xs py-3 px-6 w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Broadcast <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Feed Posts */}
          <div className="space-y-6">
            {posts.map(post => (
              <div key={post.id} id={`post-${post.id}`} className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 sm:p-8 hover:border-indigo-200 transition-colors shadow-sm hover:shadow-md">
                
                {/* Post Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-black text-xl shadow-sm ${post.avatar}`}>
                      {post.author.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 flex items-center gap-1.5 text-base">
                        {post.author} 
                        {post.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                      </h3>
                      <p className={`text-[10px] font-bold tracking-wider uppercase mt-0.5 ${post.role === 'System Admin' || post.role === 'Apex Executive' ? 'text-rose-500' : 'text-slate-400'}`}>
                        {post.role}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{post.time}</span>
                    {userRole === 'ADMIN' && (
                      <button 
                        onClick={() => handleDeletePost(post.id)} 
                        className="text-slate-400 hover:text-rose-500 bg-white border-2 border-slate-100 hover:border-rose-100 p-2 rounded-lg shadow-sm transition-all hover:scale-105" 
                        title="Admin Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                {post.content && <p className="text-slate-600 font-medium text-sm leading-relaxed mb-5 whitespace-pre-wrap sm:ml-16">{post.content}</p>}
                
                {/* Attached Image */}
                {post.image && (
                  <div className="mb-5 sm:ml-16 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm">
                    <img src={post.image} alt="Post attachment" className="w-full h-auto max-h-[28rem] object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                )}
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6 sm:ml-16">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border-2 border-indigo-100 px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-3 border-t-2 border-slate-100 pt-5 sm:ml-16">
                  <button 
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-2 transition-all text-xs font-bold px-4 py-2.5 rounded-xl border-2 shadow-sm ${likedPosts[post.id] ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-slate-500 bg-slate-50 border-slate-200 hover:text-rose-500 hover:border-rose-200 hover:bg-white'}`}
                  >
                    <Heart className={`w-4 h-4 ${likedPosts[post.id] ? 'fill-current' : ''}`} /> {post.likes}
                  </button>
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className={`flex items-center gap-2 transition-all text-xs font-bold px-4 py-2.5 rounded-xl border-2 shadow-sm ${expandedComments[post.id] ? 'text-indigo-600 bg-indigo-50 border-indigo-200' : 'text-slate-500 bg-slate-50 border-slate-200 hover:text-indigo-600 hover:border-indigo-200 hover:bg-white'}`}
                  >
                    <MessageSquare className={`w-4 h-4 ${expandedComments[post.id] ? 'fill-current' : ''}`} /> {post.commentCount} Threads
                  </button>
                  
                  {/* SHARE BUTTON */}
                  <button 
                    onClick={() => handleShare(post.id)} 
                    className={`flex items-center gap-2 text-xs font-bold ml-auto px-4 py-2.5 rounded-xl border-2 transition-all shadow-sm ${copiedId === post.id ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-slate-500 bg-white border-slate-200 hover:text-slate-700 hover:bg-slate-50'}`}
                  >
                    {copiedId === post.id ? (
                      <><Check className="w-4 h-4" /> Copied</>
                    ) : (
                      <><Share2 className="w-4 h-4" /> Share</>
                    )}
                  </button>
                </div>

                {/* EXPANDABLE COMMENT SECTION */}
                {expandedComments[post.id] && (
                  <div className="mt-6 pt-6 border-t-2 border-slate-100 bg-slate-50 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-6 sm:p-8 rounded-b-[2rem]">
                    <div className="space-y-4 mb-6">
                      {postComments[post.id]?.map((c, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${c.role === 'System Admin' || c.role === 'Apex Executive' ? 'bg-rose-100 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-500'}`}>
                            {c.author.charAt(0)}
                          </div>
                          <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 flex-1 shadow-sm">
                            <div className="flex justify-between items-baseline mb-2">
                              <span className="font-extrabold text-sm text-slate-800">{c.author} <span className={`text-[9px] font-bold uppercase tracking-wider ml-2 ${c.role === 'System Admin' || c.role === 'Apex Executive' ? 'text-rose-500 bg-rose-50 px-2 py-1 rounded border border-rose-100' : 'text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200'}`}>{c.role}</span></span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{c.time}</span>
                            </div>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">{c.text}</p>
                          </div>
                        </div>
                      ))}
                      {(!postComments[post.id] || postComments[post.id].length === 0) && (
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-center py-4 bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl">No active threads.</p>
                      )}
                    </div>
                    
                    {/* Add Comment Input */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        placeholder="Reply to this broadcast..."
                        className="flex-1 bg-white text-sm font-bold text-slate-700 border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm placeholder:text-slate-300"
                      />
                      <button 
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentInputs[post.id]?.trim()}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs uppercase tracking-wider px-6 py-3 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50 disabled:shadow-none shadow-[0_4px_0_rgb(67,56,202)] hover:shadow-[0_2px_0_rgb(67,56,202)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none"
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
          <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 border-b-2 border-slate-50 pb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500 bg-indigo-50 p-1 rounded-md" /> Org Health
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border-2 border-slate-100">
                <span className="text-sm text-slate-600 font-bold">Workspace IDE</span>
                <span className="text-xs text-emerald-500 font-black">100% UP</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border-2 border-slate-100">
                <span className="text-sm text-slate-600 font-bold">Code Scanning</span>
                <span className="text-xs text-emerald-500 font-black">100% UP</span>
              </div>
              <div className="flex justify-between items-center bg-amber-50 p-3 rounded-xl border-2 border-amber-100">
                <span className="text-sm text-amber-700 font-bold">Database</span>
                <span className="text-xs text-amber-500 font-black">45ms LAT</span>
              </div>
            </div>
          </div>

          {/* Trending Panel */}
          <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 border-b-2 border-slate-50 pb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-500 bg-rose-50 p-1 rounded-md" /> Trending Topics
            </h3>
            <div className="space-y-4">
              <div className="cursor-pointer group bg-slate-50 hover:bg-indigo-50 p-3 rounded-xl border-2 border-slate-100 hover:border-indigo-200 transition-all">
                <p className="text-sm font-extrabold text-slate-700 group-hover:text-indigo-600 transition-colors">#UnrealEngine5</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">2.4k org mentions</p>
              </div>
              <div className="cursor-pointer group bg-slate-50 hover:bg-indigo-50 p-3 rounded-xl border-2 border-slate-100 hover:border-indigo-200 transition-all">
                <p className="text-sm font-extrabold text-slate-700 group-hover:text-indigo-600 transition-colors">#ApexAcademy</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">1.8k org mentions</p>
              </div>
              <div className="cursor-pointer group bg-slate-50 hover:bg-indigo-50 p-3 rounded-xl border-2 border-slate-100 hover:border-indigo-200 transition-all">
                <p className="text-sm font-extrabold text-slate-700 group-hover:text-indigo-600 transition-colors">#SupabaseMigration</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">850 org mentions</p>
              </div>
            </div>
          </div>

          {/* Org Directory Panel */}
          <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 border-b-2 border-slate-50 pb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-500 bg-sky-50 p-1 rounded-md" /> Executive Staff
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border-2 border-slate-100">
                <div className="w-10 h-10 rounded-xl border-2 border-indigo-200 bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm shadow-sm">A</div>
                <div>
                  <p className="text-sm font-extrabold text-slate-800 flex items-center gap-1">Aparna <ShieldCheck className="w-3.5 h-3.5 text-emerald-500"/></p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">Co-Founder</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border-2 border-slate-100">
                <div className="w-10 h-10 rounded-xl border-2 border-sky-200 bg-sky-50 text-sky-600 flex items-center justify-center font-black text-sm shadow-sm">Y</div>
                <div>
                  <p className="text-sm font-extrabold text-slate-800 flex items-center gap-1">Yashveer <ShieldCheck className="w-3.5 h-3.5 text-emerald-500"/></p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">Co-Founder / Lead Arch</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}