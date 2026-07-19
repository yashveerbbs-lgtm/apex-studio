import { NextResponse } from 'next/server'
import vm from 'vm'

export async function POST(req: Request) {
  try {
    const { code } = await req.json()

    // 1. Create a secure container to catch the console output
    const output: string[] = []
    const sandbox = {
      console: {
        log: (...args: any[]) => output.push(args.join(' '))
      }
    }

    // 2. Initialize the isolated Virtual Machine environment
    vm.createContext(sandbox)

    // 3. Execute the code with a strict 2-second kill switch
    try {
      vm.runInContext(code, sandbox, { timeout: 2000 })
    } catch (execError: any) {
      // Catch infinite loops or syntax errors gracefully
      return NextResponse.json({ success: false, error: execError.message })
    }

    // 4. Return the raw output back to the Next.js frontend
    return NextResponse.json({ 
      success: true, 
      output: output.join('\n') || 'Execution complete, but no output was logged.',
      exitCode: 0
    })

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}