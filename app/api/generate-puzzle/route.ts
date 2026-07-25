import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Logic to generate a random physics or math problem
  const problemTypes = ['PHYSICS', 'CALCULUS', 'LOGIC'];
  const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
  
  let question = "";
  let solution = 0;

  if (type === 'PHYSICS') {
    const v = Math.floor(Math.random() * 50) + 10; // velocity
    const t = Math.floor(Math.random() * 10) + 2;  // time
    question = `A particle travels at a constant velocity of ${v} m/s for ${t} seconds. What is the total distance traveled?`;
    solution = v * t;
  } else if (type === 'CALCULUS') {
    const n = Math.floor(Math.random() * 5) + 2;
    question = `Find the derivative of f(x) = x^${n} at x = 1. (Value of n*x^(n-1))`;
    solution = n;
  } else {
    const a = Math.floor(Math.random() * 20);
    const b = Math.floor(Math.random() * 20);
    question = `If A=${a} and B=${b}, calculate (A + B) * 2.`;
    solution = (a + b) * 2;
  }

  return NextResponse.json({
    type,
    question,
    solution,
    timestamp: new Date().toISOString()
  });
}