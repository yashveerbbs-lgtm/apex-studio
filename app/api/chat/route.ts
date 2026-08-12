import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API (Requires GEMINI_API_KEY in your .env.local file)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    // We give the AI a "System Prompt" so it acts like Spark and knows who it is talking to!
    const systemPrompt = `You are Spark, an energetic, highly advanced floating AI mascot for a developer ecosystem called Apex Studio. 
    You are currently assisting Yashveer Saini, the legendary developer who built you. 
    Keep your answers very short, punchy, friendly, and use emojis. 
    Do not use markdown formatting like **bold** because it will be displayed in a small chat bubble.
    User's message: ${message}`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    return NextResponse.json({ reply: responseText });
    
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { reply: "Oops! My neural link is acting up. Check your API key! 🛑" }, 
      { status: 500 }
    );
  }
}