import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("API Key is missing in environment variables.");
      return NextResponse.json({ reply: "My API key is missing! 🛑" }, { status: 500 });
    }

    const systemPrompt = `You are Spark, an energetic, highly advanced floating AI mascot for a developer ecosystem called Apex Studio. 
    You are currently assisting Yashveer Saini, the legendary developer who built you. 
    Keep your answers very short, punchy, friendly, and use emojis. 
    Do not use markdown formatting like **bold** because it will be displayed in a small chat bubble.
    
    User's message: ${message}`;

    // Changed the URL to explicitly use gemini-pro which is stable on v1beta
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: systemPrompt }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Google API Direct Error:", data);
      return NextResponse.json({ reply: `API Error: ${data.error?.message || 'Unknown'} 🛑` }, { status: 500 });
    }

    const replyText = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ reply: replyText });

  } catch (error) {
    console.error("Native Fetch Error:", error);
    return NextResponse.json(
      { reply: "Oops! My neural link crashed completely. 😵‍💫" }, 
      { status: 500 }
    );
  }
}