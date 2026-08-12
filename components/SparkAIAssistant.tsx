'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { X, Send, Sparkles, Zap } from 'lucide-react'
import { supabase } from '../utils/supabase'

type Mood = 'idle' | 'happy' | 'thinking' | 'excited' | 'sleepy' | 'dizzy'

export default function SparkAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [mood, setMood] = useState<Mood>('idle')
  const [inputText, setInputText] = useState('')
  const [userName, setUserName] = useState<string>('Developer')
  const [messages, setMessages] = useState([
    { sender: 'spark', text: 'Hey there! I am Spark ✨. Drop me on anything, or ask me a question!' }
  ])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const mascotRef = useRef<HTMLDivElement>(null)

  // 1. Fetch User Data to make it Personalized
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        const name = user.email.split('@')[0]
        setUserName(name.charAt(0).toUpperCase() + name.slice(1))
        setMessages([{ sender: 'spark', text: `Welcome back to the studio, ${name}! Ready to build? 🚀` }])
      }
    })
  }, [])

  // Auto-scroll chat
  useEffect(() => {
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

  // 2. The Smart, Context-Aware Chat Engine
  const handleSendMessage = () => {
    if (!inputText.trim()) return

    const userQuery = inputText.toLowerCase()
    setMessages(prev => [...prev, { sender: 'user', text: inputText }])
    setInputText('')
    setMood('thinking')

    setTimeout(() => {
      setMood('excited')
      let reply = ""

      // Context-Aware Logic
      const pageTitle = document.querySelector('h1')?.innerText || 'this page'
      const buttons = document.querySelectorAll('button').length

      if (userQuery.includes('who am i') || userQuery.includes('my name')) {
        reply = `You are ${userName}! The legendary developer building this project. 😎`
      } else if (userQuery.includes('where am i') || userQuery.includes('what page')) {
        reply = `Looks like we're currently on the "${pageTitle}" section! I see about ${buttons} buttons you can click here.`
      } else if (userQuery.includes('help') || userQuery.includes('what should i do')) {
        reply = `Since we're looking at "${pageTitle}", you should probably click one of the primary buttons around here to deploy a task or accept a challenge!`
      } else if (userQuery.includes('sih') || userQuery.includes('hackathon')) {
        reply = `SIH is the Smart India Hackathon! We are going to win this thing. 🏆`
      } else {
        const generic = [
          "That's a brilliant idea! Let's build it. 🚀",
          "My neural nets agree with you.",
          "I'm scanning the DOM... your layout looks flawless.",
          `You got it, ${userName}! Want me to look up the docs for that?`,
          "I can help you debug that if you want!"
        ]
        reply = generic[Math.floor(Math.random() * generic.length)]
      }
      
      setMessages(prev => [...prev, { sender: 'spark', text: reply }])
      setTimeout(() => setMood('happy'), 2000)
    }, 1200)
  }

  // 3. The Custom Physics Engine (Gravity & Collision)
  const handleDragEnd = (event: any, info: any) => {
    if (!mascotRef.current) return

    setMood('dizzy') // Spark gets dizzy when thrown!

    // Get Spark's coordinates right when we let go
    const dropX = info.point.x
    const dropY = info.point.y
    let landedOnElement = false
    let targetYOffset = 0

    // Scan the screen for elements below Spark
    const interactables = Array.from(document.querySelectorAll('button, h1, h2, .bg-white'))
    
    for (const el of interactables) {
      const rect = el.getBoundingClientRect()
      
      // Is the element directly below Spark's X coordinate?
      if (dropX > rect.left && dropX < rect.right) {
        // Is the element below Spark's current Y coordinate?
        if (rect.top > dropY) {
          // Calculate how far Spark needs to fall to hit the top of this element
          // (We use relative coordinates since Framer Motion x,y are relative to start)
          const distanceToFall = rect.top - dropY
          targetYOffset = info.offset.y + distanceToFall - 40 // -40 so he sits ON it, not inside it
          
          landedOnElement = true
          
          // Sneaky Hackathon Feature: Spark reads what he landed on!
          const elementText = (el as HTMLElement).innerText?.substring(0, 15)
          if (elementText && !isOpen) {
             setTimeout(() => {
               setMessages(prev => [...prev, { sender: 'spark', text: `Oof! Landed on "${elementText}..."` }])
               setIsOpen(true)
             }, 800)
          }
          break // Stop at the first element we hit going down
        }
      }
    }

    if (landedOnElement) {
      // 💥 Physics: Animate the fall and bounce
      controls.start({
        x: info.offset.x,
        y: targetYOffset,
        transition: { type: "spring", bounce: 0.6, duration: 0.8 }
      })
    } else {
      // 🎈 No element found below? Float back to origin like a balloon
      controls.start({
        x: 0,
        y: 0,
        transition: { type: "spring", bounce: 0.4, duration: 1.5 }
      })
    }

    setTimeout(() => setMood('idle'), 1500)
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
      case 'sleepy':
        return (
          <>
            <div className="w-3 h-1 bg-white rounded-full" />
            <div className="w-3 h-1 bg-white rounded-full" />
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
      
      {/* THE CHAT BUBBLE */}
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

      {/* THE MASCOT CHARACTER (Physics Enabled!) */}
      <motion.div 
        ref={mascotRef}
        drag 
        dragElastic={0.5}
        dragMomentum={false}
        animate={controls}
        onDragEnd={handleDragEnd}
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