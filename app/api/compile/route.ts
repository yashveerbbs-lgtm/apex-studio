import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { script, language } = await request.json();

    // Map our Monaco languages to JDoodle's specific compiler codes
    const langMap: any = {
      'python': { lang: 'python3', versionIndex: '4' },
      'cpp': { lang: 'cpp17', versionIndex: '1' },
      'c': { lang: 'c', versionIndex: '5' },
      'java': { lang: 'java', versionIndex: '4' },
      'rust': { lang: 'rust', versionIndex: '4' }
    };

    const config = langMap[language];
    
    if (!config) {
      return NextResponse.json({ error: `Language '${language}' is not supported by the backend.` }, { status: 400 });
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
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: "Failed to connect to secure compiler container." }, { status: 500 });
  }
}