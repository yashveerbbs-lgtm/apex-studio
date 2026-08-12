'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles, Zap } from 'lucide-react'
import { usePathname } from 'next/navigation'

type Mood = 'idle' | 'happy' | 'thinking' | 'excited' | 'sleepy' | 'dizzy'
type Message = { sender: 'spark' | 'user', text: string }

export default function SparkAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [mood, setMood] = useState<Mood>('idle')
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'spark', text: 'Hey Yash! Grab me, fling me across the screen, or ask me about the team! ✨' }
  ])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // --- MEMORY & DAILY STREAK SYSTEM ---
  useEffect(() => {
    // 1. Load Chat History
    const savedChat = localStorage.getItem('spark_memory')
    if (savedChat) {
      setMessages(JSON.parse(savedChat))
    }

    // 2. Daily Login Streak Logic
    const lastVisit = localStorage.getItem('spark_last_visit')
    const currentStreak = parseInt(localStorage.getItem('spark_streak') || '0')
    const today = new Date().toDateString()

    if (lastVisit !== today) {
      let newStreak = 1
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      if (lastVisit === yesterday) {
        newStreak = currentStreak + 1
      }
      
      localStorage.setItem('spark_last_visit', today)
      localStorage.setItem('spark_streak', newStreak.toString())

      // Congratulate them if they have a streak!
      if (newStreak > 1) {
        setTimeout(() => {
          setIsOpen(true)
          setMood('excited')
          setMessages(prev => {
            const newMsgs = [...prev, { sender: 'spark', text: `Welcome back to the studio! You are on a ${newStreak}-day coding streak! Absolute legend. 🔥🚀` }]
            localStorage.setItem('spark_memory', JSON.stringify(newMsgs))
            return newMsgs as Message[]
          })
        }, 2000)
      }
    }
  }, [])

  // Save chat to memory whenever it updates
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem('spark_memory', JSON.stringify(messages))
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Idle Animation
  useEffect(() => {
    if (isOpen || mood !== 'idle') return
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setMood('happy')
        setTimeout(() => setMood('idle'), 1200)
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [isOpen, mood])

  // --- DEEP PAGE SCANNER & FRIENDLY URLS ---
  const getPageContext = () => {
    // 1. Make URLs friendly
    let friendlyName = "the platform"
    if (pathname.includes('/overview')) friendlyName = "the Main Dashboard"
    else if (pathname.includes('/internships')) friendlyName = "the Internships Pipeline"
    else if (pathname.includes('/courses') || pathname.includes('/academy')) friendlyName = "the Apex Academy"
    
    // 2. Scan the screen for deep context (Workspaces, Courses, etc.)
    const activeWorkspaces = document.querySelectorAll('.workspace-card, [class*="workspace"]').length || document.body.innerText.match(/Recent Workspaces/i) ? "They have recent workspaces open." : ""
    const textOnScreen = document.body.innerText.substring(0, 500) // Grab some raw text to let the AI see stats
    
    return `Yash is currently viewing ${friendlyName}. Screen context data: ${activeWorkspaces} Visible text on screen includes: "${textOnScreen.replace(/\n/g, ' ')}"`
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage = inputText
    const newMessages = [...messages, { sender: 'user', text: userMessage }] as Message[]
    setMessages(newMessages)
    setInputText('')
    setMood('thinking')

    try {
      const pageContext = getPageContext()
      
      // Grab the last 6 messages for conversation memory
      const recentHistory = newMessages.slice(-6)

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage, 
          context: pageContext,
          history: recentHistory 
        })
      })

      const data = await response.json()
      
      setMood('excited')
      setMessages(prev => [...prev, { sender: 'spark', text: data.reply }])
      setTimeout(() => setMood('happy'), 2000)

    } catch (error) {
      setMood('dizzy')
      setMessages(prev => [...prev, { sender: 'spark', text: "Whoops! I lost connection to the mainframe. 😵‍💫" }])
      setTimeout(() => setMood('idle'), 2000)
    }
  }

  const renderEyes = () => {
    switch (mood) {
      case 'happy':
      case 'excited':
        return (
          <>
            <motion.div animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 0.2 }} className="w-2.5 h-3.5 bg-white rounded-full" />
            <motion.div animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 0.2 }} className="w-2.5 h-3.5 bg-white rounded-full" />
          </>
        )
      case 'thinking':
        return (
          <>
            <motion.div animate={{ y: -3, scale: 1.2 }} className="w-3 h-3 bg-white rounded-full" />
            <motion.div animate={{ y: -3 }} className="w-2 h-2 bg-white rounded-full opacity-70" />
          </>
        )
      case 'dizzy':
        return (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }} className="w-3 h-3 border-2 border-white rounded-md" />
            <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }} className="w-3 h-3 border-2 border-white rounded-md" />
          </>
        )
      case 'idle':
      default:
        return (
          <>
            <motion.div animate={{ scaleY: [1, 1, 0.1, 1, 1] }} transition={{ repeat: Infinity, duration: 4, times: [0, 0.9, 0.95, 1] }} className="w-2.5 h-3.5 bg-white rounded-full" />
            <motion.div animate={{ scaleY: [1, 1, 0.1, 1, 1] }} transition={{ repeat: Infinity, duration: 4, times: [0, 0.9, 0.95, 1] }} className="w-2.5 h-3.5 bg-white rounded-full" />
          </>
        )
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="bg-white border-4 border-slate-100 rounded-[2rem] w-80 shadow-[0_20px_50px_rgb(0,0,0,0.1)] mb-6 overflow-hidden flex flex-col pointer-events-auto"
          >
            <div className="bg-indigo-50 border-b-2 border-slate-100 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <span className="font-black text-slate-800 tracking-tight">Spark AI</span>
              </div>
              <button onClick={() => { setIsOpen(false); setMood('idle'); }} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 h-64 overflow-y-auto flex flex-col gap-3 bg-slate-50/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium ${msg.sender === 'user' ? 'bg-indigo-500 text-white rounded-tr-sm shadow-[0_2px_0_rgb(67,56,202)]' : 'bg-white border-2 border-slate-100 text-slate-600 rounded-tl-sm shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {mood === 'thinking' && (
                <div className="flex justify-start">
                  <div className="bg-white border-2 border-slate-100 p-3 rounded-2xl rounded-tl-sm flex gap-1.5 shadow-sm">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-indigo-300 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-indigo-400 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-indigo-500 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t-2 border-slate-100 bg-white">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask Spark anything..."
                  className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all placeholder:text-slate-300"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white p-2.5 rounded-xl transition-all shadow-[0_2px_0_rgb(67,56,202)] disabled:shadow-none active:translate-y-[2px] active:shadow-none"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        drag 
        dragConstraints={{ left: -1500, right: 0, top: -800, bottom: 0 }}
        dragElastic={0.8}
        dragTransition={{ bounceStiffness: 400, bounceDamping: 15 }}
        
        onDragStart={() => {
          setMood('dizzy')
          const dragJokes = [
            "Unhand me, cutie! 😤",
            "AI bots are not made for flinging! 🎢",
            "Wheeeeee! Wait, no, put me down! 🛸",
            "Do I look like a frisbee to you?! 🥏",
            "Hey! Watch the digital paint job! 🎨"
          ]
          const randomJoke = dragJokes[Math.floor(Math.random() * dragJokes.length)]
          
          setMessages(prev => {
            const newMsgs = [...prev, { sender: 'spark', text: randomJoke }]
            localStorage.setItem('spark_memory', JSON.stringify(newMsgs))
            return newMsgs as Message[]
          })
          if (!isOpen) setIsOpen(true)
        }}
        onDragEnd={() => {
           setTimeout(() => setMood('idle'), 2000)
        }}

        whileDrag={{ scale: 1.15, cursor: 'grabbing' }}
        onClick={() => { if (!isOpen) { setIsOpen(true); setMood('happy'); } }}
        className="relative cursor-grab pointer-events-auto"
      >
        <div className={`w-16 h-16 rounded-[2rem] shadow-[0_10px_20px_rgb(99,102,241,0.4)] border-4 border-white flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
          mood === 'excited' ? 'bg-gradient-to-br from-rose-400 to-amber-500' :
          mood === 'thinking' ? 'bg-gradient-to-br from-sky-400 to-indigo-500' :
          mood === 'dizzy' ? 'bg-gradient-to-br from-fuchsia-500 to-rose-500' :
          'bg-gradient-to-br from-indigo-500 to-purple-500'
        }`}>
          
          <div className="flex gap-2 items-end justify-center w-full mt-2">
            {renderEyes()}
          </div>

          <div className="flex gap-4 opacity-60">
            <div className="w-2 h-1 bg-pink-300 rounded-full blur-[1px]"></div>
            <div className="w-2 h-1 bg-pink-300 rounded-full blur-[1px]"></div>
          </div>
        </div>

        <motion.div animate={{ opacity: [0, 1, 0], y: [0, -20] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} className="absolute -top-2 -left-2 pointer-events-none">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
        </motion.div>
        <motion.div animate={{ opacity: [0, 1, 0], y: [0, -15] }} transition={{ repeat: Infinity, duration: 1.5, delay: 1 }} className="absolute top-2 -right-4 pointer-events-none">
          <Sparkles className="w-3 h-3 text-sky-400" />
        </motion.div>
      </motion.div>

    </div>
  )
}