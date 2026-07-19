import { NextResponse } from 'next/server'
import vm from 'vm'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { code, challengeId, userId, email } = await req.json()

    if (!challengeId) return NextResponse.json({ success: false, error: 'Missing Challenge ID' })

    // 1. DYNAMIC REWARD: Fetch the exact points for this specific challenge
    const { data: challenge } = await supabaseAdmin
      .from('challenges')
      .select('points')
      .eq('id', challengeId)
      .single()

    const challengePoints = challenge?.points || 0

    const { data: testCases, error } = await supabaseAdmin
      .from('test_cases')
      .select('*')
      .eq('challenge_id', challengeId)

    if (error || !testCases || testCases.length === 0) {
      return NextResponse.json({ success: false, error: 'Failed to retrieve test cases.' })
    }

    let passed = 0
    const total = testCases.length

    for (const testCase of testCases) {
      try {
        const sandbox: any = {}
        vm.createContext(sandbox)

        const executionScript = `
          ${code}
          const result = solve(${testCase.input_data});
          result;
        `
        
        const output = vm.runInContext(executionScript, sandbox, { timeout: 2000 })
        
        if (String(output).trim() === String(testCase.expected_output).trim()) {
          passed++
        }
      } catch (execError: any) {
         console.error("Test Case Failed:", execError.message)
      }
    }

    // 2. THE DYNAMIC XP ENGINE
    if (passed === total && userId) {
       const { data: profile } = await supabaseAdmin.from('profiles').select('xp_balance').eq('id', userId).single()
       
       const currentXp = profile?.xp_balance || 0
       // Apply the dynamic points instead of a hardcoded 50
       const newXp = currentXp + challengePoints 

       await supabaseAdmin.from('profiles').upsert({ 
         id: userId, 
         email: email,
         xp_balance: newXp 
       })
    }

    // Pass the awarded points back to the frontend for the alert message
    return NextResponse.json({ success: true, passed, total, pointsAwarded: challengePoints })

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}