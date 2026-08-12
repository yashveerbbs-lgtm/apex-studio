'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useAnimationFrame } from 'framer-motion'
import { X, Send, Sparkles, Zap } from 'lucide-react'
import { supabase } from '../utils/supabase'

type Mood = 'idle' | 'happy' | 'thinking' | 'excited' | 'sleepy' | 'dizzy'

export default function SparkAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [mood, setMood] = useState<Mood>('idle')
  const [inputText, setInputText] = useState('')
  const [userName, setUserName] = useState<string>('Developer')
  const [messages, setMessages] = useState([
    { sender: 'spark', text: 'Hey! Grab me, throw me, and watch me bounce! Or just ask me a question. ✨' }
  ])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mascotRef = useRef<HTMLDivElement>(null)

  // --- PHYSICS ENGINE STATE ---
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const velocity = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const lastCollisionTime = useRef(0)

  // 1. Fetch User Data
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        const name = user.email.split('@')[0]
        setUserName(name.charAt(0).toUpperCase() + name.slice(1))
        setMessages([{ sender: 'spark', text: `Welcome back to the studio, ${name}! Ready to fling me around? 🚀` }])
      }
    })
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Idle Animation (Random happiness)
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

  // ----------------------------------------------------
  // THE CUSTOM 2D PHYSICS & COLLISION ENGINE 💥
  // ----------------------------------------------------
  useAnimationFrame((t, delta) => {
    if (isDragging.current || isOpen) return // Stop physics when held or chatting

    const dt = delta / 16.66 // Normalize for 60fps
    
    // 1. Apply Gravity and Friction
    velocity.current.y += 0.8 * dt // Gravity pulling down
    velocity.current.x *= 0.98     // Air friction (slows down horizontal movement)
    velocity.current.y *= 0.98     // Air friction 

    let nextX = x.get() + velocity.current.x * dt
    let nextY = y.get() + velocity.current.y * dt

    // 2. Screen Boundaries (Bounce off the walls!)
    if (typeof window !== 'undefined') {
      const rightBound = 10
      const leftBound = -(window.innerWidth - 88)
      const bottomBound = 0 // The floor (bottom-6 padding)
      const topBound = -(window.innerHeight - 88)

      if (nextX > rightBound) { nextX = rightBound; velocity.current.x *= -0.7 }
      if (nextX < leftBound) { nextX = leftBound; velocity.current.x *= -0.7 }
      if (nextY < topBound) { nextY = topBound; velocity.current.y *= -0.7 }
      if (nextY > bottomBound) { 
        nextY = bottomBound
        velocity.current.y *= -0.6 // Bounce off the floor
        velocity.current.x *= 0.9  // Extra friction on the floor
      }

      // 3. REAL DOM COLLISION DETECTION! 🤯
      // Only check collisions if he is falling fast enough to care
      if (velocity.current.y > 2 && Date.now() - lastCollisionTime.current > 100) {
        
        // Calculate his absolute position on the screen
        const absX = window.innerWidth - 24 - 32 + nextX // Center X
        const absY = window.innerHeight - 24 + nextY + 5 // Just below his feet
        
        // Temporarily hide Spark so the raycast doesn't hit himself
        if (mascotRef.current) mascotRef.current.style.visibility = 'hidden'
        const hitElement = document.elementFromPoint(absX, absY)
        if (mascotRef.current) mascotRef.current.style.visibility = 'visible'

        if (hitElement) {
          const tag = hitElement.tagName.toLowerCase()
          const className = hitElement.className || ''
          
          // Does he hit a button, a card, or a heading?
          if (tag === 'button' || tag === 'h1' || tag === 'h2' || className.includes('bg-white')) {
            // BOUNCE!
            velocity.current.y *= -0.7 // Bounce up!
            velocity.current.x *= 0.8  // Surface friction
            nextY -= 10 // Push up to avoid getting stuck inside the div
            lastCollisionTime.current = Date.now()
          }
        }
      }
    }

    // Apply the new coordinates
    x.set(nextX)
    y.set(nextY)

    // Stop dizzy mood when he finally settles down
    if (mood === 'dizzy' && Math.abs(velocity.current.x) < 0.5 && Math.abs(velocity.current.y) < 0.5) {
      setMood('idle')
    }
  })

  // ----------------------------------------------------
  // THE SMART NLP TEXT PARSER 🧠
  // ----------------------------------------------------
  const handleSendMessage = () => {
    if (!inputText.trim()) return

    const q = inputText.toLowerCase()
    setMessages(prev => [...prev, { sender: 'user', text: inputText }])
    setInputText('')
    setMood('thinking')

    setTimeout(() => {
      setMood('excited')
      let reply = ""

      // Read DOM context for smart answers
      const pageTitle = document.querySelector('h1')?.innerText || 'this area'
      const buttons = document.querySelectorAll('button').length

      // Regex matching for fuzzy logic (handles typos better!)
      if (q.match(/(who am i|my name|who are you talking to)/)) {
        reply = `You are ${userName}! The legendary developer building this project. 😎`
      } 
      else if (q.match(/what.*(look|see|page|here|this)/)) {
        reply = `We're looking at the "${pageTitle}" interface! I'm scanning roughly ${buttons} interactable elements you can click around here.`
      } 
      else if (q.match(/(help|should i do|stuck|lost)/)) {
        reply = `Since we're currently on "${pageTitle}", try clicking one of the main buttons or cards to deploy an assignment!`
      } 
      else if (q.match(/(physics|bounce|fling|throw|jump|fall)/)) {
        reply = `Grab me with your mouse and THROW ME! I have a custom 60fps 2D physics engine built in. I'll bounce right off your UI! 🎢`
      } 
      else if (q.match(/(sih|hackathon|smart india)/)) {
        reply = `SIH is the Smart India Hackathon! With physics and context-awareness like this, the judges will love it. 🏆`
      } 
      else {
        const generic = [
          "My neural nets agree with you entirely.",
          "I'm scanning the DOM... your UI layout looks flawless.",
          `You got it, ${userName}! Want me to look up the docs for that?`,
          "I'm still learning! But if you grab and throw me, I'll bounce off buttons and cards! 🚀"
        ]
        reply = generic[Math.floor(Math.random() * generic.length)]
      }
      
      setMessages(prev => [...prev, { sender: 'spark', text: reply }])
      setTimeout(() => setMood('happy'), 2000)
    }, 1000)
  }

  // --- EMOTION RENDERER ---
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
        style={{ x, y }} // Bind motion values to the div!
        drag 
        dragMomentum={false} // We handle momentum manually now!
        onDragStart={() => {
          isDragging.current = true
          setMood('dizzy')
        }}
        onDragEnd={(e, info) => {
          isDragging.current = false
          // Capture the throw velocity!
          velocity.current.x = info.velocity.x / 40
          velocity.current.y = info.velocity.y / 40
        }}
        whileDrag={{ scale: 1.15, cursor: 'grabbing' }}
        onClick={() => { if (!isOpen && !isDragging.current) { setIsOpen(true); setMood('happy'); velocity.current = {x:0, y:0}; x.set(0); y.set(0); } }}
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