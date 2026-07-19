import { NextResponse } from 'next/server';
import { generateDynamicTestCases } from './generator';

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();

    if (!code) {
      return NextResponse.json({ success: false, error: "No code provided." }, { status: 400 });
    }

    // 1. Generate the dynamic test cases
    const dynamicTestCases = generateDynamicTestCases();
    let passedCount = 0;
    const totalTests = dynamicTestCases.length;
    let results = [];

    // 2. Loop through tests and send them to the secure Execution Engine
    for (const testCase of dynamicTestCases) {
      try {
        // Append the specific function call to the user's code based on the language
        let executableCode = code;
        if (language === 'javascript' || language === 'typescript') {
          executableCode += `\nconsole.log(calculateVelocity(${testCase.input.join(', ')}));`;
        } else if (language === 'python') {
          executableCode += `\nprint(calculate_velocity(${testCase.input.join(', ')}))`;
        } else {
           return NextResponse.json({ success: false, error: "Unsupported language" }, { status: 400 });
        }

        // Send the payload to the secure execution sandbox (e.g., Piston API)
        const executeResponse = await fetch('https://emkc.org/api/v2/piston/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: language === 'python' ? 'python' : 'javascript',
            version: language === 'python' ? '3.10.0' : '18.15.0',
            files: [{ content: executableCode }]
          })
        });

        const executeData = await executeResponse.json();
        
        // Extract the console output from the sandbox
        const output = executeData.run?.stdout?.trim();
        const errorOutput = executeData.run?.stderr?.trim();

        // Check if their calculated output matches the procedurally generated absolute answer
        const passed = output === String(testCase.expectedOutput);
        if (passed) passedCount++;

        results.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: errorOutput || output || "No output",
          passed
        });

      } catch (err: any) {
        results.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: "Network/Execution Error",
          error: err.message,
          passed: false
        });
      }
    }

    const allPassed = passedCount === totalTests;

    return NextResponse.json({ 
      success: true, 
      passed: allPassed, 
      score: `${passedCount}/${totalTests}`,
      results 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}