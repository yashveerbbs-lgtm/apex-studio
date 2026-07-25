import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: Request) {
  try {
    // 🚨 MOVED INSIDE: This prevents the build-time crash! 🚨
    const resend = new Resend(process.env.RESEND_API_KEY)

    const { email, name, tier } = await request.json()

    let subject = ''
    let htmlContent = ''

    // 🟠 PRO TIER TEMPLATE (TOURNAMENT)
    if (tier === 'PRO') {
      subject = '🏆 MASSIVE CONGRATULATIONS: Apex Pro Champion Status Unlocked'
      htmlContent = `
        <div style="font-family: monospace; background-color: #050505; color: #ffffff; padding: 40px; text-align: center; border-top: 4px solid #ea580c;">
          <h1 style="color: #ea580c; text-transform: uppercase;">Pro Circuit Champion</h1>
          <p style="font-size: 18px;">Operative <strong>${name}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.6;">Absolute dominance. You successfully conquered the competitive reasoning window. Your algorithms didn't just compile—they shattered the leaderboard.</p>
          <h2 style="color: #ffffff; margin-top: 30px;">A Huge Congratulations to You! 🎉</h2>
          <p style="color: #a3a3a3;">Your Champion Credential is officially secured and verified in the global ledger.</p>
          
          <div style="margin: 40px auto; max-width: 500px; padding: 25px; background-color: #1a0f0a; border: 1px solid #ea580c; border-radius: 8px; text-align: left;">
            <h3 style="color: #ea580c; margin-top: 0; text-transform: uppercase;">Next Directive: Monetize Your Skills</h3>
            <p style="color: #d4d4d4; font-size: 14px; line-height: 1.5;">Don't let these elite logic skills sit idle. Apex Studio partners with top-tier tech firms to recruit Pro-ranked operatives. Check out our <strong>Elite Talent Pool</strong> services to see how we can fast-track your resume to our enterprise partners.</p>
          </div>

          <a href="https://apex-studio-rouge.vercel.app/portal" style="display: inline-block; padding: 14px 28px; background-color: #ea580c; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Claim Your PDF Credential</a>
        </div>
      `
    } 
    // 🔵 CORPORATE TIER TEMPLATE (OPPORTUNITIES)
    else if (tier === 'CORP') {
      subject = '🌐 ENTERPRISE VERIFIED: Nexus Dynamics Internship Completed'
      htmlContent = `
        <div style="font-family: monospace; background-color: #050505; color: #ffffff; padding: 40px; text-align: center; border-top: 4px solid #3b82f6;">
          <h1 style="color: #3b82f6; text-transform: uppercase;">Deployment Successful</h1>
          <p style="font-size: 18px;">Operative <strong>${name}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.6;">Incredible work pushing that task to production. You have successfully navigated the enterprise architecture and proven your capability in a high-stakes environment.</p>
          <h2 style="color: #ffffff; margin-top: 30px;">Massive Congratulations on Your Internship Clearance! 🚀</h2>
          <p style="color: #a3a3a3;">Your Nexus Dynamics Internship Verification letter has been signed and sealed.</p>
          
          <div style="margin: 40px auto; max-width: 500px; padding: 25px; background-color: #0a1120; border: 1px solid #3b82f6; border-radius: 8px; text-align: left;">
            <h3 style="color: #3b82f6; margin-top: 0; text-transform: uppercase;">Next Directive: Real-World Consulting</h3>
            <p style="color: #d4d4d4; font-size: 14px; line-height: 1.5;">You've proven you can handle corporate deployments. Apex Studio offers <strong>Freelance Systems Architecture</strong> services. Reach out to our command team to transition from simulated internships to paid, real-world client contracts.</p>
          </div>

          <a href="https://apex-studio-rouge.vercel.app/portal" style="display: inline-block; padding: 14px 28px; background-color: #3b82f6; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">View Official Letter</a>
        </div>
      `
    } 
    // 🟢 FREE TIER TEMPLATE (LIVE CODER)
    else {
      subject = '✅ MISSION ACCOMPLISHED: Welcome to the Apex Grid'
      htmlContent = `
        <div style="font-family: monospace; background-color: #050505; color: #ffffff; padding: 40px; text-align: center; border-top: 4px solid #22c55e;">
          <h1 style="color: #22c55e; text-transform: uppercase;">System Alert: Clearance Granted</h1>
          <p style="font-size: 18px;">Operative <strong>${name}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.6;">Your initial algorithm has passed all compilation checks. You have successfully breached the mainframe and secured your first tier of clearance.</p>
          <h2 style="color: #ffffff; margin-top: 30px;">Congratulations on completing the Open Hackathon! 💻</h2>
          <p style="color: #a3a3a3;">Your Participant Certificate is unlocked and ready for extraction.</p>
          
          <div style="margin: 40px auto; max-width: 500px; padding: 25px; background-color: #051a0a; border: 1px solid #22c55e; border-radius: 8px; text-align: left;">
            <h3 style="color: #22c55e; margin-top: 0; text-transform: uppercase;">Next Directive: Level Up Your Stack</h3>
            <p style="color: #d4d4d4; font-size: 14px; line-height: 1.5;">This is just the beginning. Apex Studio provides comprehensive <strong>Full-Stack Mastery Roadmaps</strong> and 1-on-1 code mentorship. Ready to compete for the Pro tier? Dive into our advanced training modules today.</p>
          </div>

          <a href="https://apex-studio-rouge.vercel.app/portal" style="display: inline-block; padding: 14px 28px; background-color: #22c55e; color: #111111; text-decoration: none; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Download Certificate</a>
        </div>
      `
    }

    const data = await resend.emails.send({
      from: 'Apex Studio <onboarding@resend.dev>', // Update this when you attach a custom domain to Resend
      to: [email],
      subject: subject,
      html: htmlContent
    })

    return NextResponse.json({ success: true, data })

  } catch (error) {
    return NextResponse.json({ success: false, error })
  }
}