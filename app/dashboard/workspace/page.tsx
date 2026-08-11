'use client'
import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import {
  Send,
  Users,
  Terminal as TerminalIcon,
  Code2,
  Save,
  File as FileIcon,
  Plus,
  ChevronRight,
  CheckCircle2,
  Play,
  Trash2,
  Edit2,
  FilePlus,
  FolderPlus,
  Copy,
  UserPlus,
  GraduationCap,
  BookOpen,
  ScanSearch,
  EyeOff,
  X,
  Zap
} from 'lucide-react'
import { supabase } from '../../../utils/supabase'

import CertificateCard from './CertificateCard'

export default function EnterpriseWorkspace() {
  const [isMounted, setIsMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

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
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['Apex Multi-Language Engine ready...'])
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
    return () => window.removeEventListener('click', handleClick)
  }, [])

  // MULTIPLAYER REALTIME SYNC ENGINE
  useEffect(() => {
    if (!activeTeam) return

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

    return () => {
      supabase.removeChannel(room)
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
        success: 'Variables should be lowercase with underscores. Great job!',
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
        success: "You're a human calculator!",
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
      setTerminalOutput(['> Level unlocked. Read the tutorial to begin.'])
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
      // FIX: Changed url from /api/execute to /api/compile
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
      sender_name: currentUser.email?.split('@')[0] || 'Dev',
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

  if (!activeTeam) {
    return (
      <div className="h-full flex items-center justify-center bg-[#050505] text-white p-6 font-sans">
        <div className="max-w-md w-full bg-[#0a0a0a] border border-gray-800 p-8 rounded-xl shadow-2xl">
          <TerminalIcon className="w-12 h-12 text-blue-500 mb-6 mx-auto" />
          <h2 className="text-2xl font-bold text-center mb-6 tracking-tight">Workspace Initialization</h2>

          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Your Active Squads
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 mb-6">
              {userTeams.map((team) => (
                <div
                  key={team.id}
                  className="w-full flex items-center justify-between p-3 bg-[#111111] hover:bg-blue-900/20 border border-gray-800 hover:border-blue-500/50 rounded transition-all group cursor-pointer"
                  onClick={() => loadTeamWorkspace(team)}
                >
                  <span className="font-bold flex items-center gap-3 text-sm text-gray-200">
                    <Users className="w-4 h-4 text-blue-500" /> {team.name}
                  </span>

                  <div className="flex items-center gap-2">
                    {team.role === 'admin' && !team.name.startsWith('Academy:') && (
                      <>
                        <button
                          onClick={(e) => handleEditTeam(e, team)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-blue-400 p-1.5 rounded hover:bg-black/50 transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteTeam(e, team.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-1.5 rounded hover:bg-black/50 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              ))}

              {userTeams.length === 0 && (
                <div className="text-center py-6 border border-dashed border-gray-800 rounded">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
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
                className="flex-1 bg-[#111111] border border-gray-800 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
              <button
                type="submit"
                disabled={isCreatingTeam || !newTeamName.trim()}
                className="bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white px-5 py-2.5 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors shadow-lg"
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
    <div className="h-full flex flex-col bg-[#1e1e1e] text-white font-sans overflow-hidden relative">
      {/* 🚨 THE CERTIFICATE MODAL OVERLAY 🚨 */}
      {showCertificate && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="relative w-full max-w-5xl flex flex-col items-center animate-in zoom-in-95 duration-500">
            <div className="w-full flex justify-between items-end mb-6">
              <div className="text-left">
                <h2 className="text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                  Course Completed!
                </h2>
                <p className="text-gray-400 font-mono text-sm uppercase tracking-widest mt-1">
                  Credential generated and secured.
                </p>
              </div>

              <button
                onClick={() => setShowCertificate(false)}
                className="text-gray-500 hover:text-white bg-gray-900 hover:bg-gray-800 p-2 rounded-full transition-all border border-gray-800"
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
          className="absolute z-50 bg-[#252526] border border-[#454545] shadow-2xl py-1.5 w-60 text-[#cccccc] text-[13px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => {
              handleCreateFile()
              setContextMenu(null)
            }}
            className="w-full text-left px-6 py-1.5 hover:bg-[#04395e] hover:text-white flex items-center gap-2"
          >
            <FilePlus className="w-4 h-4" /> New File...
          </button>
          <button
            onClick={() => {
              handleCreateFolder()
              setContextMenu(null)
            }}
            className="w-full text-left px-6 py-1.5 hover:bg-[#04395e] hover:text-white flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" /> New Folder...
          </button>

          {contextMenu.node && (
            <>
              <div className="h-px bg-[#454545] my-1 mx-2"></div>
              <button
                onClick={() => {
                  handleRenameNode(contextMenu.node)
                  setContextMenu(null)
                }}
                className="w-full text-left px-6 py-1.5 hover:bg-[#04395e] hover:text-white flex justify-between items-center group"
              >
                <span className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4" /> Rename
                </span>
                <span className="text-gray-500 group-hover:text-gray-300 text-[11px]">F2</span>
              </button>
              <button
                onClick={() => {
                  handleDeleteNode(contextMenu.node)
                  setContextMenu(null)
                }}
                className="w-full text-left px-6 py-1.5 hover:bg-red-600 hover:text-white flex justify-between items-center group text-red-400"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete
                </span>
                <span className="text-gray-500 group-hover:text-gray-300 text-[11px]">Del</span>
              </button>
            </>
          )}
        </div>
      )}

      <header className="h-12 border-b border-gray-800 bg-[#181818] flex items-center justify-between px-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-300 font-bold text-sm">
            <Users className="w-4 h-4 text-blue-500" /> {activeTeam.name}
          </div>

          {!isAcademy && (
            <button
              onClick={handleInviteMember}
              className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded transition-colors"
            >
              <UserPlus className="w-3 h-3" /> Invite
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* 🚨 NEW: GOD MODE BYPASS BUTTON 🚨 */}
          {isAcademy && (
            <button
              onClick={() => setShowCertificate(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white text-xs font-bold px-4 py-1.5 rounded transition-all shadow-lg shadow-red-900/20 border border-red-500/30"
              title="God Mode: Instantly unlock certificate"
            >
              <Zap className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> God Mode: Skip
            </button>
          )}

          {isAcademy && !lessonPassed && (
            <button
              onClick={handleCheckCode}
              disabled={!activeFile || activeFile.name === 'LESSON.md'}
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-bold px-4 py-1.5 rounded transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 animate-in zoom-in duration-300"
            >
              <ScanSearch className="w-3.5 h-3.5" /> Check Code
            </button>
          )}

          {isAcademy && !isExamMode && !lessonPassed && (
            <button
              onClick={handleStartExam}
              disabled={!activeFile || activeFile.name === 'LESSON.md'}
              className="flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-bold px-4 py-1.5 rounded transition-all shadow-lg shadow-red-900/20 disabled:opacity-50"
            >
              <EyeOff className="w-3.5 h-3.5" /> Take Blindfold Test
            </button>
          )}

          {isAcademy && (
            <button
              onClick={handleNextLesson}
              disabled={!lessonPassed}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded transition-all shadow-lg ${
                lessonPassed
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'
                  : 'bg-gray-800 text-gray-500 opacity-50 cursor-not-allowed'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" /> Next Lesson
            </button>
          )}

          {isAcademy && <div className="h-4 w-px bg-gray-700 mx-1"></div>}

          <button
            onClick={executeCode}
            disabled={isExecuting || !activeFile || activeFile.name === 'LESSON.md'}
            className="flex items-center gap-1 bg-green-600/20 text-green-500 hover:bg-green-600 hover:text-white border border-green-600/50 text-xs font-bold px-3 py-1.5 rounded transition-all disabled:opacity-50"
          >
            <Play className="w-3 h-3" /> {isExecuting ? 'Compiling...' : 'Run Engine'}
          </button>

          <button ref={saveBtnRef} onClick={handleSaveActiveFile} className="hidden" />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div
          className="w-64 bg-[#181818] border-r border-gray-800 flex flex-col shrink-0"
          onContextMenu={(e) => handleContextMenu(e, null)}
        >
          <div className="h-8 flex items-center justify-between px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 mb-2">
            <span>Explorer</span>
            <div className="flex gap-2">
              <button onClick={handleCreateFile} className="hover:text-white">
                <FilePlus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pb-10">
            {nodes.map((node) => (
              <button
                key={node.id}
                onClick={() => !node.is_folder && setActiveFile(node)}
                onContextMenu={(e) => handleContextMenu(e, node)}
                className={`w-full flex items-center gap-2 px-4 py-1.5 text-sm transition-colors ${
                  activeFile?.id === node.id
                    ? 'bg-[#37373d] text-white'
                    : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200'
                }`}
              >
                <FileIcon
                  className={`w-4 h-4 shrink-0 ${
                    node.name.endsWith('.md') ? 'text-indigo-400' : 'text-gray-500'
                  }`}
                />
                <span className="truncate">{node.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col relative bg-[#1e1e1e]">
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {isAcademy && lessonNode && (
              <div
                className={`flex-1 flex flex-col border-r border-gray-800 transition-colors duration-500 ${
                  isExamMode ? 'bg-red-950/10' : ''
                }`}
              >
                <div className="flex bg-[#252526] overflow-x-auto border-b border-[#1e1e1e]">
                  <div
                    className={`px-4 py-2 text-xs font-mono border-t-2 flex items-center gap-2 bg-[#1e1e1e] ${
                      isExamMode ? 'border-red-500 text-red-400' : 'border-indigo-500 text-indigo-400'
                    }`}
                  >
                    <BookOpen className="w-3 h-3" /> {lessonNode.name}
                  </div>
                </div>
                <div className="flex-1 relative">
                  <Editor
                    height="100%"
                    language="markdown"
                    theme="vs-dark"
                    value={lessonNode.content}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: 'on',
                      padding: { top: 16 },
                      readOnly: true,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col">
              {activeFile && (!isAcademy || activeFile.name !== 'LESSON.md') ? (
                <>
                  <div className="flex bg-[#252526] overflow-x-auto border-b border-[#1e1e1e]">
                    <div className="px-4 py-2 text-xs font-mono border-t-2 border-blue-500 text-blue-400 flex items-center gap-2 bg-[#1e1e1e]">
                      <Code2 className="w-3 h-3" /> {activeFile.name}
                    </div>
                  </div>
                  <div className="flex-1 relative">
                    <Editor
                      height="100%"
                      language={activeFile.language}
                      theme="vs-dark"
                      value={activeFile.content}
                      onChange={handleEditorChange}
                      onMount={handleEditorDidMount}
                      options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', padding: { top: 16 } }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                  Select your code file to start typing.
                </div>
              )}
            </div>
          </div>

          <div className="h-48 bg-[#1e1e1e] border-t border-gray-800 flex flex-col shrink-0">
            <div className="h-8 bg-[#252526] flex items-center px-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-800 gap-2">
              <TerminalIcon className="w-3 h-3" /> Terminal Output
              <button onClick={() => setTerminalOutput([])} className="ml-auto hover:text-white">
                Clear
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 font-mono text-[13px] text-gray-300 space-y-1">
              {terminalOutput.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.includes('FAILED') ||
                    line.includes('☹️') ||
                    line.includes('Error') ||
                    line.includes('🚨')
                      ? 'text-red-400'
                      : line.includes('SUCCESS') || line.includes('🏆') || line.includes('🎯')
                      ? 'text-green-400 font-bold'
                      : line.includes('💡') || line.includes('🔥')
                      ? 'text-yellow-400'
                      : ''
                  }
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-80 border-l border-gray-800 bg-[#181818] flex flex-col shrink-0">
          <div className="h-10 bg-[#252526] border-b border-gray-800 flex items-center px-4 justify-between shadow-sm">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">
              {isAcademy ? 'Instructor Comms' : 'Squad Chat'}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col items-start">
                <div className={`max-w-[90%] ${msg.user_id === currentUser?.id ? 'ml-auto' : ''}`}>
                  <div className="flex items-baseline gap-2 mb-1 justify-end">
                    <span className="text-[10px] font-bold text-gray-400">{msg.sender_name}</span>
                  </div>
                  <div
                    className={`p-2.5 rounded text-sm ${
                      msg.user_id === currentUser?.id ? 'bg-blue-600 text-white' : 'bg-[#37373d] text-gray-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-800 bg-[#252526]">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder={isAcademy ? 'Ask Aparna or Yash for help...' : 'Message your squad...'}
                className="flex-1 bg-[#3c3c3c] border-transparent rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <button type="submit" className="p-2 bg-blue-600 text-white rounded hover:bg-blue-500">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}