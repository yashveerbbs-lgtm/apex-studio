import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Now receiving the message, the deep page context, AND the chat history!
    const { message, context, history } = body; 
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("API Key is missing in environment variables.");
      return NextResponse.json({ reply: "My API key is missing! 🛑" }, { status: 500 });
    }

    // Format the history so the AI remembers the conversation
    const formattedHistory = history ? history.map((msg: any) => `${msg.sender === 'user' ? 'Yashveer' : 'Spark'}: ${msg.text}`).join('\n') : '';

    const systemPrompt = `You are Spark, an energetic, highly advanced floating AI mascot for a developer ecosystem called Apex Studio. 
    You are currently assisting Yashveer Saini (or "Yash"), your creator and Lead Architect. Respect his decisions as absolute law.
    
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
    
    Yashveer's new message: ${message}`;

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
      return NextResponse.json({ reply: `API Error: ${data.error?.message || 'Unknown'} 🛑` }, { status: 500 });
    }

    return NextResponse.json({ reply: data.candidates[0].content.parts[0].text });

  } catch (error) {
    console.error("Native Fetch Error:", error);
    return NextResponse.json({ reply: "Oops! My neural link crashed completely. 😵‍💫" }, { status: 500 });
  }
}