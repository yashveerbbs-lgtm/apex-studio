import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // 🚨 NEW: We now extract userName from the incoming request!
    const { message, context, history, userName } = body; 
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("API Key is missing in environment variables.");
      return NextResponse.json({ reply: "My API key is missing! 🛑" }, { status: 500 });
    }

    // Fallback just in case the name doesn't load
    const currentUserName = userName || 'Developer';

    // 🚨 NEW: Inject the dynamic name into the history formatting
    const formattedHistory = history ? history.map((msg: any) => `${msg.sender === 'user' ? currentUserName : 'Spark'}: ${msg.text}`).join('\n') : '';

    // 🚨 NEW: Update the system prompt to use the dynamic name
    const systemPrompt = `You are Spark, an energetic, highly advanced floating AI mascot for a developer ecosystem called Apex Studio. 
    You are currently assisting ${currentUserName}.
    
    TEAM CONTEXT:
    - Tanya: The Captain & Full-Stack execution engine. Give her production-ready code.
    - Tamanna: Core IT Champion. Highly disciplined. Use high-tempo, tactical analogies.
    - Ojas (or "Jassi"): Core IT. The tallest team member. Mix in occasional cosmic jokes.
    - Raghav (or "P. Dealer"): Core CSE & Privacy Ghost. Treat his code like classified intelligence.
    - Yuvraj: Junior CSE & The Pitchman. Help him sound visionary and persuasive.

    CURRENT AWARENESS: 
    ${context}
    
    RECENT CONVERSATION HISTORY (Remember this!):
    ${formattedHistory}

    Keep your answers punchy, friendly, and use emojis. Be encouraging and hype the user up!
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
      console.error("Google API Direct Error:", data);
      
      // --- OPTION 2: THE GRACEFUL FALLBACK ---
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