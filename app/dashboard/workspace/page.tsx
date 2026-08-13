'use client'
import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import {
  Send,
  Users,
  Terminal as TerminalIcon,
  Code2,
  File as FileIcon,
  Plus,
  ChevronRight,
  CheckCircle2,
  Play,
  Trash2,
  Edit2,
  FilePlus,
  FolderPlus,
  UserPlus,
  GraduationCap,
  BookOpen,
  ScanSearch,
  EyeOff,
  X,
  Zap,
  Gem,
  Sparkles
} from 'lucide-react'
import { supabase } from '../../../utils/supabase'

import CertificateCard from './CertificateCard'

export default function EnterpriseWorkspace() {
  const [isMounted, setIsMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // --- NEW: MONACO THEME STATE ---
  const [editorTheme, setEditorTheme] = useState('light')

  // Team & File State
  const [activeTeam, setActiveTeam] = useState<any>(null)
  const [userTeams, setUserTeams] = useState<any[]>([])
  const [newTeamName, setNewTeamName] = useState('')
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  const [nodes, setNodes] = useState<any[]>([])
  const [activeFile, setActiveFile] = useState<any>(null)
  const [savingCode, setSavingCode] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: any | null } | null>(null)

  // Realtime Channel State
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null)

  // Terminal & Chat State
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['✨ Apex Cloud Engine ready...'])
  const [isExecuting, setIsExecuting] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [isSendingMsg, setIsSendingMsg] = useState(false)

  // Academy Exam Engine & Certificate State
  const [lessonLevel, setLessonLevel] = useState(1)
  const [isExamMode, setIsExamMode] = useState(false)
  const [lessonPassed, setLessonPassed] = useState(false)
  const [showCertificate, setShowCertificate] = useState(false)

  const saveBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setIsMounted(true)
    initializeSystem()
    const handleClick = () => setContextMenu(null)
    window.addEventListener('click', handleClick)

    // --- NEW: THEME LISTENER ---
    if (typeof window !== 'undefined') {
      const currentTheme = localStorage.getItem('apex_theme') === 'dark' ? 'vs-dark' : 'light'
      setEditorTheme(currentTheme)
      
      const handleThemeChange = () => {
        const newTheme = localStorage.getItem('apex_theme') === 'dark' ? 'vs-dark' : 'light'
        setEditorTheme(newTheme)
      }
      
      window.addEventListener('themeChanged', handleThemeChange)
      
      return () => {
        window.removeEventListener('click', handleClick)
        window.removeEventListener('themeChanged', handleThemeChange)
      }
    }

    return () => window.removeEventListener('click', handleClick)
  }, [])

  // MULTIPLAYER REALTIME SYNC ENGINE & CHAT
  useEffect(() => {
    if (!activeTeam) return

    // 1. Listen for Live Code Typing (Broadcasts)
    const room = supabase.channel(`squad-${activeTeam.id}`, {
      config: { broadcast: { ack: false } },
    })

    room
      .on('broadcast', { event: 'code-change' }, (payload) => {
        if (payload.payload.user_id !== currentUser?.id) {
          setActiveFile((prev: any) => {
            if (prev && prev.id === payload.payload.file_id) {
              return { ...prev, content: payload.payload.content }
            }
            return prev
          })
          setNodes((prevNodes) =>
            prevNodes.map((n) =>
              n.id === payload.payload.file_id ? { ...n, content: payload.payload.content } : n
            )
          )
        }
      })
      .subscribe()

    setRealtimeChannel(room)

    // 2. Listen for Database Chat Inserts (Realtime Messages)
    const chatSubscription = supabase
      .channel(`chat-${activeTeam.id}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'workspace_messages', filter: `team_id=eq.${activeTeam.id}` }, 
        (payload) => {
          if (payload.new.user_id !== currentUser?.id) {
            setMessages((prevMessages) => [...prevMessages, payload.new])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(room)
      supabase.removeChannel(chatSubscription)
    }
  }, [activeTeam, currentUser])

  async function initializeSystem() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      setCurrentUser(user)
      fetchUserTeams(user.id)
    }
  }

  async function fetchUserTeams(userId: string) {
    const { data } = await supabase
      .from('team_members')
      .select('role, teams(id, name)')
      .eq('user_id', userId)
    if (data) {
      // @ts-ignore
      const formattedTeams = data.map((tm: any) => ({ ...tm.teams, role: tm.role })).filter((t) => t.id)
      setUserTeams(formattedTeams)
    }
  }

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault()
    if (!newTeamName.trim() || !currentUser || isCreatingTeam) return
    setIsCreatingTeam(true)

    const { data: team, error } = await supabase.from('teams').insert([{ name: newTeamName }]).select().single()

    if (team && !error) {
      await supabase.from('team_members').insert([{ team_id: team.id, user_id: currentUser.id, role: 'admin' }])
      await supabase.from('workspace_nodes').insert([
        {
          team_id: team.id,
          name: 'main.py',
          is_folder: false,
          content: 'print("Welcome to Apex Studio!")\n',
          language: 'python',
        },
      ])

      await fetchUserTeams(currentUser.id)
      setNewTeamName('')
      loadTeamWorkspace({ ...team, role: 'admin' })
    }
    setIsCreatingTeam(false)
  }

  async function handleDeleteTeam(e: React.MouseEvent, teamId: string) {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this squad? This will permanently wipe all files and chat logs.')) {
      await supabase.from('teams').delete().eq('id', teamId)
      setUserTeams(userTeams.filter((t) => t.id !== teamId))
    }
  }

  async function handleEditTeam(e: React.MouseEvent, team: any) {
    e.stopPropagation()
    const newName = prompt('Enter new squad name:', team.name)
    if (newName && newName !== team.name) {
      await supabase.from('teams').update({ name: newName }).eq('id', team.id)
      setUserTeams(userTeams.map((t) => (t.id === team.id ? { ...t, name: newName } : t)))
      if (activeTeam?.id === team.id) setActiveTeam({ ...activeTeam, name: newName })
    }
  }

  function handleInviteMember() {
    if (!activeTeam) return
    const inviteLink = `${window.location.origin}/dashboard/workspace/invite/${activeTeam.id}`

    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        alert(`✅ Secure Invite Link Copied to Clipboard!\n\n${inviteLink}\n\nSend this link to anyone you want to join your squad.`)
      })
      .catch(() => {
        prompt('Copy this secure invite link to send to your teammate:', inviteLink)
      })
  }

  async function loadTeamWorkspace(team: any) {
    setActiveTeam(team)
    const { data: files } = await supabase
      .from('workspace_nodes')
      .select('*')
      .eq('team_id', team.id)
      .order('is_folder', { ascending: false })
    if (files) {
      setNodes(files)
      const firstFile = files.find((f) => !f.is_folder && f.name !== 'LESSON.md')
      if (firstFile) setActiveFile(firstFile)
    }
    const { data: chat } = await supabase
      .from('workspace_messages')
      .select('*')
      .eq('team_id', team.id)
      .order('created_at')
    if (chat) setMessages(chat)
  }

  const COURSE_DATA: any = {
    'Sports Data & Predictive AI': {
      1: {
        training: `# Level 1: The Art of the Variable 🏏\nWelcome to Python! Think of a variable like a kit bag. You can stuff whatever you want inside it.\n\n### The Warm-up (Copy This)\n\`\`\`python\ncaptain = "MS Dhoni"\nprint(captain)\n\`\`\`\n\nWhen you are ready, click **Take Blindfold Test** to prove you know it.`,
        exam: `# Level 1: The Blindfold Test 👀\nTutorials hidden. Editor wiped. No cheating.\n\n### Your Mission:\n1. Create a variable named captain.\n2. Set it to "MS Dhoni".\n3. Print it.`,
        validators: [
          {
            check: (c: string) => c.includes('captain=msdhoni'),
            error: "You didn't create the 'captain' variable correctly.",
            hint: 'captain = "MS Dhoni"',
          },
          { check: (c: string) => c.includes('print(captain)'), error: 'You forgot to print it!', hint: 'Use print(captain)' },
        ],
        success: 'Variables should be lowercase with underscores. Great job! 💎 +50 Gems Added!',
      },
      2: {
        training: `# Level 2: The Scoreboard (Math) 🏏\nNow let's calculate numbers.\n\n### The Warm-up\n\`\`\`python\nsixes = 6\nruns = 6\nprint(sixes * runs)\n\`\`\`\n\nClick **Take Blindfold Test** when ready.`,
        exam: `# Level 2: The Blindfold Test 👀\nTry it from memory!\n\n### Your Mission:\n1. Variable \`sixes\` = 6.\n2. Variable \`runs\` = 6.\n3. Print the multiplied result.`,
        validators: [
          {
            check: (c: string) => c.includes('sixes=6') && c.includes('runs=6'),
            error: 'Missing variables or wrong values.',
            hint: 'sixes = 6 and runs = 6',
          },
          {
            check: (c: string) => c.includes('*'),
            error: 'You forgot to multiply!',
            hint: 'Use the * symbol inside your print statement.',
          },
        ],
        success: "You're a human calculator! 💎 +75 Gems Added!",
      },
    },
  }

  function getActiveCourseData() {
    if (!activeTeam || !activeTeam.name.startsWith('Academy:')) return null
    const courseName = activeTeam.name.replace('Academy:', '').trim()
    return COURSE_DATA[courseName] || COURSE_DATA['Sports Data & Predictive AI']
  }

  async function handleStartExam() {
    if (!activeTeam || !activeFile) return
    setIsExamMode(true)
    setTerminalOutput([
      '> 🚨 EXAM MODE ACTIVATED.',
      '> Tutorials hidden. Editor wiped.',
      '> Write the code from memory. Good luck!',
    ])

    const course = getActiveCourseData()
    const lesson = course ? course[lessonLevel] : null
    if (!lesson) return

    const lessonNode = nodes.find((n) => n.name === 'LESSON.md')
    if (lessonNode) {
      await supabase.from('workspace_nodes').update({ content: lesson.exam }).eq('id', lessonNode.id)
      setNodes((prev) => prev.map((n) => (n.id === lessonNode.id ? { ...n, content: lesson.exam } : n)))
    }

    if (activeFile.name !== 'LESSON.md') {
      const isCpp = activeFile.name.endsWith('.cpp')
      const isGo = activeFile.name.endsWith('.go')

      let wipeCode = '// Exam started. Write your code from memory!\n'
      if (isCpp)
        wipeCode =
          '#include <iostream>\n\nint main() {\n    // Exam started. Write from memory!\n    \n    return 0;\n}'
      if (isGo) wipeCode = 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Exam started. Write from memory!\n    \n}'

      await supabase.from('workspace_nodes').update({ content: wipeCode }).eq('id', activeFile.id)
      setActiveFile({ ...activeFile, content: wipeCode })
      setNodes((prev) => prev.map((n) => (n.id === activeFile.id ? { ...n, content: wipeCode } : n)))
    }
  }

  function handleCheckCode() {
    if (!activeFile || activeFile.name === 'LESSON.md') return
    const code = activeFile.content.toLowerCase().replace(/[\s`'"“”]/g, '')
    const course = getActiveCourseData()
    const lesson = course ? course[lessonLevel] : null

    if (!lesson) {
      setTerminalOutput((prev) => [...prev, `> ❌ Error: No validation rules found.`])
      return
    }

    setTerminalOutput((prev) => [...prev, ` `, `> 🔍 Initiating Code Scan for Level ${lessonLevel}...`])

    for (const rule of lesson.validators) {
      if (!rule.check(code)) {
        setTerminalOutput((prev) => [...prev, `> ❌ FAILED: ${rule.error}`, `> 💡 Hint: ${rule.hint}`])
        return
      }
    }

    if (!isExamMode) {
      setTerminalOutput((prev) => [
        ...prev,
        `> 🎯 WARM-UP SUCCESS! Your code is correct.`,
        `> 🚨 Ready for the real thing? Click 'Take Blindfold Test' (Top Right)!`,
      ])
    } else {
      setTerminalOutput((prev) => [
        ...prev,
        `> 🏆 EXAM PASSED! Code perfectly executed.`,
        `> 🔥 ${lesson.success}`,
        `> Click 'Next Lesson' to proceed!`,
      ])
      setLessonPassed(true)
    }
  }

  async function handleNextLesson() {
    if (!activeTeam || !lessonPassed) return
    const nextLevel = lessonLevel + 1
    const course = getActiveCourseData()
    const nextLessonData = course ? course[nextLevel] : null

    if (!nextLessonData) {
      setShowCertificate(true)
      return
    }

    setLessonLevel(nextLevel)
    setIsExamMode(false)
    setLessonPassed(false)

    const lessonNode = nodes.find((n) => n.name === 'LESSON.md')
    if (lessonNode) {
      await supabase.from('workspace_nodes').update({ content: nextLessonData.training }).eq('id', lessonNode.id)
      setNodes(nodes.map((n) => (n.id === lessonNode.id ? { ...n, content: nextLessonData.training } : n)))

      if (activeFile && activeFile.name !== 'LESSON.md') {
        const isCpp = activeFile.name.endsWith('.cpp')
        const isGo = activeFile.name.endsWith('.go')

        let newCode = '// New Level. Training Mode active.\n'
        if (isCpp)
          newCode = '#include <iostream>\n\nint main() {\n    // Training Mode\n    \n    return 0;\n}'
        if (isGo) newCode = 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Training Mode\n    \n}'

        await supabase.from('workspace_nodes').update({ content: newCode }).eq('id', activeFile.id)
        setActiveFile({ ...activeFile, content: newCode })
        setNodes((prev) => prev.map((n) => (n.id === activeFile.id ? { ...n, content: newCode } : n)))
      }
      setTerminalOutput(['> ✨ Level unlocked. Read the tutorial to begin.'])
    }
  }

  async function handleCreateFile() {
    if (!activeTeam) return
    const fileName = prompt('Enter file name:')
    if (!fileName) return
    const ext = fileName.split('.').pop()?.toLowerCase()
    const langMap: any = {
      js: 'javascript',
      ts: 'typescript',
      py: 'python',
      cpp: 'cpp',
      java: 'java',
      md: 'markdown',
      go: 'go',
    }
    const language = langMap[ext as string] || 'plaintext'
    const { data } = await supabase
      .from('workspace_nodes')
      .insert([{ team_id: activeTeam.id, name: fileName, is_folder: false, content: '', language: language }])
      .select()
      .single()
    if (data) setNodes([...nodes, data].sort((a, b) => Number(b.is_folder) - Number(a.is_folder)))
  }

  async function handleCreateFolder() {
    if (!activeTeam) return
    const folderName = prompt('Enter folder name:')
    if (!folderName) return
    const { data } = await supabase
      .from('workspace_nodes')
      .insert([{ team_id: activeTeam.id, name: folderName, is_folder: true, content: '', language: '' }])
      .select()
      .single()
    if (data) setNodes([...nodes, data].sort((a, b) => Number(b.is_folder) - Number(a.is_folder)))
  }

  async function handleSaveActiveFile() {
    if (!activeFile) return
    setSavingCode(true)
    await supabase.from('workspace_nodes').update({ content: activeFile.content }).eq('id', activeFile.id)
    setTimeout(() => setSavingCode(false), 800)
  }

  function handleContextMenu(e: React.MouseEvent, node: any | null) {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.pageX, y: e.pageY, node })
  }

  async function handleRenameNode(node: any) {
    const newName = prompt('Rename to:', node.name)
    if (newName && newName !== node.name) {
      await supabase.from('workspace_nodes').update({ name: newName }).eq('id', node.id)
      setNodes(nodes.map((n) => (n.id === node.id ? { ...n, name: newName } : n)))
      if (activeFile?.id === node.id) setActiveFile({ ...activeFile, name: newName })
    }
  }

  async function handleDeleteNode(node: any) {
    if (confirm(`Are you sure you want to delete '${node.name}'?`)) {
      await supabase.from('workspace_nodes').delete().eq('id', node.id)
      setNodes(nodes.filter((n) => n.id !== node.id))
      if (activeFile?.id === node.id) setActiveFile(null)
    }
  }

  function handleEditorDidMount(editor: any, monaco: any) {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => saveBtnRef.current?.click())
  }

  function handleEditorChange(value: string | undefined) {
    const newContent = value || ''
    setActiveFile((prev: any) => ({ ...prev, content: newContent }))
    setNodes((prevNodes) => prevNodes.map((n) => (n.id === activeFile.id ? { ...n, content: newContent } : n)))

    if (realtimeChannel && activeFile) {
      realtimeChannel.send({
        type: 'broadcast',
        event: 'code-change',
        payload: { user_id: currentUser?.id, file_id: activeFile.id, content: newContent },
      })
    }
  }

  async function executeCode() {
    if (!activeFile || activeFile.language === 'markdown') return
    setIsExecuting(true)
    setTerminalOutput((prev) => [...prev, `> Compiling ${activeFile.name}...`])
    try {
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: activeFile.content, language: activeFile.language }),
      })
      const result = await response.json()
      if (response.ok && result.output)
        setTerminalOutput((prev) => [...prev, ...result.output.split('\n').filter(Boolean)])
      else setTerminalOutput((prev) => [...prev, `> Engine Error: ${result.error || 'Failed.'}`])
    } catch (err: any) {
      setTerminalOutput((prev) => [...prev, `> Network Error.`])
    }
    setIsExecuting(false)
  }

  async function handleSendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!chatMessage.trim() || !activeTeam || !currentUser || isSendingMsg) return
    setIsSendingMsg(true)
    const newMsg = {
      team_id: activeTeam.id,
      user_id: currentUser.id,
      sender_name: currentUser.email?.split('@')[0] || 'Student',
      text: chatMessage,
    }
    const { data } = await supabase.from('workspace_messages').insert([newMsg]).select().single()
    if (data) {
      setMessages([...messages, data])
      setChatMessage('')
    }
    setIsSendingMsg(false)
  }

  if (!isMounted) return null

  // ✨ WELCOME / INITIALIZATION SCREEN ✨
  if (!activeTeam) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-6 font-sans transition-colors duration-500">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-8 rounded-[2rem] shadow-sm relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-400 to-purple-400"></div>

          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-indigo-100 dark:border-indigo-800 shadow-sm">
            <TerminalIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-center mb-6 tracking-tight text-slate-800 dark:text-white">Workspace Hub</h2>

          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">
              Your Active Squads
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 mb-6">
              {userTeams.map((team) => (
                <div
                  key={team.id}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 rounded-xl transition-all group cursor-pointer shadow-sm hover:shadow"
                  onClick={() => loadTeamWorkspace(team)}
                >
                  <span className="font-bold flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <Users className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" /> {team.name}
                  </span>

                  <div className="flex items-center gap-2">
                    {team.role === 'admin' && !team.name.startsWith('Academy:') && (
                      <>
                        <button
                          onClick={(e) => handleEditTeam(e, team)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteTeam(e, team.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <div className="bg-white dark:bg-slate-700 p-1.5 rounded-md border-2 border-slate-100 dark:border-slate-600 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/50 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/50 transition-colors">
                      <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                    </div>
                  </div>
                </div>
              ))}

              {userTeams.length === 0 && (
                <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
                    No active squads
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleCreateTeam} className="flex gap-2">
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="New Squad Name..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={isCreatingTeam || !newTeamName.trim()}
                className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-5 py-3 text-xs flex items-center gap-2 disabled:opacity-50 font-bold transition-all shadow-[0_4px_0_rgb(67,56,202)] hover:shadow-[0_2px_0_rgb(67,56,202)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none"
              >
                <Plus className="w-4 h-4" /> Create
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const isAcademy = activeTeam?.name?.startsWith('Academy:')
  const lessonNode = nodes.find((n) => n.name === 'LESSON.md')

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans overflow-hidden relative transition-colors duration-500">
      
      {/* 🚨 THE CERTIFICATE MODAL OVERLAY 🚨 */}
      {showCertificate && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="relative w-full max-w-5xl flex flex-col items-center animate-in zoom-in-95 duration-500 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="w-full flex justify-between items-end mb-6 border-b-2 border-slate-100 dark:border-slate-800 pb-4">
              <div className="text-left">
                <h2 className="text-3xl font-black text-emerald-500 dark:text-emerald-400 flex items-center gap-2">
                  Course Completed! <Sparkles className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mt-1">
                  Credential generated and secured.
                </p>
              </div>

              <button
                onClick={() => setShowCertificate(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 p-2.5 rounded-xl transition-all border-2 border-slate-200 dark:border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <CertificateCard
              studentName={currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Apex Developer'}
              courseName={activeTeam.name.replace('Academy:', '').trim()}
              date={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              awardType="Academy Graduate"
            />
          </div>
        </div>
      )}

      {contextMenu && (
        <div
          className="absolute z-50 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-xl py-2 w-60 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl overflow-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => {
              handleCreateFile()
              setContextMenu(null)
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 transition-colors"
          >
            <FilePlus className="w-4 h-4" /> New File...
          </button>
          <button
            onClick={() => {
              handleCreateFolder()
              setContextMenu(null)
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 transition-colors"
          >
            <FolderPlus className="w-4 h-4" /> New Folder...
          </button>

          {contextMenu.node && (
            <>
              <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2"></div>
              <button
                onClick={() => {
                  handleRenameNode(contextMenu.node)
                  setContextMenu(null)
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 flex justify-between items-center group transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4" /> Rename
                </span>
              </button>
              <button
                onClick={() => {
                  handleDeleteNode(contextMenu.node)
                  setContextMenu(null)
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 flex justify-between items-center group text-red-500 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete
                </span>
              </button>
            </>
          )}
        </div>
      )}

      {/* WORKSPACE HEADER */}
      <header className="h-14 border-b-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 shrink-0 shadow-sm z-10 transition-colors">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg border-2 border-indigo-100 dark:border-indigo-500/30 font-black text-sm shadow-sm transition-colors">
            <Users className="w-4 h-4" /> {activeTeam.name}
          </div>

          {!isAcademy && (
            <button
              onClick={handleInviteMember}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500/50 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" /> Invite Teammates
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAcademy && (
            <button
              onClick={() => setShowCertificate(true)}
              className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 text-xs font-bold px-3 py-2 rounded-lg transition-colors bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-sm hover:border-amber-200 dark:hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-900/30"
              title="God Mode: Instantly unlock certificate"
            >
              <Zap className="w-3.5 h-3.5" /> Skip to End
            </button>
          )}

          {isAcademy && !lessonPassed && (
            <button
              onClick={handleCheckCode}
              disabled={!activeFile || activeFile.name === 'LESSON.md'}
              className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_4px_0_rgb(67,56,202)] hover:shadow-[0_2px_0_rgb(67,56,202)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all rounded-xl font-bold text-xs px-4 py-2 disabled:opacity-50 animate-in zoom-in duration-300"
            >
              <ScanSearch className="w-4 h-4" /> Check Code
            </button>
          )}

          {isAcademy && !isExamMode && !lessonPassed && (
            <button
              onClick={handleStartExam}
              disabled={!activeFile || activeFile.name === 'LESSON.md'}
              className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white shadow-[0_4px_0_rgb(225,29,72)] hover:shadow-[0_2px_0_rgb(225,29,72)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all rounded-xl font-bold text-xs px-4 py-2 disabled:opacity-50"
            >
              <EyeOff className="w-4 h-4" /> Blindfold Test
            </button>
          )}

          {isAcademy && (
            <button
              onClick={handleNextLesson}
              disabled={!lessonPassed}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                lessonPassed
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_0_rgb(16,185,129)] hover:shadow-[0_2px_0_rgb(16,185,129)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Next Lesson
            </button>
          )}

          {isAcademy && <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 transition-colors"></div>}

          <button
            onClick={executeCode}
            disabled={isExecuting || !activeFile || activeFile.name === 'LESSON.md'}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white shadow-[0_4px_0_rgb(30,41,59)] hover:shadow-[0_2px_0_rgb(30,41,59)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all rounded-xl font-bold text-xs px-4 py-2 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" /> {isExecuting ? 'Compiling...' : 'Run Engine'}
          </button>

          <button ref={saveBtnRef} onClick={handleSaveActiveFile} className="hidden" />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* FILE EXPLORER SIDEBAR */}
        <div
          className="w-64 bg-slate-50 dark:bg-slate-900/50 border-r-2 border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-colors"
          onContextMenu={(e) => handleContextMenu(e, null)}
        >
          <div className="h-10 flex items-center justify-between px-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2 mb-2">
            <span>Explorer</span>
            <div className="flex gap-2">
              <button onClick={handleCreateFile} className="hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-800 p-1 rounded-md border-2 border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
                <FilePlus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pb-10 px-2 space-y-1">
            {nodes.map((node) => (
              <button
                key={node.id}
                onClick={() => !node.is_folder && setActiveFile(node)}
                onContextMenu={(e) => handleContextMenu(e, node)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-xl transition-colors ${
                  activeFile?.id === node.id
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-2 border-indigo-200 dark:border-indigo-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 border-2 border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:shadow-sm'
                }`}
              >
                <FileIcon
                  className={`w-4 h-4 shrink-0 ${
                    node.name.endsWith('.md') ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="truncate">{node.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col relative bg-white dark:bg-slate-950 transition-colors">
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {isAcademy && lessonNode && (
              <div
                className={`flex-1 flex flex-col border-r-2 border-slate-200 dark:border-slate-800 transition-colors duration-500 ${
                  isExamMode ? 'bg-rose-50/50 dark:bg-rose-950/20' : 'bg-slate-50 dark:bg-slate-900/50'
                }`}
              >
                <div className="flex bg-slate-100 dark:bg-slate-900 overflow-x-auto border-b-2 border-slate-200 dark:border-slate-800 pt-2 px-2 gap-1 transition-colors">
                  <div
                    className={`px-4 py-2 text-xs font-bold rounded-t-xl flex items-center gap-2 border-2 border-b-0 transition-colors ${
                      isExamMode 
                        ? 'border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50' 
                        : 'border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" /> {lessonNode.name}
                  </div>
                </div>
                <div className="flex-1 relative pt-4">
                  <Editor
                    height="100%"
                    language="markdown"
                    theme={editorTheme}
                    value={lessonNode.content}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: 'on',
                      padding: { top: 16, bottom: 16 },
                      readOnly: true,
                      fontFamily: "'Nunito', sans-serif"
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 transition-colors">
              {activeFile && (!isAcademy || activeFile.name !== 'LESSON.md') ? (
                <>
                  <div className="flex bg-slate-100 dark:bg-slate-900 overflow-x-auto border-b-2 border-slate-200 dark:border-slate-800 pt-2 px-2 gap-1 transition-colors">
                    <div className="px-4 py-2 text-xs font-bold rounded-t-xl border-2 border-b-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 flex items-center gap-2 shadow-sm transition-colors">
                      <Code2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> {activeFile.name}
                    </div>
                  </div>
                  <div className="flex-1 relative pt-4">
                    <Editor
                      height="100%"
                      language={activeFile.language}
                      theme={editorTheme}
                      value={activeFile.content}
                      onChange={handleEditorChange}
                      onMount={handleEditorDidMount}
                      options={{ 
                        minimap: { enabled: false }, 
                        fontSize: 14, 
                        wordWrap: 'on', 
                        padding: { top: 16 },
                        fontFamily: "'Fira Code', monospace" 
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-sm font-bold bg-slate-50 dark:bg-slate-900/50 transition-colors">
                  <Code2 className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
                  Select a file from the explorer to begin.
                </div>
              )}
            </div>
          </div>

          {/* 🚨 THE GAMIFIED TERMINAL 🚨 */}
          <div className="h-56 bg-slate-900 flex flex-col shrink-0 relative overflow-hidden rounded-tl-3xl shadow-[0_-10px_40px_rgb(0,0,0,0.1)]">
            <div className="h-10 bg-slate-800/80 backdrop-blur flex items-center px-4 text-xs font-bold text-slate-400 uppercase tracking-widest gap-2">
              <div className="flex gap-1.5 mr-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <TerminalIcon className="w-3.5 h-3.5 text-indigo-400" /> Engine Output
              <button onClick={() => setTerminalOutput([])} className="ml-auto hover:text-white bg-slate-700/50 px-2 py-1 rounded transition-colors">
                Clear
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[13px] text-slate-300 space-y-1.5">
              {terminalOutput.map((line, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 ${
                    line.includes('FAILED') || line.includes('Error') || line.includes('🚨')
                      ? 'text-rose-400 font-bold bg-rose-950/30 py-1 px-2 rounded-md border border-rose-900/50'
                      : line.includes('SUCCESS') || line.includes('🏆') || line.includes('💎')
                      ? 'text-emerald-400 font-bold bg-emerald-950/30 py-1 px-2 rounded-md border border-emerald-900/50'
                      : line.includes('💡') || line.includes('🔥')
                      ? 'text-amber-400 font-bold'
                      : ''
                  }`}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 🚨 SQUAD CHAT SIDEBAR 🚨 */}
        <div className="w-80 border-l-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col shrink-0 transition-colors">
          <div className="h-14 bg-white dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 flex items-center px-4 justify-between shadow-sm z-10 transition-colors">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> {isAcademy ? 'Instructor Hub' : 'Squad Chat'}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col bg-slate-50 dark:bg-slate-900/50 transition-colors">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col items-start">
                <div className={`max-w-[90%] ${msg.user_id === currentUser?.id ? 'ml-auto' : ''}`}>
                  <div className="flex items-baseline gap-2 mb-1 justify-end">
                    <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{msg.sender_name}</span>
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-sm font-medium shadow-sm border-2 transition-colors ${
                      msg.user_id === currentUser?.id 
                        ? 'bg-indigo-500 text-white border-indigo-600 rounded-tr-sm' 
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder={isAcademy ? 'Ask for help...' : 'Message squad...'}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white p-2.5 flex items-center justify-center rounded-xl transition-all shadow-[0_4px_0_rgb(67,56,202)] hover:shadow-[0_2px_0_rgb(67,56,202)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}