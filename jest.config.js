module.exports = {
  clearMocks: true,
  globals: {
    "ts-jest": {
         tsconfig: "tsconfig.test.json"
    }
  },
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testRunner: 'jest-circus/runner',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup-test-env.ts'],
  verbose: true,
}
