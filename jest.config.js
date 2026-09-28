/** @type {import("jest").Config} */
module.exports = {
  transform: { "^.+\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tests/tsconfig.json" }] },
  testEnvironment: "node", // UI tests opt in to jsdom with a @jest-environment docblock
  roots: ["<rootDir>/tests"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    // Only `new Worker(new URL(..., import.meta.url))`, which Jest cannot parse; mocked in tests.
    "!src/worker/spawn.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "html", "lcov"],
  coverageThreshold: {
    global: { statements: 100, branches: 100, functions: 100, lines: 100 },
  },
};
