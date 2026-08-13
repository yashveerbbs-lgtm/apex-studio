'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, MonitorPlay, Code2, Database, BrainCircuit, ChevronLeft, ChevronRight, Clock, BarChart, CheckCircle2, PlayCircle, Award, Sparkles, ShieldCheck, Plus, X, Trash2, Edit2, Image as ImageIcon, Gem } from 'lucide-react'
import { supabase } from '../../../utils/supabase'

export default function ApexAcademy() {
  const router = useRouter()
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<'ADMIN' | 'INTERN'>('INTERN')
  
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newDuration, setNewDuration] = useState('4 Weeks')
  const [newLevel, setNewLevel] = useState('Beginner')
  const [newTags, setNewTags] = useState('')
  const [newSyllabus, setNewSyllabus] = useState('')
  
  const [newImage, setNewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      image: null,
      reward: 50
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
      image: null,
      reward: 75
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
      image: null,
      reward: 100
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
      image: null,
      reward: 40
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

  function handleDeployCourse(e: React.FormEvent) {
    e.preventDefault()
    const tagsArray = newTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    const syllabusArray = newSyllabus.split('\n').map(item => item.trim()).filter(item => item !== '')

    if (editingCourseId) {
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
        image: newImage,
        reward: 30
      }
      setCourses([newCourse, ...courses])
    }

    closeModal()
    alert(`Course successfully saved!`)
  }

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

  function handleDeleteCourse(e: React.MouseEvent, courseId: string) {
    e.stopPropagation() 
    if (confirm("Are you sure you want to delete this course from the Academy?")) {
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
      <div className="h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-8 md:p-12 overflow-y-auto font-sans transition-colors duration-500">
        <button 
          onClick={() => { setSelectedCourse(null); setIsSuccess(false); }}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8 text-sm font-bold tracking-widest uppercase bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border-2 border-slate-100 dark:border-slate-800 w-fit hover:-translate-y-0.5 active:translate-y-0"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Catalog
        </button>

        <div className="max-w-4xl mx-auto">
          {isSuccess ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-emerald-100 dark:border-emerald-900/50 rounded-3xl p-12 shadow-xl text-center animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
              
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-400"></div>

              <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-4">Enrollment Confirmed!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-lg mx-auto font-medium">
                Welcome to <span className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedCourse.title}</span>. Your interactive cloud learning environment is fully provisioned.
              </p>
              
              <button 
                onClick={() => router.push('/dashboard/workspace')}
                className="btn-indigo flex items-center justify-center gap-2 mx-auto px-8 py-4 text-lg"
              >
                Enter the Workspace <PlayCircle className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
              
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm relative overflow-hidden transition-colors">
                  
                  {selectedCourse.image && (
                    <img 
                      src={selectedCourse.image} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover opacity-5 z-0 pointer-events-none" 
                    />
                  )}

                  <div className="relative z-10">
                    <div className="flex gap-2 mb-4">
                      {selectedCourse.tags.map((tag: string) => (
                        <span key={tag} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/50 border-2 border-indigo-100 dark:border-indigo-800 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 mb-4 leading-tight transition-colors">
                      {selectedCourse.title}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-6 font-medium transition-colors">
                      {selectedCourse.desc}
                    </p>
                    
                    <div className="flex flex-wrap gap-6 border-t-2 border-slate-100 dark:border-slate-800 pt-6 transition-colors">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-bold transition-colors">
                        <Clock className="w-5 h-5 text-indigo-400 dark:text-indigo-500" /> {selectedCourse.duration}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-bold transition-colors">
                        <BarChart className="w-5 h-5 text-emerald-400 dark:text-emerald-500" /> {selectedCourse.level}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-bold transition-colors">
                        <Award className="w-5 h-5 text-amber-400 dark:text-amber-500" /> Certificate Included
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm transition-colors">
                  <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 transition-colors">
                    <BookOpen className="w-6 h-6 text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 p-1 rounded-lg transition-colors" /> Course Syllabus
                  </h3>
                  <div className="space-y-4">
                    {selectedCourse.syllabus.map((item: string, idx: number) => (
                      <div key={idx} className="flex gap-4 items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-100 dark:border-slate-700/50 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-black flex items-center justify-center shrink-0 border-2 border-indigo-100 dark:border-indigo-800/50 shadow-sm transition-colors">
                          {idx + 1}
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-bold transition-colors">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm sticky top-8 transition-colors">
                  <div className="aspect-video bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-6 flex items-center justify-center border-2 border-slate-100 dark:border-slate-700 group cursor-pointer overflow-hidden relative shadow-sm transition-colors">
                    {selectedCourse.image ? (
                      <img src={selectedCourse.image} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" />
                    ) : (
                      <selectedCourse.icon className="absolute inset-0 opacity-5 w-full h-full text-indigo-900 dark:text-indigo-100" />
                    )}
                    <PlayCircle className="w-16 h-16 text-indigo-400 dark:text-indigo-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:scale-110 transition-all z-10 drop-shadow-md bg-white dark:bg-slate-900 rounded-full" />
                    <span className="absolute bottom-3 text-[10px] font-bold text-slate-600 dark:text-slate-300 tracking-widest z-10 uppercase bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full shadow-sm">Interactive Engine</span>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1 transition-colors">Instructors</p>
                    <p className="text-slate-700 dark:text-slate-200 font-extrabold flex items-center gap-2 transition-colors">
                      {selectedCourse.instructor} <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    </p>
                  </div>

                  <div className="mb-6 bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-100 dark:border-amber-800/50 rounded-xl p-4 flex items-center justify-between transition-colors">
                    <div>
                      <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest transition-colors">Completion Bonus</p>
                      <p className="text-sm font-black text-amber-700 dark:text-amber-400 transition-colors">+{selectedCourse.reward} Gems</p>
                    </div>
                    <Gem className="w-8 h-8 text-amber-500 dark:text-amber-400 fill-amber-200 dark:fill-amber-900 animate-pulse transition-colors" />
                  </div>

                  <button 
                    onClick={handleEnrollment}
                    disabled={isEnrolling}
                    className="btn-emerald w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-50"
                  >
                    {isEnrolling ? 'Provisioning Cloud Engine...' : 'Enroll For Free'}
                  </button>
                  
                  <p className="text-center text-xs text-slate-400 dark:text-slate-500 font-medium mt-4 leading-relaxed transition-colors">
                    Instantly generates a secure, pre-configured coding environment in your browser.
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
    <div className="h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-8 md:p-12 overflow-y-auto font-sans relative transition-colors duration-500">
      
      {/* 🚨 ADMIN CREATION/EDIT MODAL 🚨 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] max-w-2xl w-full p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-y-auto max-h-[90vh] animate-in zoom-in-95 relative overflow-hidden transition-colors">
            
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-400 to-purple-400"></div>

            <div className="flex justify-between items-center mb-6 border-b-2 border-slate-100 dark:border-slate-800 pb-4 mt-2 transition-colors">
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors">
                  {editingCourseId ? 'Update Course' : 'Create New Course'}
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-wider transition-colors">Push curriculum to Academy</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border-2 border-slate-100 dark:border-slate-700 transition-colors hover:-translate-y-0.5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeployCourse} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">Course Title</label>
                <input 
                  type="text" 
                  required 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500" 
                  placeholder="e.g. Advanced System Architecture" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">Course Description</label>
                <textarea 
                  required 
                  value={newDesc} 
                  onChange={e => setNewDesc(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all h-24 resize-none placeholder:text-slate-300 dark:placeholder:text-slate-500" 
                  placeholder="What will students learn in this course?" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">Duration</label>
                  <input 
                    type="text" 
                    required 
                    value={newDuration} 
                    onChange={e => setNewDuration(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500" 
                    placeholder="e.g. 4 Weeks" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">Difficulty Level</label>
                  <select 
                    value={newLevel} 
                    onChange={e => setNewLevel(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
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
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">Tech Tags (Comma separated)</label>
                  <input 
                    type="text" 
                    value={newTags} 
                    onChange={e => setNewTags(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500" 
                    placeholder="e.g. React, Node, AWS" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">Syllabus (One per line)</label>
                  <textarea 
                    value={newSyllabus} 
                    onChange={e => setNewSyllabus(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all h-20 resize-none placeholder:text-slate-300 dark:placeholder:text-slate-500" 
                    placeholder="Module 1&#10;Module 2&#10;Final Exam" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">Course Cover Image</label>
                <div className="flex items-center gap-4">
                  {newImage && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shrink-0 shadow-sm transition-colors">
                      <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setNewImage(null)} 
                        className="absolute top-1 right-1 bg-white dark:bg-slate-800 p-1 rounded-md text-red-500 shadow-sm hover:scale-105 transition-transform"
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
                    className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-700 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors w-full shadow-sm hover:shadow"
                  >
                    <ImageIcon className="w-5 h-5" /> {newImage ? 'Replace Cover Image' : 'Attach Cover Image'}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-indigo w-full py-4 mt-6 text-sm"
              >
                {editingCourseId ? 'Save Changes' : 'Publish Course'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12 max-w-7xl mx-auto border-b-2 border-slate-100 dark:border-slate-800 pb-8 transition-colors">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 border-2 border-indigo-100 dark:border-indigo-800 px-3 py-1 rounded-lg font-bold tracking-widest text-xs uppercase shadow-sm transition-colors">
              <BookOpen className="w-4 h-4" /> Apex Academy
            </div>
            {userRole === 'ADMIN' && (
              <div className="text-[10px] bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 border-2 border-amber-200 dark:border-amber-800/50 px-2.5 py-1 rounded-lg font-black uppercase tracking-widest flex items-center gap-1 shadow-sm transition-colors">
                <ShieldCheck className="w-3 h-3" /> Instructor Auth
              </div>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-800 dark:text-slate-100 mb-4 transition-colors">
            Master the craft.
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-medium transition-colors">
            World-class engineering, data science, and development courses. Skip the videos—learn the concepts here, and instantly build them in your cloud workspace.
          </p>
        </div>

        {userRole === 'ADMIN' && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="shrink-0 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-100 dark:border-indigo-800 px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all mt-2 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-5 h-5 bg-indigo-50 dark:bg-indigo-900/50 p-0.5 rounded-md" /> Create Course
          </button>
        )}
      </div>

      {/* COURSE CATALOG */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <button
            key={course.id}
            onClick={() => setSelectedCourse(course)}
            className="flex flex-col text-left bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-7 rounded-[2rem] hover:border-indigo-300 dark:hover:border-indigo-700 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group relative overflow-hidden"
          >
            {userRole === 'ADMIN' && (
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div 
                  onClick={(e) => { e.stopPropagation(); openEditModal(course); }}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-700 shadow-sm transition-colors hover:scale-105"
                  title="Edit Course"
                >
                  <Edit2 className="w-4 h-4" />
                </div>
                <div 
                  onClick={(e) => handleDeleteCourse(e, course.id)}
                  className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-700 shadow-sm transition-colors hover:scale-105"
                  title="Delete Course"
                >
                  <Trash2 className="w-4 h-4" />
                </div>
              </div>
            )}

            {course.image && (
              <img 
                src={course.image} 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover opacity-5 group-hover:opacity-10 transition-opacity z-0" 
              />
            )}

            <div className="flex justify-between items-start mb-6 relative z-10 w-full">
              <div className="p-3.5 bg-indigo-50 dark:bg-indigo-900/30 group-hover:bg-indigo-500 group-hover:text-white text-indigo-500 dark:text-indigo-400 rounded-2xl transition-colors border-2 border-indigo-100 dark:border-indigo-800/50 group-hover:border-indigo-600 shadow-sm">
                <course.icon className="w-6 h-6" />
              </div>
              
              {/* Gamified Reward Hint on Card */}
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border-2 border-slate-100 dark:border-slate-700 uppercase tracking-widest mb-2 transition-colors">
                  {course.level}
                </span>
                <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-lg border-2 border-amber-100 dark:border-amber-800/50 uppercase tracking-widest flex items-center gap-1 shadow-sm transition-colors">
                  +{course.reward} <Gem className="w-3 h-3 fill-amber-200 dark:fill-amber-900" />
                </span>
              </div>
            </div>
            
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-3 line-clamp-2 leading-tight relative z-10 transition-colors">
              {course.title}
            </h3>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed flex-1 mb-6 line-clamp-3 relative z-10 transition-colors">
              {course.desc}
            </p>
            
            <div className="w-full pt-5 border-t-2 border-slate-100 dark:border-slate-800 flex items-center justify-between relative z-10 transition-colors">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1 transition-colors">
                <Clock className="w-4 h-4 text-slate-300 dark:text-slate-600" /> {course.duration}
              </span>
              <div className="text-xs font-bold text-white bg-indigo-500 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1 transform group-hover:translate-x-0 translate-x-2 uppercase tracking-widest shadow-sm">
                Start <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </button>
        ))}
        
        {courses.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl transition-colors">
            <p className="text-sm text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold transition-colors">No active courses in Academy</p>
          </div>
        )}
      </div>
    </div>
  )
}