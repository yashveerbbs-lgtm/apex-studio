import { NextResponse } from 'next/server'
import vm from 'vm'
import { createClient } from '@supabase/supabase-js'

// 1. Initialize Master Admin Client (Bypasses RLS to read hidden answers)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { code, challengeId } = await req.json()

    if (!challengeId) return NextResponse.json({ success: false, error: 'Missing Challenge ID' })

    // 2. Fetch the hidden test cases for this specific puzzle
    const { data: testCases, error } = await supabaseAdmin
      .from('test_cases')
      .select('*')
      .eq('challenge_id', challengeId)

    if (error || !testCases || testCases.length === 0) {
      return NextResponse.json({ success: false, error: 'Failed to retrieve test cases.' })
    }

    let passed = 0
    const total = testCases.length

    // 3. The Verification Loop
    for (const testCase of testCases) {
      try {
        const sandbox: any = {}
        vm.createContext(sandbox)

        // Inject the candidate's code and trigger their 'solve' function with the raw input
        const executionScript = `
          ${code}
          // The platform automatically calls the candidate's function
          const result = solve(${testCase.input_data});
          result; // Return the result to the VM
        `
        
        // Execute securely
        const output = vm.runInContext(executionScript, sandbox, { timeout: 2000 })
        
        // Mathematically verify the answer
        if (String(output).trim() === String(testCase.expected_output).trim()) {
          passed++
        }
      } catch (execError: any) {
         console.error("Test Case Failed:", execError.message)
      }
    }

    // 4. Return Final Score
    return NextResponse.json({ success: true, passed, total })

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}