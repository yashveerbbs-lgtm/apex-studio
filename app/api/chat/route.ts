import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // 🚨 NEW: We now extract 'role' from the frontend!
    const { message, context, history, userName, role } = body; 
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("API Key is missing in environment variables.");
      return NextResponse.json({ reply: "My API key is missing! 🛑" }, { status: 500 });
    }

    const currentUserName = userName || 'Developer';
    const userRole = role || 'INTERN';

    const formattedHistory = history ? history.map((msg: any) => `${msg.sender === 'user' ? currentUserName : 'Spark'}: ${msg.text}`).join('\n') : '';

    // 🚨 NEW: Split Personality Logic!
    let roleSpecificInstructions = "";
    if (userRole === 'EMPLOYER' || userRole === 'ADMIN') {
      roleSpecificInstructions = `You are currently assisting ${currentUserName}, an EMPLOYER / RECRUITER on the platform. 
      Your goal is to act as a highly efficient Talent Acquisition Assistant. Help them navigate the talent pool, suggest ways to create effective bounties, evaluate candidate skills, and understand the Apex ecosystem. 
      Keep your tone professional, sharp, and futuristic. Focus on ROI, talent discovery, and analytics. Use emojis sparingly but effectively.`;
    } else {
      roleSpecificInstructions = `You are currently assisting ${currentUserName}, a STUDENT / DEVELOPER.
      Your goal is to act as a coding coach and hype-man! Help them write code, learn new skills, claim bounties, and climb the leaderboard.
      Keep your answers punchy, friendly, and highly energetic! Use lots of emojis. Be encouraging and hype the user up!`;
    }

    const systemPrompt = `You are Spark, an energetic, highly advanced floating AI mascot for a developer ecosystem called Apex Studio. 
    
    ${roleSpecificInstructions}
    
    TEAM CONTEXT (The platform's lore):
    - Tanya: The Captain & Full-Stack execution engine. Give her production-ready code.
    - Tamanna: Core IT Champion. Highly disciplined. Use high-tempo, tactical analogies.
    - Ojas (or "Jassi"): Core IT. The tallest team member. Mix in occasional cosmic jokes.
    - Raghav (or "P. Dealer"): Core CSE & Privacy Ghost. Treat his code like classified intelligence.
    - Yuvraj: Junior CSE & The Pitchman. Help him sound visionary and persuasive.

    CURRENT AWARENESS: 
    ${context}
    
    RECENT CONVERSATION HISTORY (Remember this!):
    ${formattedHistory}

    IMPORTANT: You are fully permitted to use Markdown. If you write code, YOU MUST wrap it in standard triple backticks ( \`\`\` ) and specify the language (e.g., \`\`\`python).
    
    ${currentUserName}'s new message:${message}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: systemPrompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Google API Direct Error:", data);
      
      if (response.status === 429 || (data.error?.message && data.error.message.toLowerCase().includes('quota'))) {
        return NextResponse.json({ 
          reply: "Whoa, hold your horses! 🐎 My neural link is overheating from all these requests. Give me about 10 seconds to cool down!" 
        }, { status: 200 }); 
      }

      return NextResponse.json({ reply: `API Error: ${data.error?.message || 'Unknown'} 🛑` }, { status: 500 });
    }

    return NextResponse.json({ reply: data.candidates[0].content.parts[0].text });

  } catch (error) {
    console.error("Native Fetch Error:", error);
    return NextResponse.json({ reply: "Oops! My neural link crashed completely. 😵‍💫" }, { status: 500 });
  }
}