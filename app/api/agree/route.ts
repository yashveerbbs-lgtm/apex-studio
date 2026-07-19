import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { userId, email } = await req.json()

    if (!userId) return NextResponse.json({ success: false, error: 'Missing User ID' })

    // Insert the legal agreement record securely via the backend
    const { error } = await supabaseAdmin
      .from('legal_agreements')
      .insert([
        { 
          user_id: userId, 
          agreement_type: 'NDA_AND_IP_ASSIGNMENT',
          // IP address tracking can be added here later for additional legal verification
        }
      ])

    if (error) {
      if (error.code === '23505') {
        // 23505 is the Postgres code for unique violation (they already signed)
        return NextResponse.json({ success: true, message: 'Already signed' })
      }
      return NextResponse.json({ success: false, error: error.message })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}