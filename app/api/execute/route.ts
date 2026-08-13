import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { script, language } = await request.json();

    // Tripwire: This will print in your VERCEL LOGS!
    console.log("--- JDoodle API Check ---");
    console.log("Client ID:", process.env.JDOODLE_CLIENT_ID ? "Found ✅" : "MISSING ❌");
    console.log("Client Secret:", process.env.JDOODLE_CLIENT_SECRET ? "Found ✅" : "MISSING ❌");

    if (!process.env.JDOODLE_CLIENT_ID || !process.env.JDOODLE_CLIENT_SECRET) {
      return NextResponse.json({ error: "JDoodle API keys are missing in Vercel Environment Variables." }, { status: 500 });
    }

    const langMap: any = {
      'javascript': { lang: 'nodejs', versionIndex: '4' }, 
      'go': { lang: 'go', versionIndex: '4' },             
      'python': { lang: 'python3', versionIndex: '4' },
      'cpp': { lang: 'cpp17', versionIndex: '1' },
      'c': { lang: 'c', versionIndex: '5' },
      'java': { lang: 'java', versionIndex: '4' },
      'rust': { lang: 'rust', versionIndex: '4' }
    };

    const config = langMap[language];
    
    if (!config) {
      return NextResponse.json({ error: `Language '${language}' is not supported.` }, { status: 400 });
    }

    const response = await fetch('https://api.jdoodle.com/v1/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        script: script,
        language: config.lang,
        versionIndex: config.versionIndex
      })
    });

    const data = await response.json();

    // If JDoodle rejects our request (e.g., invalid keys, out of credits)
    if (!response.ok || data.error) {
      console.error("JDoodle Cloud Error:", data);
      return NextResponse.json({ error: `JDoodle Cloud Error: ${data.error || 'Unauthorized or Out of Quota'}` }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Execution Engine Fatal Error:", error);
    // WE CHANGED THIS ERROR MESSAGE! No more Docker lies!
    return NextResponse.json({ error: `Cloud Execution Failed: ${error.message}` }, { status: 500 });
  }
}