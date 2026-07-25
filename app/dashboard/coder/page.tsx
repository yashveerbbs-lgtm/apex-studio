'use client'
import { useState } from 'react'
import Editor from '@monaco-editor/react'

export default function CodeArena() {
  const [language, setLanguage] = useState('javascript')
  const [output, setOutput] = useState('// Console output will appear here...')
  const [code, setCode] = useState('// Write your algorithm here...\n\nfunction initializeSystem() {\n  console.log("System Online");\n}\n\ninitializeSystem();')

  function executeCode() {
    // Note: This is a frontend simulation. For secure execution later, 
    // we will route this payload to a backend compiler API (like Piston).
    try {
      if (language === 'javascript') {
        let consoleLogs: string[] = []
        const originalLog = console.log
        console.log = (...args) => {
          consoleLogs.push(args.join(' '))
        }
        
        // Execute the code
        new Function(code)()
        
        console.log = originalLog
        setOutput(consoleLogs.join('\n') || 'Execution complete. No output.')
      } else {
        setOutput(`Execution for ${language} requires backend compilation pipeline.`)
      }
    } catch (err: any) {
      setOutput(`RUNTIME ERROR: ${err.message}`)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-12 font-sans flex flex-col">
      <div className="flex justify-between items-end mb-6 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-400 uppercase tracking-widest mb-2">
            Live Coder
          </h1>
          <p className="text-gray-500 font-mono text-sm uppercase">Interactive Execution Environment</p>
        </div>
        
        <div className="flex gap-4">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white text-sm rounded focus:ring-green-500 focus:border-green-500 block p-2.5 font-mono outline-none"
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++</option>
          </select>

          <button 
            onClick={executeCode}
            className="bg-green-900/30 text-green-400 border border-green-800 hover:bg-green-800 hover:text-white px-8 py-2 rounded font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)]"
          >
            Run Code
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Editor Pane */}
        <div className="lg:col-span-2 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-gray-900 text-gray-500 text-xs font-mono p-2 border-b border-gray-800 uppercase tracking-widest">
            Editor // {language.toUpperCase()}
          </div>
          <Editor
            height="70vh"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'monospace',
              padding: { top: 20 },
            }}
          />
        </div>

        {/* Output Console Pane */}
        <div className="border border-gray-800 rounded-xl overflow-hidden bg-black flex flex-col shadow-2xl">
          <div className="bg-gray-900 text-gray-500 text-xs font-mono p-2 border-b border-gray-800 uppercase tracking-widest">
            Terminal Output
          </div>
          <div className="p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap overflow-y-auto h-full">
            {output}
          </div>
        </div>
      </div>
    </main>
  )
}