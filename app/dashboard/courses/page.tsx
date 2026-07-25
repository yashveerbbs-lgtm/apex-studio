'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, MonitorPlay, Code2, Database, BrainCircuit, ChevronLeft, ChevronRight, Clock, BarChart, CheckCircle2, PlayCircle, Award, Sparkles, ShieldCheck, Plus, X, Trash2, Edit2, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../../../utils/supabase'

export default function ApexAcademy() {
  const router = useRouter()
  
  // ROLE & AUTH STATE
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<'ADMIN' | 'INTERN'>('INTERN')
  
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // ADMIN CREATION & EDIT STATE
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newDuration, setNewDuration] = useState('4 Weeks')
  const [newLevel, setNewLevel] = useState('Beginner')
  const [newTags, setNewTags] = useState('')
  const [newSyllabus, setNewSyllabus] = useState('')
  
  // IMAGE UPLOAD STATE
  const [newImage, setNewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 🚨 DYNAMIC COURSES STATE (FIXED STRICT TYPING) 🚨
  const [courses, setCourses] = useState<any[]>([
    { 
      id: 'nextjs-mastery', 
      title: 'Full-Stack Engineering with Next.js', 
      instructor: 'Apex Lead Architect',
      icon: MonitorPlay, 
      level: 'Intermediate',
      duration: '8 Weeks',
      tags: ['React', 'Supabase', 'Tailwind'],
      desc: 'Master the modern web stack. Build secure, scalable, and beautifully designed enterprise applications from scratch.',
      syllabus: ['Console & Variables', 'Arrays & Objects', 'Functions & Logic', 'Component Architecture'],
      image: null
    },
    { 
      id: 'sports-analytics', 
      title: 'Sports Data & Predictive AI', 
      instructor: 'Data Science Team',
      icon: BrainCircuit, 
      level: 'Advanced',
      duration: '10 Weeks',
      tags: ['Python', 'Machine Learning', 'Pandas'],
      desc: 'Learn applied data science by building predictive machine learning models to analyze player statistics, match outcomes, and real-time cricket data.',
      syllabus: ['Python Fundamentals', 'Data cleaning with Pandas', 'Training models', 'Visualizing match trends'],
      image: null
    },
    { 
      id: 'game-engine', 
      title: '3D Game Engine Mechanics', 
      instructor: 'Apex Interactive',
      icon: Code2, 
      level: 'Advanced',
      duration: '12 Weeks',
      tags: ['C++', 'Unreal Engine', 'Physics'],
      desc: 'Dive deep into the mathematics and code behind modern 3D game engines. Build your own physics simulations and rendering pipelines.',
      syllabus: ['Vector mathematics', 'Collision detection', 'High-performance memory management', 'Rendering graphics pipelines'],
      image: null
    },
    { 
      id: 'backend-go', 
      title: 'Microservices with Go', 
      instructor: 'Infrastructure Team',
      icon: Database, 
      level: 'Beginner to Pro',
      duration: '6 Weeks',
      tags: ['Golang', 'Docker', 'APIs'],
      desc: 'Write lightning-fast backend services. Learn how to design, containerize, and orchestrate microservices used by millions.',
      syllabus: ['Go fundamentals (Goroutines)', 'Building REST APIs', 'Containerization with Docker', 'Inter-service communication'],
      image: null
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

  // 🚨 IMAGE UPLOAD LOGIC 🚨
  function handleImageProcess(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      setNewImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // 🚨 ADMIN ACTION: DEPLOY OR UPDATE COURSE 🚨
  function handleDeployCourse(e: React.FormEvent) {
    e.preventDefault()
    const tagsArray = newTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    const syllabusArray = newSyllabus.split('\n').map(item => item.trim()).filter(item => item !== '')

    if (editingCourseId) {
      // Update existing course
      setCourses(courses.map(c => {
        if (c.id === editingCourseId) {
          return {
            ...c,
            title: newTitle,
            level: newLevel,
            duration: newDuration,
            tags: tagsArray.length > 0 ? tagsArray : ['General'],
            desc: newDesc,
            syllabus: syllabusArray.length > 0 ? syllabusArray : ['Course Introduction', 'Core Concepts', 'Final Project'],
            image: newImage || c.image
          }
        }
        return c
      }))
    } else {
      // Create new course
      const newCourse = {
        id: `course-${Date.now()}`,
        title: newTitle,
        instructor: 'Apex Executive Team',
        icon: BookOpen,
        level: newLevel,
        duration: newDuration,
        tags: tagsArray.length > 0 ? tagsArray : ['General'],
        desc: newDesc,
        syllabus: syllabusArray.length > 0 ? syllabusArray : ['Course Introduction', 'Core Concepts', 'Final Project'],
        image: newImage
      }
      setCourses([newCourse, ...courses])
    }

    closeModal()
    alert(`System Update: Course successfully saved.`)
  }

  // 🚨 ADMIN ACTION: OPEN EDIT MODAL 🚨
  function openEditModal(course: any) {
    setEditingCourseId(course.id)
    setNewTitle(course.title)
    setNewDesc(course.desc)
    setNewDuration(course.duration)
    setNewLevel(course.level)
    setNewTags(course.tags.join(', '))
    setNewSyllabus(course.syllabus.join('\n'))
    setNewImage(course.image || null)
    setShowCreateModal(true)
  }

  function closeModal() {
    setShowCreateModal(false)
    setEditingCourseId(null)
    setNewTitle('')
    setNewDesc('')
    setNewTags('')
    setNewSyllabus('')
    setNewImage(null)
  }

  // 🚨 ADMIN ACTION: DELETE COURSE 🚨
  function handleDeleteCourse(e: React.MouseEvent, courseId: string) {
    e.stopPropagation() // Prevent opening the course details
    if (confirm("ADMIN OVERRIDE: Permanently delete this course from the Academy?")) {
      setCourses(courses.filter(c => c.id !== courseId))
    }
  }

  async function handleEnrollment() {
    setIsEnrolling(true)
    
    if (!currentUser) {
      alert("Please log in or register to enroll in the Academy.")
      router.push('/auth/login')
      return
    }

    const teamName = `Academy: ${selectedCourse.title}`
    const { data: team, error: teamError } = await supabase.from('teams').insert([{ name: teamName }]).select().single()

    if (team && !teamError) {
      await supabase.from('team_members').insert([{ team_id: team.id, user_id: currentUser.id, role: 'admin' }])

      // DYNAMIC LEVEL 1 INJECTION
      let lessonContent = `# Welcome to ${selectedCourse.title} 🚀\n\nYour interactive cloud environment is ready. Follow the syllabus and build directly in this workspace.\n\n### Next Steps\nCheck the company wiki for the first assignment!`
      let mainFileName = 'main.js'
      let mainFileLang = 'javascript'
      let mainFileContent = '// Write your code below!\nconsole.log("Environment Initialized");\n'

      if (selectedCourse.title === 'Full-Stack Engineering with Next.js') {
        mainFileName = 'index.js'
        lessonContent = `# Level 1: Console Logging 🌐\nWelcome to JavaScript, the language of the web. The most basic way to see what your code is doing is to log it to the console.\n\n### The Warm-up (Copy This)\n\`\`\`javascript\nconsole.log("Hello World");\n\`\`\`\n\n### The Test 👀\n**Your Mission:**\nUse console.log to print Hello World to the terminal.\n*Don't forget your semi-colon at the end!*`
      } 
      else if (selectedCourse.title === 'Sports Data & Predictive AI') {
        mainFileName = 'main.py'
        mainFileLang = 'python'
        mainFileContent = '# Write your code below!\n'
        lessonContent = `# Level 1: The Art of the Variable 🏏\nWelcome to Python! Think of a variable like a kit bag. You can stuff whatever you want inside it.\n\n### The Warm-up (Copy This)\n\`\`\`python\ncaptain = "MS Dhoni"\nprint(captain)\n\`\`\`\n\n### The Test 👀\nDelete the code and try it from memory!\n1. Create a variable named captain.\n2. Set it to "MS Dhoni".\n3. Print it.`
      }
      else if (selectedCourse.title === '3D Game Engine Mechanics') {
        mainFileName = 'main.cpp'
        mainFileLang = 'cpp'
        mainFileContent = '#include <iostream>\n\nint main() {\n    // Write your code below!\n\n    return 0;\n}'
        lessonContent = `# Level 1: Initialization 🎮\nWelcome to C++. It is incredibly fast, powerful, and runs the world's best game engines.\n\n### The Warm-up (Copy This)\n\`\`\`cpp\nstd::cout << "Engine initialized";\n\`\`\`\n\n### The Test 👀\nInside your main function, use \`std::cout\` to print "Engine initialized" to the console. Don't forget the semicolon!`
      }
      else if (selectedCourse.title === 'Microservices with Go') {
        mainFileName = 'main.go'
        mainFileLang = 'go'
        mainFileContent = 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your code below!\n\n}'
        lessonContent = `# Level 1: The Go Server 🚀\nGo is designed by Google for massive scale and concurrency.\n\n### The Warm-up (Copy This)\n\`\`\`go\nfmt.Println("Server running")\n\`\`\`\n\n### The Test 👀\nInside your main function, use \`fmt.Println\` to print "Server running" to the console.`
      }

      await supabase.from('workspace_nodes').insert([
        { team_id: team.id, name: 'LESSON.md', is_folder: false, content: lessonContent, language: 'markdown' },
        { team_id: team.id, name: mainFileName, is_folder: false, content: mainFileContent, language: mainFileLang }
      ])
    }

    setIsEnrolling(false)
    setIsSuccess(true)
  }

  if (selectedCourse) {
    return (
      <div className="h-full bg-[#050505] text-white p-8 md:p-12 overflow-y-auto font-sans">
        <button 
          onClick={() => { setSelectedCourse(null); setIsSuccess(false); }}
          className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors mb-8 text-sm font-bold tracking-widest uppercase"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Catalog
        </button>

        <div className="max-w-4xl mx-auto">
          {isSuccess ? (
            <div className="bg-[#0a0a0a] border border-green-900/50 rounded-2xl p-12 shadow-2xl text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-900/50">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Enrollment Confirmed!</h2>
              <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
                Welcome to <span className="text-gray-200 font-semibold">{selectedCourse.title}</span>. Your interactive cloud learning environment has been generated.
              </p>
              
              <button 
                onClick={() => router.push('/dashboard/workspace')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center justify-center gap-2 mx-auto shadow-lg shadow-indigo-900/20"
              >
                Go to Classroom <PlayCircle className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
              
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
                  
                  {selectedCourse.image && (
                    <img 
                      src={selectedCourse.image} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover opacity-10 z-0 pointer-events-none" 
                    />
                  )}

                  <div className="relative z-10">
                    <div className="flex gap-2 mb-4">
                      {selectedCourse.tags.map((tag: string) => (
                        <span key={tag} className="px-3 py-1 bg-cyan-900/20 border border-cyan-900/50 rounded-full text-xs font-bold text-cyan-400 uppercase tracking-widest">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                      {selectedCourse.title}
                    </h1>
                    <p className="text-gray-400 text-lg leading-relaxed mb-6">
                      {selectedCourse.desc}
                    </p>
                    
                    <div className="flex flex-wrap gap-6 border-t border-gray-800 pt-6">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Clock className="w-4 h-4 text-cyan-500" /> {selectedCourse.duration}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <BarChart className="w-4 h-4 text-cyan-500" /> {selectedCourse.level}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Award className="w-4 h-4 text-cyan-500" /> Certificate Included
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-400" /> Course Syllabus
                  </h3>
                  <div className="space-y-4">
                    {selectedCourse.syllabus.map((item: string, idx: number) => (
                      <div key={idx} className="flex gap-4 items-center p-4 bg-[#111111] rounded-xl border border-gray-800">
                        <div className="w-8 h-8 rounded-lg bg-indigo-900/20 text-indigo-400 font-bold flex items-center justify-center shrink-0 border border-indigo-900/50">
                          {idx + 1}
                        </div>
                        <p className="text-gray-300 font-medium">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6 shadow-2xl sticky top-8">
                  <div className="aspect-video bg-[#050505] rounded-xl mb-6 flex items-center justify-center border border-gray-800 group cursor-pointer overflow-hidden relative">
                    {selectedCourse.image ? (
                      <img src={selectedCourse.image} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" />
                    ) : (
                      <selectedCourse.icon className="absolute inset-0 opacity-5 w-full h-full" />
                    )}
                    <PlayCircle className="w-12 h-12 text-gray-300 group-hover:text-cyan-400 transition-colors z-10 drop-shadow-lg" />
                    <span className="absolute bottom-3 text-[10px] font-bold text-gray-300 tracking-widest z-10 uppercase drop-shadow-md">Interactive Engine</span>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Instructors</p>
                    <p className="text-gray-200 font-semibold">{selectedCourse.instructor}</p>
                  </div>

                  <button 
                    onClick={handleEnrollment}
                    disabled={isEnrolling}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-900/20"
                  >
                    {isEnrolling ? 'Provisioning Cloud Engine...' : 'Enroll For Free'}
                  </button>
                  
                  <p className="text-center text-xs text-gray-500 mt-4 leading-relaxed">
                    Instantly generates a secure, pre-configured coding environment in your Apex Workspace.
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-[#050505] text-white p-8 md:p-12 overflow-y-auto font-sans relative">
      
      {/* 🚨 ADMIN CREATION/EDIT MODAL 🚨 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#0a0a0a] border border-indigo-900/50 rounded-xl max-w-2xl w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  {editingCourseId ? 'Update Course Details' : 'Deploy New Course'}
                </h2>
                <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">Push curriculum to Academy</p>
              </div>
              <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeployCourse} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Course Title</label>
                <input 
                  type="text" 
                  required 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  className="w-full bg-[#111111] text-sm text-white border border-gray-800 rounded p-3 focus:outline-none focus:border-indigo-500" 
                  placeholder="e.g. Advanced System Architecture" 
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Course Description</label>
                <textarea 
                  required 
                  value={newDesc} 
                  onChange={e => setNewDesc(e.target.value)} 
                  className="w-full bg-[#111111] text-sm text-gray-300 border border-gray-800 rounded p-3 focus:outline-none focus:border-indigo-500 h-24 resize-none" 
                  placeholder="What will students learn in this course?" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Duration</label>
                  <input 
                    type="text" 
                    required 
                    value={newDuration} 
                    onChange={e => setNewDuration(e.target.value)} 
                    className="w-full bg-[#111111] text-sm text-white border border-gray-800 rounded p-3 focus:outline-none focus:border-indigo-500" 
                    placeholder="e.g. 4 Weeks" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Difficulty Level</label>
                  <select 
                    value={newLevel} 
                    onChange={e => setNewLevel(e.target.value)} 
                    className="w-full bg-[#111111] text-sm text-gray-300 border border-gray-800 rounded p-3 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tech Tags (Comma separated)</label>
                  <input 
                    type="text" 
                    value={newTags} 
                    onChange={e => setNewTags(e.target.value)} 
                    className="w-full bg-[#111111] text-sm text-white border border-gray-800 rounded p-3 focus:outline-none focus:border-indigo-500" 
                    placeholder="e.g. React, Node, AWS" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Syllabus (One per line)</label>
                  <textarea 
                    value={newSyllabus} 
                    onChange={e => setNewSyllabus(e.target.value)} 
                    className="w-full bg-[#111111] text-sm text-white border border-gray-800 rounded p-3 focus:outline-none focus:border-indigo-500 h-20 resize-none" 
                    placeholder="Module 1&#10;Module 2&#10;Final Exam" 
                  />
                </div>
              </div>

              {/* 🚨 NEW: IMAGE UPLOAD FIELD 🚨 */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Course Cover Image</label>
                <div className="flex items-center gap-4">
                  {newImage && (
                    <div className="relative w-16 h-16 rounded overflow-hidden border border-gray-700 shrink-0">
                      <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setNewImage(null)} 
                        className="absolute top-0 right-0 bg-red-600 p-1 text-white hover:bg-red-500 transition-colors"
                      >
                        <X className="w-3 h-3"/>
                      </button>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={e => e.target.files && handleImageProcess(e.target.files[0])} 
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    className="flex items-center justify-center gap-2 bg-[#111111] border border-gray-800 text-gray-400 hover:text-cyan-400 px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors w-full"
                  >
                    <ImageIcon className="w-4 h-4" /> {newImage ? 'Replace Cover Image' : 'Attach Cover Image'}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest py-4 rounded mt-6 transition-colors shadow-lg"
              >
                {editingCourseId ? 'Save Changes' : 'Deploy Curriculum to Academy'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12 max-w-7xl mx-auto border-b border-gray-800 pb-8">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-widest text-xs uppercase">
              <BookOpen className="w-4 h-4" /> Apex Academy
            </div>
            {userRole === 'ADMIN' && (
              <div className="text-[9px] bg-red-950/30 text-red-400 border border-red-900/50 px-2 py-0.5 rounded font-bold uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Admin Auth
              </div>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Master the craft.
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            World-class engineering, data science, and development courses. Skip the videos—learn the concepts here, and instantly build them in your cloud workspace.
          </p>
        </div>

        {userRole === 'ADMIN' && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="shrink-0 bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-400 border border-indigo-900/50 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors mt-2"
          >
            <Plus className="w-4 h-4" /> Deploy Course
          </button>
        )}
      </div>

      {/* COURSE CATALOG */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <button
            key={course.id}
            onClick={() => setSelectedCourse(course)}
            className="flex flex-col text-left bg-[#0a0a0a] border border-gray-800 p-7 rounded-2xl hover:border-indigo-500/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-300 group relative overflow-hidden"
          >
            {/* 🚨 ADMIN EDIT & DELETE BUTTONS 🚨 */}
            {userRole === 'ADMIN' && (
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div 
                  onClick={(e) => { e.stopPropagation(); openEditModal(course); }}
                  className="text-gray-400 hover:text-blue-400 bg-black/50 hover:bg-black/80 backdrop-blur-sm p-2 rounded transition-colors"
                  title="Edit Course"
                >
                  <Edit2 className="w-4 h-4" />
                </div>
                <div 
                  onClick={(e) => handleDeleteCourse(e, course.id)}
                  className="text-gray-400 hover:text-red-500 bg-black/50 hover:bg-black/80 backdrop-blur-sm p-2 rounded transition-colors"
                  title="Delete Course"
                >
                  <Trash2 className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* 🚨 DYNAMIC COURSE IMAGE 🚨 */}
            {course.image && (
              <img 
                src={course.image} 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity z-0" 
              />
            )}

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-3.5 bg-[#111111] group-hover:bg-indigo-900/20 group-hover:text-indigo-400 text-gray-500 rounded-xl transition-colors border border-gray-800 group-hover:border-indigo-900/50">
                <course.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 bg-[#111111] px-3 py-1.5 rounded-full border border-gray-800 uppercase tracking-widest mr-12">
                {course.level}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-100 mb-3 line-clamp-2 leading-tight relative z-10">
              {course.title}
            </h3>
            
            <p className="text-sm text-gray-400 leading-relaxed flex-1 mb-6 line-clamp-3 relative z-10">
              {course.desc}
            </p>
            
            <div className="w-full pt-4 border-t border-gray-800 flex items-center justify-between relative z-10">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">{course.duration}</span>
              <div className="text-xs font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1 transform group-hover:translate-x-1 uppercase tracking-widest">
                View Syllabus <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </button>
        ))}
        
        {courses.length === 0 && (
          <div className="col-span-full py-20 text-center border border-dashed border-gray-800 rounded-2xl">
            <p className="text-sm text-gray-500 uppercase tracking-widest font-mono">No active courses in Academy</p>
          </div>
        )}
      </div>
    </div>
  )
}