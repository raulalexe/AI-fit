module.exports = {
  projects: [
    {
      displayName: 'app',
      preset: 'jest-expo',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
      ],
      testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.expo/'],
      collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.stories.{ts,tsx}',
      ],
    },
    {
      displayName: 'server',
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/server'],
      testMatch: ['**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/server/tests/setup.ts'],
      moduleFileExtensions: ['ts', 'js', 'json'],
      transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/server/tsconfig.json' }],
      },
      modulePathIgnorePatterns: ['<rootDir>/AIFitnessApp/'],
    },
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};