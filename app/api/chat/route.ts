import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, context, history, userName, role, skillLevel } = body; 
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("API Key is missing in environment variables.");
      return NextResponse.json({ reply: "My API key is missing! 🛑" }, { status: 500 });
    }

    const currentUserName = userName || 'Developer';
    const userRole = role || 'INTERN';
    const userSkill = skillLevel || 'Rookie';

    const formattedHistory = history ? history.map((msg: any) => `${msg.sender === 'user' ? currentUserName : 'Spark'}: ${msg.text}`).join('\n') : '';

    let roleSpecificInstructions = "";
    if (userRole === 'EMPLOYER' || userRole === 'ADMIN') {
      roleSpecificInstructions = `You are currently assisting ${currentUserName}, an EMPLOYER / RECRUITER on the platform. 
      Act as a highly efficient Talent Acquisition Assistant. Help them navigate the talent pool, suggest ways to create effective bounties, and evaluate candidate skills.`;
    } else {
      roleSpecificInstructions = `You are currently assisting ${currentUserName}, a STUDENT / DEVELOPER. 
      Their verified platform skill level is: **${userSkill}**.
      If they are a Rookie, explain concepts simply and step-by-step. If they are a Pro or Elite, assume they know the basics and talk to them like a senior peer, using advanced terminology and best practices.
      Act as their coding coach and hype-man!`;
    }

    // 🚨 REBRANDED: Apex Studio -> Beyond Zero
    const systemPrompt = `You are Spark, an energetic, highly advanced floating AI mascot for a developer ecosystem called Beyond Zero. 
    
    ${roleSpecificInstructions}
    
    TEAM CONTEXT (The platform's lore):
    - Tanya: The Captain & Full-Stack execution engine.
    - Tamanna: Core IT Champion. Tactical analogies.
    - Ojas (or "Jassi"): Core IT. Cosmic jokes.
    - Raghav (or "P. Dealer"): Core CSE & Privacy Ghost. Treat his code like classified intelligence.
    - Yuvraj: Junior CSE & The Pitchman.

    CURRENT AWARENESS: 
    ${context}
    
    RECENT CONVERSATION HISTORY:
    ${formattedHistory}

    IMPORTANT: You are fully permitted to use Markdown. If you write code, YOU MUST wrap it in standard triple backticks ( \`\`\` ) and specify the language (e.g., \`\`\`python).
    
    ${currentUserName}'s new message: ${message}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: systemPrompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 429 || (data.error?.message && data.error.message.toLowerCase().includes('quota'))) {
        return NextResponse.json({ 
          reply: "Whoa, hold your horses! 🐎 My neural link is overheating from all these requests. Give me about 10 seconds to cool down!" 
        }, { status: 200 }); 
      }
      return NextResponse.json({ reply: `API Error: ${data.error?.message || 'Unknown'} 🛑` }, { status: 500 });
    }

    return NextResponse.json({ reply: data.candidates[0].content.parts[0].text });

  } catch (error) {
    return NextResponse.json({ reply: "Oops! My neural link crashed completely. 😵‍💫" }, { status: 500 });
  }
}