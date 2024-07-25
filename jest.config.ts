import nextJest from 'next/jest'

const createJestConfig = nextJest({
  dir: './',
})

export default createJestConfig({
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '@/auth': '<rootDir>/__tests__/mocks/auth.ts',
    '@auth/prisma-adapter': '<rootDir>/__tests__/mocks/adapter.ts',
    'next-auth/providers/credentials':
      '<rootDir>/__tests__/mocks/next-auth-providers-credentials.ts',
    'next-auth': '<rootDir>/__tests__/mocks/next-auth.ts',
  },
  testEnvironment: 'jsdom',
  testRegex: '.*\\.(test|spec)\\.(js|ts|tsx|jsx)$',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts', '<rootDir>/singleton.ts'],
  transform: {
    '^.+.[tj]sx?$': ['ts-jest', {}],
  },
})
