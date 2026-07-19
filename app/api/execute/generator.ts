// app/api/execute/generator.ts

export interface TestCase {
  input: any[];
  expectedOutput: any;
}

export function generateDynamicTestCases(): TestCase[] {
  const testCases: TestCase[] = [];
  const numberOfTests = 5;

  for (let i = 0; i < numberOfTests; i++) {
    // Generate random constraints for a physics/work-rate logic problem
    // e.g., calculating final velocity given initial velocity, acceleration, and time
    // Formula: v = u + at
    const initialVelocity = Math.floor(Math.random() * 50) + 1; // 1 to 50 m/s
    const acceleration = Math.floor(Math.random() * 20) + 1; // 1 to 20 m/s^2
    const time = Math.floor(Math.random() * 10) + 1; // 1 to 10 seconds

    // The mathematically absolute expected answer
    const expectedVelocity = initialVelocity + (acceleration * time);

    testCases.push({
      input: [initialVelocity, acceleration, time],
      expectedOutput: expectedVelocity
    });
  }

  return testCases;
}