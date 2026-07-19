'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../utils/supabase'

export default function TaskBoard() {
  const [tasks, setTasks] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserDataAndTasks()
  }, [])

  async function fetchUserDataAndTasks() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
      
      // Fetch tasks assigned to this specific operative
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setTasks(data)
      }
    }
    setIsLoading(false)
  }

  // Function to move tasks forward in the pipeline
  async function updateTaskStatus(taskId: string, newStatus: string) {
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)

    if (!error) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    }
  }

  if (isLoading) return <div className="min-h-screen bg-[#0a0a0a] text-green-400 flex justify-center items-center font-mono">Loading Board...</div>

  // Filter tasks by status for the Kanban columns
  const todoTasks = tasks.filter(t => t.status === 'TODO')
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS')
  const reviewTasks = tasks.filter(t => t.status === 'REVIEW')

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <header className="mb-10 flex items-center justify-between border-b border-gray-800 pb-6">
        <div>
          <a href="/portal" className="text-gray-500 hover:text-white text-sm font-bold uppercase tracking-widest mb-4 inline-block transition">← Back to Portal</a>
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-700 uppercase">Active Sprints</h1>
        </div>
        <p className="text-sm font-mono text-gray-400">OPERATIVE: {user?.email}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COLUMN 1: TO DO */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 h-fit min-h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm">To Do</h3>
            <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs font-bold">{todoTasks.length}</span>
          </div>
          <div className="flex flex-col gap-4">
            {todoTasks.map(task => (
              <div key={task.id} className="bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-lg hover:border-blue-500 transition-colors group">
                <h4 className="font-bold text-white mb-2">{task.title}</h4>
                <p className="text-sm text-gray-400 mb-4">{task.description}</p>
                <button 
                  onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                  className="w-full py-2 bg-blue-900/30 text-blue-400 text-xs font-bold uppercase tracking-wider rounded border border-blue-800 hover:bg-blue-600 hover:text-white transition"
                >
                  Start Execution →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: IN PROGRESS */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 h-fit min-h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-blue-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> In Progress
            </h3>
            <span className="bg-blue-900/40 text-blue-300 px-3 py-1 rounded-full text-xs font-bold">{inProgressTasks.length}</span>
          </div>
          <div className="flex flex-col gap-4">
            {inProgressTasks.map(task => (
              <div key={task.id} className="bg-gray-800 p-5 rounded-lg border border-blue-900 shadow-lg group">
                <h4 className="font-bold text-white mb-2">{task.title}</h4>
                <p className="text-sm text-gray-400 mb-4">{task.description}</p>
                <button 
                  onClick={() => updateTaskStatus(task.id, 'REVIEW')}
                  className="w-full py-2 bg-yellow-900/30 text-yellow-500 text-xs font-bold uppercase tracking-wider rounded border border-yellow-800 hover:bg-yellow-600 hover:text-white transition"
                >
                  Submit for Review →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 3: REVIEW */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 h-fit min-h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-yellow-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Awaiting Review
            </h3>
            <span className="bg-yellow-900/40 text-yellow-300 px-3 py-1 rounded-full text-xs font-bold">{reviewTasks.length}</span>
          </div>
          <div className="flex flex-col gap-4">
            {reviewTasks.map(task => (
              <div key={task.id} className="bg-gray-800 p-5 rounded-lg border border-yellow-900 shadow-lg group">
                <h4 className="font-bold text-white mb-2">{task.title}</h4>
                <p className="text-sm text-gray-400 mb-4">{task.description}</p>
                <p className="text-xs text-yellow-600 font-bold uppercase tracking-widest text-center">Pending Admin Approval</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}